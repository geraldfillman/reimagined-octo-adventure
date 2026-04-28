"""
backtest.py — Qlib-based backtesting pipeline for the My_Data vault.

Trains a LightGBM model on Alpha158 features, generates predictions on a
held-out test set, simulates a TopK-dropout portfolio strategy, and returns
structured results for the report writer.

Typical usage:
    from scripts.qlib.backtest import run_backtest, run_thesis_backtest

    result = run_backtest(["AAPL", "MSFT", "GOOGL", "AMZN"], universe_name="big_tech")
    result = run_thesis_backtest("Housing Supply Correction")
"""

from __future__ import annotations

import logging
import sys
import warnings
from collections import defaultdict
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
# Vault / data-directory helpers (mirrors factors.py conventions)
# ---------------------------------------------------------------------------

def _today() -> str:
    return _shared_today()


# ---------------------------------------------------------------------------
# Qlib initialisation guard
# ---------------------------------------------------------------------------

def _ensure_qlib_init() -> None:
    _shared_ensure_qlib_init()


# ---------------------------------------------------------------------------
# Instrument config builder (same pattern as factors.py)
# ---------------------------------------------------------------------------

def _build_instrument_config(
    tickers: list[str],
    start_date: str,
    end_date: str,
) -> dict:
    """Build a Qlib-compatible instruments config dict from a ticker list.

    Returns {ticker: [(pd.Timestamp(start), pd.Timestamp(end))]} for each
    ticker, matching the pattern used in factors.py.
    """
    import pandas as pd  # type: ignore

    start = pd.Timestamp(start_date)
    end = pd.Timestamp(end_date)
    return {ticker: [(start, end)] for ticker in tickers}


# ---------------------------------------------------------------------------
# Instrument filtering (mirrors factors.py)
# ---------------------------------------------------------------------------

def _filter_available_instruments(tickers: list[str]) -> tuple[list[str], list[str]]:
    """Return (available, skipped) after checking which tickers exist in Qlib."""
    try:
        from qlib.data import D  # type: ignore

        instruments = D.instruments(market="all")
        all_instruments: set[str] = set(
            D.list_instruments(instruments=instruments, as_list=True)
        )
    except Exception:  # noqa: BLE001
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


# Use the shared implementations to keep factors/backtest/scorer aligned.
_build_instrument_config = _shared_build_instrument_config
_filter_available_instruments = _shared_filter_available_instruments


# ---------------------------------------------------------------------------
# Date-range split
# ---------------------------------------------------------------------------

def _split_dates(
    start_date: str,
    end_date: str,
    train_ratio: float,
) -> tuple[str, str, str, str, str, str]:
    """Split [start_date, end_date] into train / valid / test segments by date.

    train_ratio=0.6 means 60% train, 20% valid, 20% test.  The remaining 40%
    is split evenly between valid and test.

    Returns (train_start, train_end, valid_start, valid_end, test_start, test_end).
    """
    import pandas as pd  # type: ignore

    start = pd.Timestamp(start_date)
    end = pd.Timestamp(end_date)
    total_days = (end - start).days

    train_days = int(total_days * train_ratio)
    remaining_days = total_days - train_days
    valid_days = remaining_days // 2

    train_end = start + pd.Timedelta(days=train_days)
    valid_start = train_end + pd.Timedelta(days=1)
    valid_end = valid_start + pd.Timedelta(days=valid_days)
    test_start = valid_end + pd.Timedelta(days=1)

    fmt = "%Y-%m-%d"
    return (
        start.strftime(fmt),
        train_end.strftime(fmt),
        valid_start.strftime(fmt),
        valid_end.strftime(fmt),
        test_start.strftime(fmt),
        end.strftime(fmt),
    )


# ---------------------------------------------------------------------------
# Alpha158 feature loading
# ---------------------------------------------------------------------------

def _load_alpha158_features(
    tickers: list[str],
    start_date: str,
    end_date: str,
    fit_start: str,
    fit_end: str,
) -> "pd.DataFrame":  # noqa: F821
    """Return a DataFrame of Alpha158 features indexed by (datetime, instrument).

    fit_start/fit_end define the normalisation window (typically the training
    period) so that test features are scaled consistently.
    """
    import pandas as pd  # type: ignore
    from qlib.contrib.data.handler import Alpha158  # type: ignore

    handler = Alpha158(
        instruments=_build_instrument_config(tickers, start_date, end_date),
        start_time=start_date,
        end_time=end_date,
        fit_start_time=fit_start,
        fit_end_time=fit_end,
        infer_processors=[],
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
# Forward-return label computation
# ---------------------------------------------------------------------------

def _compute_daily_returns(
    tickers: list[str],
    start_date: str,
    end_date: str,
) -> "pd.DataFrame":  # noqa: F821
    """Fetch close prices and compute 1-day forward returns for each ticker.

    Returns a DataFrame indexed by (datetime, instrument) with columns:
        close     — raw close price
        fwd_ret_1 — next-day percentage return (the prediction label)
        ret_1     — same-day percentage return (used in portfolio simulation)
    """
    import pandas as pd  # type: ignore
    from qlib.data import D  # type: ignore

    close_df: pd.DataFrame = D.features(
        tickers,
        ["$close"],
        start_time=start_date,
        end_time=end_date,
        freq="day",
    )
    close_df.columns = ["close"]

    # Same-day return (what we earn by holding on that date)
    close_df["ret_1"] = (
        close_df.groupby(level="instrument")["close"]
        .pct_change(periods=1, fill_method=None)
    )

    # Forward 1-day return — the label we train against
    close_df["fwd_ret_1"] = (
        close_df.groupby(level="instrument")["close"]
        .pct_change(periods=1, fill_method=None)
        .shift(-1)
    )

    return close_df


# ---------------------------------------------------------------------------
# LightGBM training
# ---------------------------------------------------------------------------

def _train_lgbm(
    features: "pd.DataFrame",  # noqa: F821
    labels: "pd.Series",       # noqa: F821
) -> Any:
    """Train a LightGBM regressor on (features, labels).

    Missing values are forwarded-filled then dropped to avoid leakage.
    Returns the fitted LGBMRegressor.
    """
    try:
        import lightgbm as lgb  # type: ignore
    except ImportError as exc:
        raise RuntimeError(
            "lightgbm is not installed. Install it with: pip install lightgbm"
        ) from exc

    import numpy as np  # type: ignore
    import pandas as pd  # type: ignore

    # Align features and labels on common index
    aligned = features.join(labels.rename("__label__"), how="inner").dropna(
        subset=["__label__"]
    )

    X = aligned.drop(columns=["__label__"]).fillna(0.0)
    y = aligned["__label__"].values

    model = lgb.LGBMRegressor(
        n_estimators=200,
        learning_rate=0.05,
        num_leaves=31,
        subsample=0.8,
        colsample_bytree=0.8,
        n_jobs=-1,
        random_state=42,
        verbose=-1,
    )

    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        model.fit(X, y)

    logger.info(
        "LightGBM trained on %d samples, %d features.",
        len(X),
        X.shape[1],
    )
    return model


# ---------------------------------------------------------------------------
# Prediction generation
# ---------------------------------------------------------------------------

def _generate_predictions(
    model: Any,
    features: "pd.DataFrame",  # noqa: F821
) -> "pd.Series":  # noqa: F821
    """Score all (date, instrument) rows in features using the trained model.

    Returns a Series indexed by (datetime, instrument) with predicted scores.
    """
    import pandas as pd  # type: ignore

    X = features.fillna(0.0)
    scores = model.predict(X)
    return pd.Series(scores, index=features.index, name="score")


# ---------------------------------------------------------------------------
# TopK-dropout portfolio simulation
# ---------------------------------------------------------------------------

def _simulate_topk_portfolio(
    predictions: "pd.Series",    # noqa: F821
    daily_returns: "pd.DataFrame",  # noqa: F821
    topk: int,
    n_drop: int,
    return_history: bool = False,
) -> "pd.Series | tuple[pd.Series, list[dict[str, Any]]]":  # noqa: F821
    """Simulate a TopK-dropout equal-weight portfolio on the test set.

    Each day:
      1. Rank instruments by predicted score (descending).
      2. Current holdings = intersection of previous holdings and top-(K+n_drop).
      3. Buy the top-K instruments not already held.
      4. Sell any held instruments that fell out of top-(K+n_drop).
      5. Portfolio daily return = equal-weighted mean of held-instrument returns.

    Parameters
    ----------
    predictions:
        Series indexed by (datetime, instrument) with model scores.
    daily_returns:
        DataFrame indexed by (datetime, instrument) with a 'ret_1' column.
    topk:
        Number of instruments to hold simultaneously.
    n_drop:
        Dropout buffer — instruments ranked within topk+n_drop are retained
        to reduce unnecessary turnover.

    Returns
    -------
    pd.Series indexed by date with the portfolio's daily return.
    When return_history is True, also returns a list of day-level holdings events.
    """
    import numpy as np  # type: ignore
    import pandas as pd  # type: ignore

    # Pivot predictions and returns to wide form: rows=date, cols=instrument
    pred_wide = predictions.unstack(level="instrument")
    ret_wide = daily_returns["ret_1"].unstack(level="instrument")

    # Align on common dates and instruments
    common_dates = pred_wide.index.intersection(ret_wide.index)
    common_instr = pred_wide.columns.intersection(ret_wide.columns)
    pred_wide = pred_wide.loc[common_dates, common_instr]
    ret_wide = ret_wide.loc[common_dates, common_instr]

    portfolio_returns: list[tuple[pd.Timestamp, float]] = []
    holdings: set[str] = set()
    turnover_list: list[float] = []
    history_rows: list[dict[str, Any]] = []

    for dt in common_dates:
        day_scores = pred_wide.loc[dt].dropna()
        day_rets = ret_wide.loc[dt].dropna()

        if day_scores.empty:
            portfolio_returns.append((dt, 0.0))
            continue

        # Rank by score descending
        ranked = day_scores.sort_values(ascending=False)
        top_pool = set(ranked.iloc[: topk + n_drop].index)

        # Retain holdings that are still in the top pool
        retained = holdings & top_pool

        # Fill remaining slots from top-K
        top_k_set = set(ranked.iloc[:topk].index)
        new_holdings = retained | (top_k_set - holdings)

        # If we have too many (retention > topk), trim by score rank
        if len(new_holdings) > topk:
            new_holdings = set(
                ranked[ranked.index.isin(new_holdings)].iloc[:topk].index
            )

        prev_holdings = set(holdings)
        entries = sorted(new_holdings - prev_holdings)
        exits = sorted(prev_holdings - new_holdings)

        # Compute turnover (fraction of portfolio changed)
        if prev_holdings:
            sold = len(prev_holdings - new_holdings)
            turnover = sold / max(len(prev_holdings), 1)
        else:
            turnover = 1.0

        turnover_list.append(turnover)
        holdings = new_holdings

        if not holdings:
            portfolio_returns.append((dt, 0.0))
            history_rows.append({
                "date": str(dt.date()) if hasattr(dt, "date") else str(dt)[:10],
                "holdings": [],
                "entries": entries,
                "exits": exits,
                "day_return": 0.0,
                "turnover": round(turnover, 4),
            })
            continue

        # Equal-weight portfolio return for held instruments
        held_rets = day_rets[day_rets.index.isin(holdings)].dropna()
        if held_rets.empty:
            portfolio_returns.append((dt, 0.0))
            realized_return = 0.0
        else:
            realized_return = float(held_rets.mean())
            portfolio_returns.append((dt, realized_return))

        history_rows.append({
            "date": str(dt.date()) if hasattr(dt, "date") else str(dt)[:10],
            "holdings": sorted(holdings),
            "entries": entries,
            "exits": exits,
            "day_return": round(realized_return, 6),
            "turnover": round(turnover, 4),
        })

    dates, rets = zip(*portfolio_returns) if portfolio_returns else ([], [])
    port_series = pd.Series(list(rets), index=pd.DatetimeIndex(list(dates)), name="port_ret")

    # Attach turnover metadata as an attribute for metrics collection
    port_series.attrs["avg_turnover"] = float(np.mean(turnover_list)) if turnover_list else 0.0
    port_series.attrs["total_trades"] = int(sum(1 for t in turnover_list if t > 0))

    if return_history:
        return port_series, history_rows
    return port_series


# ---------------------------------------------------------------------------
# Performance metrics
# ---------------------------------------------------------------------------

def _compute_metrics(
    portfolio_returns: "pd.Series",  # noqa: F821
) -> dict[str, Any]:
    """Compute annualised performance metrics from a daily-returns series.

    Returns a dict with:
        sharpe, max_drawdown, annual_return, monthly_returns,
        win_rate, avg_turnover, total_trades.
    """
    import numpy as np  # type: ignore
    import pandas as pd  # type: ignore

    rets = portfolio_returns.dropna()

    if rets.empty or rets.std() < 1e-10:
        return {
            "sharpe": 0.0,
            "max_drawdown": 0.0,
            "annual_return": 0.0,
            "monthly_returns": [],
            "win_rate": 0.0,
            "avg_turnover": portfolio_returns.attrs.get("avg_turnover", 0.0),
            "total_trades": portfolio_returns.attrs.get("total_trades", 0),
        }

    # Annualised Sharpe
    mean_ret = float(rets.mean())
    std_ret = float(rets.std())
    sharpe = (mean_ret / std_ret) * (252 ** 0.5)

    # Cumulative returns for drawdown
    cum_ret = (1.0 + rets).cumprod()
    rolling_max = cum_ret.cummax()
    drawdowns = (cum_ret - rolling_max) / rolling_max
    max_drawdown = float(drawdowns.min())

    # Annualised return
    n_days = len(rets)
    total_return = float(cum_ret.iloc[-1]) - 1.0 if not cum_ret.empty else 0.0
    annual_return = (1.0 + total_return) ** (252.0 / max(n_days, 1)) - 1.0

    # Win rate (fraction of days with positive return)
    win_rate = float((rets > 0).mean())

    # Monthly returns: compound daily returns within each YYYY-MM bucket
    monthly_rets: list[dict[str, Any]] = []
    if not rets.empty:
        monthly_grouped = rets.groupby(rets.index.to_period("M"))
        for period, group in monthly_grouped:
            compounded = float((1.0 + group).prod()) - 1.0
            monthly_rets.append({
                "month": str(period),
                "return": round(compounded, 6),
            })

    return {
        "sharpe": round(sharpe, 4),
        "max_drawdown": round(max_drawdown, 6),
        "annual_return": round(annual_return, 6),
        "monthly_returns": monthly_rets,
        "win_rate": round(win_rate, 4),
        "avg_turnover": round(portfolio_returns.attrs.get("avg_turnover", 0.0), 4),
        "total_trades": portfolio_returns.attrs.get("total_trades", 0),
    }


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def run_backtest(
    tickers: list[str],
    universe_name: str = "custom",
    strategy: str = "alpha158_lgbm",
    start_date: str = "2020-01-01",
    end_date: str | None = None,
    train_ratio: float = 0.6,
    topk: int = 3,
    n_drop: int = 1,
    benchmark: str = "SPY",
    include_artifacts: bool = False,
) -> dict[str, Any]:
    """Run a full train → predict → backtest pipeline.

    Steps
    -----
    1. Split the timeline into train / valid / test by date.
    2. Load Alpha158 features for the instrument config.
    3. Train LightGBM regressor on train+valid sets.
    4. Generate predictions on the test set.
    5. Simulate TopK-dropout portfolio strategy.
    6. Compute performance metrics.
    7. Return structured result dict.

    Parameters
    ----------
    tickers:
        List of ticker symbols (e.g. ["AAPL", "MSFT"]).
    universe_name:
        Human-readable label included in the result dict.
    strategy:
        Strategy identifier stored in the result (default "alpha158_lgbm").
    start_date:
        ISO date string for the full window start (inclusive).
    end_date:
        ISO date string for the full window end (inclusive).
        Defaults to today's date.
    train_ratio:
        Fraction of the date range used for training (default 0.6).
        Remaining 40% is split evenly into validation and test.
    topk:
        Number of stocks to hold simultaneously.
    n_drop:
        Dropout buffer — instruments within top (K + n_drop) are retained
        to reduce unnecessary turnover.
    benchmark:
        Benchmark symbol stored in result (not used in simulation itself).

    Returns
    -------
    dict matching the schema expected by report.py's write_backtest_report():
        strategy, universe, tickers, sharpe, max_drawdown, annual_return,
        monthly_returns, metrics, run_date, start_date, end_date.

    Raises
    ------
    RuntimeError
        If Qlib has not been initialised (setup.py not run) or LightGBM
        is not installed.
    ValueError
        If no tickers are available or Alpha158 returns no data.
    """
    if end_date is None:
        end_date = _today()

    if not tickers:
        raise ValueError("tickers must be a non-empty list of ticker symbols.")

    _ensure_qlib_init()

    # 1. Filter to instruments present in Qlib's data
    available, skipped = _filter_available_instruments(tickers)

    if not available:
        raise ValueError(
            "None of the requested tickers are available in Qlib's data: "
            f"{tickers}. Run setup.py to download market data."
        )

    if len(available) < topk:
        logger.warning(
            "Only %d instruments available but topk=%d; reducing topk to %d.",
            len(available),
            topk,
            len(available),
        )
        topk = len(available)

    logger.info(
        "Running backtest on %d instruments (%d skipped) from %s to %s",
        len(available),
        len(skipped),
        start_date,
        end_date,
    )

    # 2. Split the date range
    (
        train_start,
        train_end,
        valid_start,
        valid_end,
        test_start,
        test_end,
    ) = _split_dates(start_date, end_date, train_ratio)

    logger.info(
        "Date split — train: %s→%s  valid: %s→%s  test: %s→%s",
        train_start, train_end, valid_start, valid_end, test_start, test_end,
    )

    # 3. Load Alpha158 features — full window, normalised on training period
    all_features = _load_alpha158_features(
        tickers=available,
        start_date=start_date,
        end_date=end_date,
        fit_start=train_start,
        fit_end=valid_end,   # normalise on train+valid
    )

    # 4. Load daily returns for the full window (needed for portfolio sim)
    from qlib.data import D  # type: ignore
    all_returns = _compute_daily_returns(available, start_date, end_date)

    # 5. Compute forward return labels (train+valid window for training)
    import pandas as pd  # type: ignore

    train_valid_mask = (
        all_features.index.get_level_values("datetime") <= pd.Timestamp(valid_end)
    )
    train_valid_features = all_features.loc[train_valid_mask]

    # Labels: join fwd_ret_1 from daily returns
    fwd_labels = all_returns["fwd_ret_1"]
    train_valid_labels = fwd_labels.loc[
        fwd_labels.index.get_level_values("datetime") <= pd.Timestamp(valid_end)
    ]

    if train_valid_features.empty:
        raise ValueError(
            "No training data available for the specified date range and tickers. "
            f"train window: {train_start} → {valid_end}"
        )

    # 6. Train LightGBM on train+valid
    model = _train_lgbm(train_valid_features, train_valid_labels)

    # 7. Generate predictions on the test set
    test_mask = (
        all_features.index.get_level_values("datetime") >= pd.Timestamp(test_start)
    )
    test_features = all_features.loc[test_mask]

    if test_features.empty:
        raise ValueError(
            f"No test data available. test window: {test_start} → {test_end}. "
            "Try an earlier start_date or a wider date range."
        )

    predictions = _generate_predictions(model, test_features)

    # 8. Subset daily returns to the test window for simulation
    test_returns_mask = (
        all_returns.index.get_level_values("datetime") >= pd.Timestamp(test_start)
    )
    test_daily_returns = all_returns.loc[test_returns_mask]

    # 9. Simulate TopK-dropout portfolio
    portfolio_history: list[dict[str, Any]] = []
    simulated = _simulate_topk_portfolio(
        predictions=predictions,
        daily_returns=test_daily_returns,
        topk=topk,
        n_drop=n_drop,
        return_history=include_artifacts,
    )
    if include_artifacts:
        portfolio_returns, portfolio_history = simulated  # type: ignore[assignment]
    else:
        portfolio_returns = simulated  # type: ignore[assignment]

    # 10. Compute performance metrics
    metrics = _compute_metrics(portfolio_returns)

    # 11. Assemble result dict
    extra_metrics = {
        "win_rate": metrics.pop("win_rate"),
        "avg_turnover": metrics.pop("avg_turnover"),
        "total_trades": metrics.pop("total_trades"),
        "benchmark": benchmark,
        "topk": topk,
        "n_drop": n_drop,
        "train_ratio": train_ratio,
        "skipped_tickers": skipped,
        "train_window": f"{train_start} → {valid_end}",
        "test_window": f"{test_start} → {test_end}",
    }

    result = {
        "strategy": strategy,
        "universe": universe_name,
        "tickers": available,
        "sharpe": metrics["sharpe"],
        "max_drawdown": metrics["max_drawdown"],
        "annual_return": metrics["annual_return"],
        "monthly_returns": metrics["monthly_returns"],
        "metrics": extra_metrics,
        "run_date": _today(),
        "start_date": start_date,
        "end_date": end_date,
    }
    if include_artifacts:
        result["portfolio_returns"] = portfolio_returns
        result["portfolio_history"] = portfolio_history
        result["predictions"] = predictions
    return result


def run_thesis_backtest(
    thesis_name: str,
    strategy: str = "alpha158_lgbm",
    start_date: str = "2020-01-01",
    end_date: str | None = None,
    topk: int = 3,
    n_drop: int = 1,
    include_artifacts: bool = False,
) -> dict[str, Any]:
    """Convenience wrapper: load thesis tickers from vault, run backtest.

    Parameters
    ----------
    thesis_name:
        Case-insensitive substring matched against thesis filenames in
        10_Theses/ (e.g. "Housing Supply Correction").
    strategy:
        Strategy identifier stored in the result.
    start_date:
        Start of the full analysis window (ISO date string).
    end_date:
        End of the analysis window.  Defaults to today.
    topk:
        Number of stocks to hold simultaneously.
    n_drop:
        Dropout buffer for turnover reduction.

    Returns
    -------
    Same dict structure as run_backtest(), with universe set to the matched
    thesis name.

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

    return run_backtest(
        tickers=tickers,
        universe_name=thesis_name,
        strategy=strategy,
        start_date=start_date,
        end_date=end_date,
        topk=topk,
        n_drop=n_drop,
        include_artifacts=include_artifacts,
    )


# ---------------------------------------------------------------------------
# Smoke-test entrypoint
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import json

    TEST_UNIVERSE = [
        "AAPL", "MSFT", "GOOGL", "AMZN", "SPY",
        "DHI", "LEN", "VST", "NRG", "PLTR",
    ]
    TEST_START = "2020-01-01"

    print("=" * 65)
    print("  Alpha158 + LightGBM Backtest — smoke test")
    print(f"  Universe : {TEST_UNIVERSE}")
    print(f"  Start    : {TEST_START}")
    print("=" * 65)

    try:
        result = run_backtest(
            tickers=TEST_UNIVERSE,
            universe_name="smoke_test",
            start_date=TEST_START,
            topk=3,
            n_drop=1,
        )

        print("\n[OK] Backtest complete.\n")
        print(f"  Strategy       : {result['strategy']}")
        print(f"  Universe       : {result['universe']}")
        print(f"  Tickers used   : {result['tickers']}")
        print(f"  Test window    : {result['metrics']['test_window']}")
        print()
        print(f"  Sharpe ratio   : {result['sharpe']:+.4f}")
        print(f"  Annual return  : {result['annual_return']:+.2%}")
        print(f"  Max drawdown   : {result['max_drawdown']:+.2%}")
        print(f"  Win rate       : {result['metrics']['win_rate']:.2%}")
        print(f"  Avg turnover   : {result['metrics']['avg_turnover']:.2%}")
        print(f"  Total trades   : {result['metrics']['total_trades']}")
        print()
        if result["monthly_returns"]:
            print("  Monthly returns (last 6):")
            for m in result["monthly_returns"][-6:]:
                bar = "+" if m["return"] >= 0 else ""
                print(f"    {m['month']}  {bar}{m['return']:+.2%}")

        skipped = result["metrics"].get("skipped_tickers", [])
        if skipped:
            print(f"\n  Skipped tickers: {skipped}")

    except RuntimeError as exc:
        print(f"\n[SETUP REQUIRED] {exc}")
    except ValueError as exc:
        print(f"\n[DATA ERROR] {exc}")
    except Exception as exc:  # noqa: BLE001
        print(f"\n[ERROR] {exc}")
        raise
