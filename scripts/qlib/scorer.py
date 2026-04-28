"""
scorer.py — IC-weighted Alpha158 stock scorer for the My_Data vault.

Scores individual stocks using the top Alpha158 factors weighted by their
Information Coefficient (IC) from prior factor analysis reports. Produces
ranked watchlists and threshold-based alerts.

Typical usage:
    from scripts.qlib.scorer import score_thesis, score_all_theses

    result = score_thesis("Housing Supply Correction")
    all_results = score_all_theses()
"""

from __future__ import annotations

import logging
import re
import sys
import warnings
from datetime import date, timedelta
from pathlib import Path
from typing import Any

from common import QUANT_DIR as _QUANT_DIR
from common import (
    ensure_qlib_init as _shared_ensure_qlib_init,
    today as _shared_today,
)

# Ensure sibling modules are importable regardless of working directory
_QLIB_DIR = str(Path(__file__).resolve().parent)
if _QLIB_DIR not in sys.path:
    sys.path.insert(0, _QLIB_DIR)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Vault / data-directory helpers
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# Qlib initialisation guard
# ---------------------------------------------------------------------------

def _ensure_qlib_init() -> None:
    """Initialise Qlib once per process using the vault's .qlib_data directory."""
    _shared_ensure_qlib_init()


def _today() -> str:
    return _shared_today()


# ---------------------------------------------------------------------------
# Factor weight loading (from prior report markdown)
# ---------------------------------------------------------------------------

# Matches table rows like: | IMXD60 | -0.2125 | 1 |
_FACTOR_ROW_RE = re.compile(
    r"^\|\s*([A-Z0-9_]+)\s*\|\s*(-?[\d.]+)\s*\|\s*(\d+)\s*\|"
)


def _load_factor_weights(thesis_name: str, top_n: int = 5) -> list[dict]:
    """Find the latest factor report for this thesis and parse the top N factors.

    Searches 05_Data_Pulls/Quant/ for files matching *_Qlib_Factors_*.md,
    matches the thesis name as a case-insensitive substring, picks the latest
    by YYYY-MM-DD date prefix, and parses the Factor Scores table.

    Returns a list of dicts: [{"name": "IMXD60", "ic": -0.2125, "rank": 1}, ...]
    sorted by |IC| descending, limited to top_n entries.

    Raises ValueError if no matching report is found.
    """
    if not _QUANT_DIR.exists():
        raise ValueError(
            f"Quant data directory not found: {_QUANT_DIR}. "
            "Run factor analysis first: node scripts/run.mjs qlib factors"
        )

    from report import _sanitize_filename_segment  # type: ignore

    query = thesis_name.strip().lower()
    safe_query = _sanitize_filename_segment(thesis_name).lower()
    candidates: list[tuple[str, Path]] = []

    for md_file in _QUANT_DIR.glob("*_Qlib_Factors_*.md"):
        stem = md_file.stem  # e.g. "2026-03-31_Qlib_Factors_Housing"
        # Extract date prefix (first 10 chars) and thesis portion
        parts = stem.split("_Qlib_Factors_", maxsplit=1)
        if len(parts) != 2:
            continue
        date_prefix, thesis_part = parts
        safe_part = _sanitize_filename_segment(thesis_part).lower()
        if (
            query in thesis_part.lower()
            or thesis_part.lower() in query
            or safe_query in safe_part
            or safe_part in safe_query
        ):
            candidates.append((date_prefix, md_file))

    if not candidates:
        raise ValueError(
            f"No factor report found for thesis '{thesis_name}' in {_QUANT_DIR}.\n"
            "Run: node scripts/run.mjs qlib factors --thesis \"<thesis name>\""
        )

    # Pick the latest report by date prefix (lexicographic sort works for ISO dates)
    candidates.sort(key=lambda x: x[0], reverse=True)
    _, latest_report = candidates[0]

    logger.info("Loading factor weights from: %s", latest_report.name)

    # Parse the Factor Scores markdown table
    raw_factors: list[dict] = []
    text = latest_report.read_text(encoding="utf-8")

    for line in text.splitlines():
        m = _FACTOR_ROW_RE.match(line.strip())
        if m:
            name = m.group(1)
            ic = float(m.group(2))
            rank = int(m.group(3))
            raw_factors.append({"name": name, "ic": ic, "rank": rank})

    if not raw_factors:
        raise ValueError(
            f"Could not parse any factor rows from {latest_report}. "
            "Expected table rows like: | IMXD60 | -0.2125 | 1 |"
        )

    # Sort by absolute IC descending, return top N
    raw_factors.sort(key=lambda f: abs(f["ic"]), reverse=True)
    return raw_factors[:top_n]


# ---------------------------------------------------------------------------
# Feature loading
# ---------------------------------------------------------------------------

def _get_latest_features(tickers: list[str], lookback_days: int = 90) -> "pd.DataFrame":  # noqa: F821
    """Load Alpha158 features for the last lookback_days.

    Returns DataFrame indexed by (datetime, instrument).
    """
    from factors import _load_alpha158_features, _build_instrument_config  # type: ignore

    end_date = _today()
    start_dt = date.today() - timedelta(days=lookback_days)
    start_date = start_dt.isoformat()

    logger.info(
        "Loading Alpha158 features for %d tickers from %s to %s",
        len(tickers),
        start_date,
        end_date,
    )

    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        features = _load_alpha158_features(tickers, start_date, end_date)

    return features


# ---------------------------------------------------------------------------
# Composite score computation
# ---------------------------------------------------------------------------

def _compute_composite_scores(
    features: "pd.DataFrame",  # noqa: F821
    factor_weights: list[dict],
) -> "pd.DataFrame":  # noqa: F821
    """Compute IC-weighted composite scores for all instruments on the latest date.

    For each factor:
    - Rank instruments cross-sectionally (ascending, so rank 1 = smallest value)
    - When IC is NEGATIVE: a lower raw value predicts higher returns, so we
      want rank 1 (smallest) to become the highest-scoring. We flip by:
      flipped_rank = (N + 1 - rank)
    - Composite = sum of (adjusted_rank * abs(ic)) over all factors
    - Normalize composite to 0-100 scale (0 = worst, 100 = best)

    Returns DataFrame with columns:
        ticker, composite_score (0-100), rank, and one column per factor (raw value)
    """
    import numpy as np  # type: ignore
    import pandas as pd  # type: ignore

    # Extract the latest cross-section
    latest_date = features.index.get_level_values("datetime").max()
    cross_section = features.xs(latest_date, level="datetime").copy()

    if cross_section.empty:
        raise ValueError(
            f"No cross-sectional data found for the latest date ({latest_date}). "
            "Features DataFrame may be empty."
        )

    n_instruments = len(cross_section)

    # Validate that requested factors exist in the features
    available_factors = [
        fw for fw in factor_weights
        if fw["name"] in cross_section.columns
    ]
    missing = [fw["name"] for fw in factor_weights if fw["name"] not in cross_section.columns]
    if missing:
        logger.warning("Factors not found in Alpha158 features, skipping: %s", missing)

    if not available_factors:
        raise ValueError(
            f"None of the factor weight columns {[fw['name'] for fw in factor_weights]} "
            "exist in the Alpha158 feature set."
        )

    composite = pd.Series(0.0, index=cross_section.index)

    for fw in available_factors:
        col = fw["name"]
        ic = fw["ic"]
        abs_ic = abs(ic)

        col_data = cross_section[col].copy()
        # Rank ascending: rank 1 = smallest value
        ranked = col_data.rank(method="average", ascending=True)

        if ic < 0:
            # Negative IC: smaller raw value → higher return
            # Flip so that the smallest value gets rank N (highest composite contribution)
            ranked = (n_instruments + 1) - ranked

        composite = composite + (ranked * abs_ic)

    # Normalize to 0-100
    c_min = composite.min()
    c_max = composite.max()
    if c_max > c_min:
        normalized = 100.0 * (composite - c_min) / (c_max - c_min)
    else:
        normalized = pd.Series(50.0, index=composite.index)

    # Build result DataFrame
    result_rows: list[dict] = []
    for instrument in cross_section.index:
        row: dict[str, Any] = {
            "ticker": instrument,
            "composite_score": round(float(normalized[instrument]), 2),
        }
        for fw in available_factors:
            col = fw["name"]
            raw_val = cross_section.loc[instrument, col]
            row[col] = float(raw_val) if not (
                hasattr(raw_val, "__class__") and raw_val.__class__.__name__ == "float"
                and str(raw_val) == "nan"
            ) else None
        result_rows.append(row)

    result_df = pd.DataFrame(result_rows)
    result_df = result_df.sort_values("composite_score", ascending=False).reset_index(drop=True)
    result_df.insert(2, "rank", range(1, len(result_df) + 1))

    return result_df


# ---------------------------------------------------------------------------
# Signal evaluation
# ---------------------------------------------------------------------------

def _evaluate_signals(
    scored_stocks: "pd.DataFrame",  # noqa: F821
    features: "pd.DataFrame",  # noqa: F821
    factor_weights: list[dict],
) -> list[dict]:
    """Generate threshold-based alerts for the scored universe.

    Alert types:
    - FACTOR_BUY_SIGNAL: top factor value is > 2 std devs from its 60-day mean
      (mean-reversion opportunity). Direction depends on IC sign.
    - FACTOR_STRONG_BUY: top quartile composite score AND best factor in extreme territory.
    - FACTOR_AVOID: bottom quartile composite score.

    Returns list of alert dicts.
    """
    import numpy as np  # type: ignore
    import pandas as pd  # type: ignore

    alerts: list[dict] = []
    if not factor_weights:
        return alerts

    top_factor = factor_weights[0]["name"]
    top_ic = factor_weights[0]["ic"]

    # Determine quartile boundaries
    n = len(scored_stocks)
    top_quartile_threshold = 75.0   # composite_score >= 75
    bottom_quartile_threshold = 25.0  # composite_score <= 25

    # Compute 60-day rolling stats for the top factor (per ticker)
    if top_factor in features.columns:
        factor_series = features[top_factor]

        for _, row in scored_stocks.iterrows():
            ticker = row["ticker"]
            composite = row["composite_score"]
            rank = row["rank"]

            # Extract time-series for this ticker
            try:
                ticker_ts = factor_series.xs(ticker, level="instrument").sort_index()
            except KeyError:
                continue

            if len(ticker_ts) < 5:
                continue

            current_val = float(ticker_ts.iloc[-1])
            # Use up to 60 days of history (excluding the last day)
            history = ticker_ts.iloc[:-1].tail(60)

            if len(history) < 10:
                # Not enough history for reliable stats
                pass
            else:
                mean_val = float(history.mean())
                std_val = float(history.std())

                if std_val > 1e-9:
                    z_score = (current_val - mean_val) / std_val

                    # For negative IC: lower value = better signal, so z < -2 is the buy
                    # For positive IC: higher value = better signal, so z > +2 is the buy
                    is_extreme = (top_ic < 0 and z_score < -2.0) or (top_ic >= 0 and z_score > 2.0)
                    threshold = mean_val - 2 * std_val if top_ic < 0 else mean_val + 2 * std_val

                    if is_extreme:
                        alerts.append({
                            "ticker": ticker,
                            "signal_type": "FACTOR_BUY_SIGNAL",
                            "severity": "alert",
                            "factor": top_factor,
                            "value": round(current_val, 6),
                            "threshold": round(threshold, 6),
                            "message": (
                                f"{ticker}: {top_factor}={current_val:.4f} is "
                                f"{'below' if top_ic < 0 else 'above'} the 2-sigma threshold "
                                f"({threshold:.4f}) — mean-reversion buy signal "
                                f"(IC={top_ic:+.4f})"
                            ),
                        })

            # FACTOR_STRONG_BUY: top quartile + top factor in extreme territory
            in_top_quartile = composite >= top_quartile_threshold
            factor_val = row.get(top_factor)

            if in_top_quartile and factor_val is not None:
                # Check if this ticker already has a BUY_SIGNAL alert (factor is extreme)
                has_buy_signal = any(
                    a["ticker"] == ticker and a["signal_type"] == "FACTOR_BUY_SIGNAL"
                    for a in alerts
                )
                if has_buy_signal:
                    alerts.append({
                        "ticker": ticker,
                        "signal_type": "FACTOR_STRONG_BUY",
                        "severity": "alert",
                        "factor": top_factor,
                        "value": round(float(factor_val), 6),
                        "threshold": top_quartile_threshold,
                        "message": (
                            f"{ticker}: composite score {composite:.1f} (rank #{rank}) "
                            f"in top quartile AND {top_factor} at extreme — strong buy"
                        ),
                    })

            # FACTOR_AVOID: bottom quartile composite score
            if composite <= bottom_quartile_threshold:
                alerts.append({
                    "ticker": ticker,
                    "signal_type": "FACTOR_AVOID",
                    "severity": "watch",
                    "factor": top_factor,
                    "value": round(composite, 2),
                    "threshold": bottom_quartile_threshold,
                    "message": (
                        f"{ticker}: composite score {composite:.1f} (rank #{rank}) "
                        f"in bottom quartile — avoid or reduce exposure"
                    ),
                })

    return alerts


# ---------------------------------------------------------------------------
# Thesis scoring
# ---------------------------------------------------------------------------

def score_thesis(thesis_name: str, top_n_factors: int = 5) -> dict:
    """Score all stocks in a thesis universe using top IC-weighted factors.

    Steps:
    1. Load thesis tickers from universe.get_thesis_tickers()
    2. Load factor weights from the latest factor report for this thesis
    3. Load recent Alpha158 features (90-day lookback)
    4. Compute IC-weighted composite scores for the latest cross-section date
    5. Evaluate threshold-based signals

    Returns a structured dict with ranked stocks, alerts, and metadata.

    Raises ValueError if no tickers found, no factor report exists, or no
    Qlib data is available for the universe.
    """
    from universe import get_thesis_tickers  # type: ignore

    # 1. Load tickers
    tickers = get_thesis_tickers(thesis_name)

    if not tickers:
        raise ValueError(
            f"No tickers found for thesis '{thesis_name}'. "
            "Check that the thesis file exists in 10_Theses/ and has a "
            "non-empty core_entities field."
        )

    if len(tickers) < 3:
        logger.warning(
            "Thesis '%s' has only %d tickers — scoring may be unreliable with "
            "fewer than 3 instruments for cross-sectional ranking.",
            thesis_name,
            len(tickers),
        )

    # 2. Load factor weights
    factor_weights = _load_factor_weights(thesis_name, top_n=top_n_factors)
    logger.info(
        "Loaded %d factor weights for '%s': %s",
        len(factor_weights),
        thesis_name,
        [fw["name"] for fw in factor_weights],
    )

    # 3. Initialise Qlib and load features
    _ensure_qlib_init()

    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        features = _get_latest_features(tickers, lookback_days=90)

    # 4. Compute composite scores for the latest date
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        scored_df = _compute_composite_scores(features, factor_weights)

    # Determine the actual scoring date (latest date in features)
    import pandas as pd  # type: ignore
    latest_date = features.index.get_level_values("datetime").max()
    scoring_date = str(latest_date.date()) if hasattr(latest_date, "date") else str(latest_date)[:10]

    # 5. Evaluate signals
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        alerts = _evaluate_signals(scored_df, features, factor_weights)

    # Build factor column names for the stock records
    factor_cols = [fw["name"] for fw in factor_weights if fw["name"] in scored_df.columns]

    # Determine signal label per stock based on composite score
    def _stock_signal(composite: float) -> str:
        if composite >= 75:
            return "STRONG_BUY"
        if composite >= 55:
            return "BUY"
        if composite >= 45:
            return "NEUTRAL"
        if composite >= 25:
            return "WATCH"
        return "AVOID"

    stocks: list[dict] = []
    for _, row in scored_df.iterrows():
        ticker = str(row["ticker"])
        composite = float(row["composite_score"])
        stock_record: dict[str, Any] = {
            "ticker": ticker,
            "composite_score": composite,
            "rank": int(row["rank"]),
            "signal": _stock_signal(composite),
            "factors": {
                col: round(float(row[col]), 6) if row.get(col) is not None else None
                for col in factor_cols
            },
        }
        stocks.append(stock_record)

    return {
        "thesis": thesis_name,
        "scoring_date": scoring_date,
        "universe": thesis_name,
        "tickers": tickers,
        "stocks": stocks,
        "alerts": alerts,
        "factor_weights": [
            {"name": fw["name"], "ic": fw["ic"]} for fw in factor_weights
        ],
        "run_date": _today(),
    }


# ---------------------------------------------------------------------------
# Score all theses
# ---------------------------------------------------------------------------

def score_all_theses(top_n_factors: int = 5) -> list[dict]:
    """Score all theses that have factor reports available in 05_Data_Pulls/Quant/.

    Discovers theses by globbing for *_Qlib_Factors_*.md reports, extracts
    thesis names from the filename suffix, and calls score_thesis for each.

    Failures for individual theses are logged as warnings and skipped so the
    full batch completes even when one thesis lacks data.

    Returns a list of score_thesis result dicts.
    """
    if not _QUANT_DIR.exists():
        logger.warning("Quant directory not found: %s", _QUANT_DIR)
        return []

    # Collect unique thesis names from report filenames
    thesis_names: set[str] = set()
    for md_file in _QUANT_DIR.glob("*_Qlib_Factors_*.md"):
        stem = md_file.stem
        parts = stem.split("_Qlib_Factors_", maxsplit=1)
        if len(parts) == 2 and parts[1]:
            # Convert filename fragment back to readable name (underscores → spaces)
            thesis_part = parts[1].replace("_", " ")
            thesis_names.add(thesis_part)

    if not thesis_names:
        logger.warning(
            "No factor reports found in %s. "
            "Run: node scripts/run.mjs qlib factors",
            _QUANT_DIR,
        )
        return []

    logger.info("Found factor reports for %d thesis/theses: %s", len(thesis_names), sorted(thesis_names))

    results: list[dict] = []
    for thesis_name in sorted(thesis_names):
        try:
            result = score_thesis(thesis_name, top_n_factors=top_n_factors)
            results.append(result)
            logger.info(
                "Scored '%s': %d stocks, %d alerts",
                thesis_name,
                len(result["stocks"]),
                len(result["alerts"]),
            )
        except Exception as exc:  # noqa: BLE001
            logger.warning(
                "Could not score thesis '%s': %s — skipping.",
                thesis_name,
                exc,
            )

    return results


# ---------------------------------------------------------------------------
# Smoke-test entrypoint
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import json

    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

    print("=" * 60)
    print("  Alpha158 Stock Scorer — Housing thesis")
    print("=" * 60)

    try:
        result = score_thesis("Housing")
        print(f"\nThesis       : {result['thesis']}")
        print(f"Scoring date : {result['scoring_date']}")
        print(f"Universe     : {len(result['tickers'])} tickers")
        print(f"Run date     : {result['run_date']}")

        print("\nFactor weights used:")
        for fw in result["factor_weights"]:
            print(f"  {fw['name']:<20}  IC={fw['ic']:+.4f}")

        print(f"\nRanked stocks ({len(result['stocks'])} total):")
        header = f"  {'Rank':>4}  {'Ticker':<8}  {'Score':>7}  {'Signal':<12}"
        factor_names = [fw["name"] for fw in result["factor_weights"]]
        for fn in factor_names:
            header += f"  {fn:>10}"
        print(header)
        print("  " + "-" * (len(header) - 2))

        for stock in result["stocks"]:
            row_str = (
                f"  {stock['rank']:>4}  {stock['ticker']:<8}  "
                f"{stock['composite_score']:>7.2f}  {stock['signal']:<12}"
            )
            for fn in factor_names:
                val = stock["factors"].get(fn)
                row_str += f"  {val:>10.4f}" if val is not None else f"  {'N/A':>10}"
            print(row_str)

        if result["alerts"]:
            print(f"\nAlerts ({len(result['alerts'])}):")
            for alert in result["alerts"]:
                severity_tag = f"[{alert['severity'].upper()}]"
                print(f"  {severity_tag:<9} {alert['signal_type']:<22} {alert['message']}")
        else:
            print("\nNo alerts generated.")

    except RuntimeError as exc:
        print(f"\n[SETUP REQUIRED] {exc}")
    except ValueError as exc:
        print(f"\n[DATA ERROR] {exc}")
    except Exception as exc:  # noqa: BLE001
        print(f"\n[ERROR] {exc}")
        raise
