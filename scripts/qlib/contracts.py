"""
contracts.py - Shared reporting-contract helpers for Qlib outputs.

These helpers derive stable frontmatter fields from result dicts and assemble
thesis rollup fields from the latest factor/score/backtest notes.
"""

from __future__ import annotations

from typing import Any

from common import REPORT_SCHEMA_VERSION, latest_iso_date, merge_signal_statuses


def factor_frontmatter_fields(results: dict[str, Any]) -> dict[str, Any]:
    """Derive operator-facing factor-analysis metrics for report frontmatter."""
    summary = results.get("summary", {})
    return {
        "qlib_schema_version": REPORT_SCHEMA_VERSION,
        "best_factor": summary.get("best_factor", ""),
        "best_ic": round(float(summary.get("best_ic", 0.0)), 4),
        "positive_factor_count": int(summary.get("positive_ic_count", 0)),
        "total_factor_count": int(summary.get("total_factors", 0)),
        "avg_ic": round(float(summary.get("avg_ic", 0.0)), 4),
        "universe_size": len(results.get("tickers", [])),
        "benchmark": results.get("benchmark", "SPY"),
        "start_date": results.get("start_date"),
        "end_date": results.get("end_date"),
        "skipped_tickers": results.get("skipped_tickers", []),
    }


def score_frontmatter_fields(results: dict[str, Any]) -> dict[str, Any]:
    """Derive operator-facing score metrics for report frontmatter."""
    stocks = results.get("stocks", [])
    alerts = results.get("alerts", [])
    top_stock = stocks[0] if stocks else {}

    strong_buy_count = sum(1 for stock in stocks if stock.get("signal") == "STRONG_BUY")
    buy_count = sum(1 for stock in stocks if stock.get("signal") == "BUY")
    watch_count = sum(1 for stock in stocks if stock.get("signal") == "WATCH")
    avoid_count = sum(1 for stock in stocks if stock.get("signal") == "AVOID")

    return {
        "qlib_schema_version": REPORT_SCHEMA_VERSION,
        "universe_size": len(results.get("tickers", [])),
        "scoring_date": results.get("scoring_date"),
        "alert_count": len(alerts),
        "top_ticker": top_stock.get("ticker"),
        "top_score": round(float(top_stock.get("composite_score", 0.0)), 2) if top_stock else None,
        "strong_buy_count": strong_buy_count,
        "buy_count": buy_count,
        "watch_count": watch_count,
        "avoid_count": avoid_count,
        "top_factor": results.get("factor_weights", [{}])[0].get("name") if results.get("factor_weights") else None,
        "top_factor_weight": (
            round(float(results.get("factor_weights", [{}])[0].get("ic", 0.0)), 4)
            if results.get("factor_weights")
            else None
        ),
    }


def backtest_frontmatter_fields(results: dict[str, Any]) -> dict[str, Any]:
    """Derive operator-facing backtest metrics for report frontmatter."""
    metrics = results.get("metrics", {})
    return {
        "qlib_schema_version": REPORT_SCHEMA_VERSION,
        "universe_size": len(results.get("tickers", [])),
        "win_rate": _rounded(metrics.get("win_rate"), 4),
        "avg_turnover": _rounded(metrics.get("avg_turnover"), 4),
        "total_trades": metrics.get("total_trades", 0),
        "topk": metrics.get("topk"),
        "n_drop": metrics.get("n_drop"),
        "train_ratio": metrics.get("train_ratio"),
        "train_window": metrics.get("train_window"),
        "test_window": metrics.get("test_window"),
        "skipped_tickers": metrics.get("skipped_tickers", []),
        "benchmark": metrics.get("benchmark", "SPY"),
    }


def build_thesis_qlib_fields(
    factor_report: dict[str, Any] | None = None,
    score_report: dict[str, Any] | None = None,
    backtest_report: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Build thesis-level Qlib summary fields from latest report frontmatter."""
    factor_report = factor_report or {}
    score_report = score_report or {}
    backtest_report = backtest_report or {}

    universe_size = _first_non_null(
        score_report.get("universe_size"),
        factor_report.get("universe_size"),
        backtest_report.get("universe_size"),
        score_report.get("ticker_count"),
        factor_report.get("ticker_count"),
    )

    fields = {
        "qlib_best_ic": _rounded(factor_report.get("best_ic"), 4),
        "qlib_positive_factor_count": factor_report.get("positive_factor_count"),
        "qlib_universe_size": universe_size,
        "qlib_last_score_date": _first_non_null(
            score_report.get("scoring_date"),
            score_report.get("date_pulled"),
        ),
        "qlib_last_backtest_date": backtest_report.get("date_pulled"),
        "qlib_signal_status": merge_signal_statuses(
            [
                score_report.get("signal_status"),
                backtest_report.get("signal_status"),
                factor_report.get("signal_status"),
            ]
        ),
        "qlib_backtest_sharpe": _rounded(backtest_report.get("sharpe"), 4),
        "qlib_last_run": latest_iso_date(
            [
                factor_report.get("date_pulled"),
                score_report.get("date_pulled"),
                backtest_report.get("date_pulled"),
            ]
        ),
    }

    return {key: value for key, value in fields.items() if value is not None}


def _rounded(value: Any, digits: int) -> float | None:
    if value in (None, ""):
        return None
    return round(float(value), digits)


def _first_non_null(*values: Any) -> Any:
    for value in values:
        if value not in (None, ""):
            return value
    return None
