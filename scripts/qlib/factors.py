"""
factors.py — Alpha158 factor analysis pipeline for the My_Data vault.

Phase 2 module: computes Qlib's 158 technical alpha factors for a given
instrument universe, calculates Information Coefficient (IC) and ICIR per
factor, and returns structured results for the report writer.

Typical usage:
    from scripts.qlib.factors import run_factor_analysis, run_thesis_factors

    result = run_factor_analysis(["AAPL", "MSFT", "GOOGL"])
    result = run_thesis_factors("Housing Supply Correction")
"""

from __future__ import annotations

import logging
import sys
import warnings
from datetime import datetime
from pathlib import Path
from typing import Any

from common import (
    build_instrument_config as _shared_build_instrument_config,
    ensure_qlib_init as _shared_ensure_qlib_init,
    filter_available_instruments as _shared_filter_available_instruments,
    today as _shared_today,
)

# Ensure sibling modules are importable regardless of working directory
_QLIB_DIR = str(Path(__file__).resolve().parent)
if _QLIB_DIR not in sys.path:
    sys.path.insert(0, _QLIB_DIR)

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Vault / data-directory helpers (mirrors setup.py conventions)
# ---------------------------------------------------------------------------



def _today() -> str:
    return _shared_today()


# ---------------------------------------------------------------------------
# Qlib initialisation guard
# ---------------------------------------------------------------------------

def _ensure_qlib_init() -> None:
    _shared_ensure_qlib_init()



# ---------------------------------------------------------------------------
# Instrument filtering
# ---------------------------------------------------------------------------

def _filter_available_instruments(tickers: list[str]) -> tuple[list[str], list[str]]:
    """Return (available, skipped) after checking which tickers exist in Qlib.

    Qlib stores data by uppercased symbol.  Any ticker not in the loaded
    calendar/instruments is removed and logged as a warning so the caller
    knows exactly what was dropped.
    """
    try:
        from qlib.data import D  # type: ignore

        instruments = D.instruments(market="all")
        all_instruments: set[str] = set(
            D.list_instruments(instruments=instruments, as_list=True)
        )
    except Exception:  # noqa: BLE001
        # If we can't enumerate instruments, pass everything through; the
        # DataHandler will raise its own error for truly missing symbols.
        logger.warning(
            "Could not enumerate Qlib instruments — skipping pre-filter step."
        )
        return list(tickers), []

    upper_map = {t.upper(): t for t in tickers}
    available = [orig for upper, orig in upper_map.items() if upper in all_instruments]
    skipped = [orig for upper, orig in upper_map.items() if upper not in all_instruments]

    if skipped:
        logger.warning(
            "The following tickers are not in Qlib's data and will be skipped: %s",
            skipped,
        )

    return available, skipped


# ---------------------------------------------------------------------------
# Instrument config builder
# ---------------------------------------------------------------------------

def _build_instrument_config(
    tickers: list[str],
    start_date: str,
    end_date: str,
) -> dict:
    """Build a Qlib-compatible instruments config dict from a ticker list.

    Qlib's DataHandler expects either a market string ("csi300") or a dict of
    {symbol: [(start, end), ...]} pairs.  We construct the latter so that
    arbitrary ticker lists work without needing a pre-registered market.
    """
    import pandas as pd  # type: ignore

    start = pd.Timestamp(start_date)
    end = pd.Timestamp(end_date)
    return {ticker: [(start, end)] for ticker in tickers}


# Use the shared implementations to keep factors/backtest/scorer aligned.
_filter_available_instruments = _shared_filter_available_instruments
_build_instrument_config = _shared_build_instrument_config


# ---------------------------------------------------------------------------
# Alpha158 feature extraction
# ---------------------------------------------------------------------------

def _load_alpha158_features(
    tickers: list[str],
    start_date: str,
    end_date: str,
) -> "pd.DataFrame":  # type: ignore[name-defined]  # noqa: F821
    """Return a DataFrame of Alpha158 features indexed by (datetime, instrument).

    Raises ValueError if no data is returned for the requested universe/window.
    """
    import pandas as pd  # type: ignore
    from qlib.contrib.data.handler import Alpha158  # type: ignore

    # Build a Qlib-compatible instruments config using D.instruments
    from qlib.data import D as _D  # type: ignore

    # Create an instrument list that Qlib understands:
    # Use the features API directly instead of Alpha158 handler for more control
    # Alpha158 defines 158 formulaic features — we replicate the core approach
    # by fetching raw OHLCV and computing a representative subset of factors
    handler = Alpha158(
        instruments=_build_instrument_config(tickers, start_date, end_date),
        start_time=start_date,
        end_time=end_date,
        fit_start_time=start_date,
        fit_end_time=end_date,
        infer_processors=[],   # keep raw features for IC calculation
        learn_processors=[],
    )

    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        features: pd.DataFrame = handler.fetch(col_set="feature")

    if features is None or features.empty:
        raise ValueError(
            f"Alpha158 returned no data for universe={tickers}, "
            f"start={start_date}, end={end_date}. "
            "Check that setup.py has been run and the date range is valid."
        )

    return features


# ---------------------------------------------------------------------------
# Forward-return computation
# ---------------------------------------------------------------------------

def _compute_forward_returns(
    tickers: list[str],
    start_date: str,
    end_date: str,
    lookahead: int = 1,
) -> "pd.Series":  # type: ignore[name-defined]  # noqa: F821
    """Compute next-N-day percentage returns for the universe.

    Returns a Series indexed by (datetime, instrument) aligned to the
    feature DataFrame so IC can be calculated via .corr().
    """
    import pandas as pd  # type: ignore
    from qlib.data import D  # type: ignore

    # Fetch close prices; Qlib field names use $ prefix
    close_df: pd.DataFrame = D.features(
        tickers,
        ["$close"],
        start_time=start_date,
        end_time=end_date,
        freq="day",
    )

    close_df.columns = ["close"]
    # Group by instrument and shift to get forward returns
    close_df["fwd_ret"] = (
        close_df.groupby(level="instrument")["close"]
        .pct_change(periods=lookahead)
        .shift(-lookahead)
    )

    return close_df["fwd_ret"].dropna()


# ---------------------------------------------------------------------------
# IC / ICIR calculation
# ---------------------------------------------------------------------------

def _compute_ic_series(
    features: "pd.DataFrame",  # noqa: F821
    forward_returns: "pd.Series",  # noqa: F821
) -> dict[str, dict[str, float]]:
    """Calculate daily IC and ICIR for each factor column.

    IC per day = cross-sectional Spearman rank correlation between the factor
    values and forward returns across instruments.
    ICIR = mean(IC) / std(IC) — measures consistency.

    Returns {factor_name: {"ic": float, "icir": float}}.
    """
    import numpy as np  # type: ignore
    import pandas as pd  # type: ignore

    # Align on common index
    aligned = features.join(forward_returns.rename("fwd_ret"), how="inner")
    if aligned.empty or "fwd_ret" not in aligned.columns:
        return {}

    factor_cols = [c for c in aligned.columns if c != "fwd_ret"]
    if not factor_cols:
        return {}

    daily_corr_rows: list["pd.Series"] = []

    # Iterate once per date, not once per factor per date. This keeps the
    # simulator responsive on long windows while preserving the same IC math.
    for _, group in aligned.groupby(level="datetime", sort=False):
        if len(group) < 5:
            continue

        ranked_returns = group["fwd_ret"].rank()
        ranked_factors = group[factor_cols].rank()
        daily_corr = ranked_factors.corrwith(ranked_returns, axis=0)

        valid_counts = ranked_factors.notna().mul(ranked_returns.notna(), axis=0).sum(axis=0)
        daily_corr[valid_counts < 5] = np.nan
        daily_corr_rows.append(daily_corr)

    if not daily_corr_rows:
        return {col: {"ic": 0.0, "icir": 0.0} for col in factor_cols}

    daily_corr_frame = pd.DataFrame(daily_corr_rows, columns=factor_cols)
    results: dict[str, dict[str, float]] = {}

    for col in factor_cols:
        ic_series = daily_corr_frame[col].dropna()
        if ic_series.empty:
            results[col] = {"ic": 0.0, "icir": 0.0}
            continue

        mean_ic = float(ic_series.mean())
        std_ic = float(ic_series.std(ddof=0))
        icir = mean_ic / std_ic if std_ic > 1e-9 else 0.0
        results[col] = {"ic": round(mean_ic, 6), "icir": round(icir, 4)}

    return results


# ---------------------------------------------------------------------------
# Result assembly
# ---------------------------------------------------------------------------

def _assemble_result(
    universe_name: str,
    tickers: list[str],
    skipped: list[str],
    start_date: str,
    end_date: str,
    benchmark: str,
    ic_data: dict[str, dict[str, float]],
) -> dict[str, Any]:
    """Build the structured result dict from raw IC data."""
    import numpy as np  # type: ignore

    # Build ranked factor list (rank by absolute IC descending)
    sorted_factors = sorted(
        ic_data.items(),
        key=lambda kv: abs(kv[1]["ic"]),
        reverse=True,
    )

    factors: list[dict[str, Any]] = [
        {
            "name": name,
            "ic": data["ic"],
            "icir": data["icir"],
            "rank": rank,
        }
        for rank, (name, data) in enumerate(sorted_factors, start=1)
    ]

    top_factors = factors[:10]

    all_ics = [f["ic"] for f in factors]
    positive_ic_count = sum(1 for ic in all_ics if ic > 0)
    avg_ic = float(np.mean(all_ics)) if all_ics else 0.0
    best = factors[0] if factors else {}

    return {
        "universe": universe_name,
        "tickers": tickers,
        "skipped_tickers": skipped,
        "run_date": _today(),
        "start_date": start_date,
        "end_date": end_date,
        "benchmark": benchmark,
        "factors": factors,
        "top_factors": top_factors,
        "summary": {
            "total_factors": len(factors),
            "positive_ic_count": positive_ic_count,
            "avg_ic": round(avg_ic, 6),
            "best_factor": best.get("name", ""),
            "best_ic": best.get("ic", 0.0),
        },
    }


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def run_factor_analysis(
    tickers: list[str],
    universe_name: str = "custom",
    start_date: str = "2024-01-01",
    end_date: str | None = None,
    benchmark: str = "SPY",
) -> dict[str, Any]:
    """Run Alpha158 factor analysis on the given universe.

    Parameters
    ----------
    tickers:
        List of ticker symbols (e.g. ["AAPL", "MSFT"]).
    universe_name:
        Human-readable label for the universe, included in the result dict.
    start_date:
        ISO date string for the start of the analysis window (inclusive).
    end_date:
        ISO date string for the end of the analysis window (inclusive).
        Defaults to today's date.
    benchmark:
        Benchmark symbol for reference (stored in result; not used in IC
        calculation itself).  Default "SPY" for US markets.

    Returns
    -------
    dict with keys:
        universe, tickers, skipped_tickers, run_date, start_date, end_date,
        benchmark, factors (list of {name, ic, icir, rank}), top_factors
        (top 10 by IC), summary (total_factors, positive_ic_count, avg_ic,
        best_factor, best_ic).

    Raises
    ------
    RuntimeError
        If Qlib has not been initialised (i.e. setup.py not run).
    ValueError
        If Alpha158 returns no data for the requested universe/window.
    """
    if end_date is None:
        end_date = _today()

    if not tickers:
        raise ValueError("tickers must be a non-empty list of ticker symbols.")

    _ensure_qlib_init()

    # 1. Filter to instruments actually present in Qlib's data
    available, skipped = _filter_available_instruments(tickers)

    if not available:
        raise ValueError(
            "None of the requested tickers are available in Qlib's data: "
            f"{tickers}. Run setup.py to download market data."
        )

    logger.info(
        "Running Alpha158 on %d instruments (%d skipped) from %s to %s",
        len(available),
        len(skipped),
        start_date,
        end_date,
    )

    # 2. Extract Alpha158 features
    features = _load_alpha158_features(available, start_date, end_date)

    # 3. Compute forward returns (next-day)
    fwd_returns = _compute_forward_returns(available, start_date, end_date, lookahead=1)

    # 4. Calculate IC / ICIR per factor
    ic_data = _compute_ic_series(features, fwd_returns)

    if not ic_data:
        raise ValueError(
            "IC computation returned no results. The date window may be too "
            "narrow or forward returns could not be aligned with features."
        )

    # 5. Assemble and return structured result
    return _assemble_result(
        universe_name=universe_name,
        tickers=available,
        skipped=skipped,
        start_date=start_date,
        end_date=end_date,
        benchmark=benchmark,
        ic_data=ic_data,
    )


def run_thesis_factors(
    thesis_name: str,
    start_date: str = "2024-01-01",
    end_date: str | None = None,
    benchmark: str = "SPY",
) -> dict[str, Any]:
    """Convenience wrapper: load thesis tickers from vault, run factor analysis.

    Parameters
    ----------
    thesis_name:
        Case-insensitive substring matched against thesis filenames in
        10_Theses/ (e.g. "Housing Supply Correction").
    start_date:
        Start of the analysis window (ISO date string).
    end_date:
        End of the analysis window.  Defaults to today.
    benchmark:
        Benchmark symbol.  Defaults to "SPY".

    Returns
    -------
    Same dict structure as run_factor_analysis(), with universe set to
    the matched thesis name.

    Raises
    ------
    ValueError
        If no thesis matching thesis_name is found, or the thesis has no
        core_entities tickers.
    RuntimeError
        If Qlib has not been initialised.
    """
    from universe import get_thesis_tickers  # type: ignore

    tickers = get_thesis_tickers(thesis_name)

    if not tickers:
        raise ValueError(
            f"No tickers found for thesis '{thesis_name}'. "
            "Check that the thesis file exists in 10_Theses/ and has a "
            "non-empty core_entities field."
        )

    return run_factor_analysis(
        tickers=tickers,
        universe_name=thesis_name,
        start_date=start_date,
        end_date=end_date,
        benchmark=benchmark,
    )


# ---------------------------------------------------------------------------
# Smoke-test entrypoint
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import json

    TEST_UNIVERSE = ["AAPL", "MSFT", "GOOGL"]
    TEST_START = "2024-01-01"
    TEST_END = "2024-06-30"

    print("=" * 60)
    print("  Alpha158 Factor Analysis — smoke test")
    print(f"  Universe : {TEST_UNIVERSE}")
    print(f"  Window   : {TEST_START} → {TEST_END}")
    print("=" * 60)

    try:
        result = run_factor_analysis(
            tickers=TEST_UNIVERSE,
            universe_name="smoke_test",
            start_date=TEST_START,
            end_date=TEST_END,
        )
        print("\n[OK] Analysis complete.\n")
        print(f"  Total factors : {result['summary']['total_factors']}")
        print(f"  Positive IC   : {result['summary']['positive_ic_count']}")
        print(f"  Average IC    : {result['summary']['avg_ic']:.4f}")
        print(f"  Best factor   : {result['summary']['best_factor']}  "
              f"(IC={result['summary']['best_ic']:.4f})")
        print(f"\nSkipped tickers: {result['skipped_tickers'] or 'none'}")
        print("\nTop 5 factors:")
        for f in result["top_factors"][:5]:
            print(f"  #{f['rank']:>3}  {f['name']:<20}  IC={f['ic']:+.4f}  ICIR={f['icir']:+.4f}")
    except RuntimeError as exc:
        print(f"\n[SETUP REQUIRED] {exc}")
    except ValueError as exc:
        print(f"\n[DATA ERROR] {exc}")
    except Exception as exc:  # noqa: BLE001
        print(f"\n[ERROR] {exc}")
        raise
