"""
simulator.py - Trusted terminal replay for the Qlib pipeline.

This module stays read-only: it computes real factor, scoring, and backtest
results, then replays the portfolio path in the terminal. Demo behaviour is
available only when explicitly requested via allow_fallback.
"""

from __future__ import annotations

import json
import random
import statistics
import sys
import time
import warnings
from datetime import datetime
from pathlib import Path
from typing import Any

warnings.filterwarnings("ignore")

_QLIB_DIR = str(Path(__file__).resolve().parent)
if _QLIB_DIR not in sys.path:
    sys.path.insert(0, _QLIB_DIR)

from rich import box
from rich.console import Console, Group
from rich.live import Live
from rich.panel import Panel
from rich.progress import BarColumn, Progress, SpinnerColumn, TextColumn
from rich.table import Table

from backtest import run_backtest
from common import ensure_qlib_init, filter_available_instruments
from factors import _compute_forward_returns, _compute_ic_series, _load_alpha158_features
from report import _sanitize_filename_segment, build_table
from scorer import _compute_composite_scores, _evaluate_signals
from universe import get_thesis_tickers


def _supports_unicode() -> bool:
    encoding = (getattr(sys.stdout, "encoding", None) or "").lower()
    return "utf" in encoding


def _sleep(delay: float) -> None:
    if delay > 0:
        time.sleep(delay)


def _theme(ascii_only: bool) -> dict[str, Any]:
    return {
        "box": box.ASCII if ascii_only else box.ROUNDED,
        "spark_chars": " .:-=+*#%@" if ascii_only else " ▁▂▃▄▅▆▇█",
        "entry": "NEW" if ascii_only else "NEW",
        "exit": "EXIT" if ascii_only else "EXIT",
        "sep": " -> " if ascii_only else " -> ",
    }


def _safe_text(value: Any, ascii_only: bool) -> str:
    text = str(value)
    if not ascii_only:
        return text

    replacements = {
        "\u2192": "->",
        "\u2014": "-",
        "\u2013": "-",
        "\u2026": "...",
        "\u00a0": " ",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text.encode("ascii", "replace").decode("ascii")


def _sparkline(values: list[float], ascii_only: bool, width: int = 48) -> str:
    if not values:
        return ""
    chars = _theme(ascii_only)["spark_chars"]
    data = values[-width:]
    lo = min(data)
    hi = max(data)
    span = hi - lo if hi != lo else 1.0
    last_index = len(chars) - 1
    return "".join(chars[min(last_index, int((value - lo) / span * last_index))] for value in data)


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


def _format_holdings(holdings: list[str], limit: int = 5) -> str:
    if not holdings:
        return "-"
    visible = holdings[:limit]
    suffix = "..." if len(holdings) > limit else ""
    return ", ".join(visible) + suffix


def _build_factor_table(factors: list[dict[str, Any]], ascii_only: bool) -> Table:
    table = Table(title="Factor Rankings", box=_theme(ascii_only)["box"])
    table.add_column("Rank", justify="right", width=5)
    table.add_column("Factor", style="cyan", width=16)
    table.add_column("IC", justify="right", width=10)
    table.add_column("ICIR", justify="right", width=10)
    for factor in factors[:10]:
        table.add_row(
            str(factor["rank"]),
            _safe_text(factor["name"], ascii_only),
            f"{factor['ic']:+.4f}",
            f"{factor['icir']:+.3f}",
        )
    return table


def _build_score_table(stocks: list[dict[str, Any]], ascii_only: bool) -> Table:
    table = Table(title="Scoreboard", box=_theme(ascii_only)["box"])
    table.add_column("Rank", justify="right", width=5)
    table.add_column("Ticker", style="bold", width=10)
    table.add_column("Score", justify="right", width=8)
    table.add_column("Signal", width=12)
    for stock in stocks[:10]:
        signal = _stock_signal(float(stock["composite_score"]))
        table.add_row(
            str(stock["rank"]),
            _safe_text(stock["ticker"], ascii_only),
            f"{float(stock['composite_score']):.1f}",
            _safe_text(signal, ascii_only),
        )
    return table


def _build_replay_table(
    history_rows: list[dict[str, Any]],
    cumulative_values: list[float],
    ascii_only: bool,
    show_last: int = 8,
) -> Table:
    table = Table(title="Portfolio Replay", box=_theme(ascii_only)["box"])
    table.add_column("Date", width=12)
    table.add_column("Holdings", width=26)
    table.add_column("Entries", width=16)
    table.add_column("Exits", width=16)
    table.add_column("Day Ret", justify="right", width=10)
    table.add_column("Cum Ret", justify="right", width=10)

    visible_count = max(1, min(show_last, len(history_rows), len(cumulative_values)))
    visible_rows = history_rows[-visible_count:]
    visible_values = cumulative_values[-visible_count:]

    for row, cumulative_value in zip(visible_rows, visible_values):
        cum_ret = cumulative_value - 1.0
        table.add_row(
            row["date"],
            _safe_text(_format_holdings(row.get("holdings", [])), ascii_only),
            _safe_text(_format_holdings(row.get("entries", []), limit=3), ascii_only),
            _safe_text(_format_holdings(row.get("exits", []), limit=3), ascii_only),
            f"{float(row.get('day_return', 0.0)):+.2%}",
            f"{cum_ret:+.2%}",
        )
    return table


def _running_metrics(daily_returns: list[float], cumulative_value: float) -> dict[str, str]:
    peak = 1.0
    value = 1.0
    drawdowns: list[float] = []
    for ret in daily_returns:
        value *= 1.0 + ret
        peak = max(peak, value)
        drawdowns.append((value - peak) / peak if peak > 0 else 0.0)

    sharpe = 0.0
    if len(daily_returns) > 2:
        std = statistics.stdev(daily_returns)
        mean_ret = statistics.mean(daily_returns)
        sharpe = (mean_ret / std) * (252 ** 0.5) if std > 1e-9 else 0.0

    win_rate = sum(1 for ret in daily_returns if ret > 0) / max(len(daily_returns), 1)
    return {
        "Cumulative Return": f"{cumulative_value - 1.0:+.2%}",
        "Sharpe": f"{sharpe:+.3f}",
        "Max Drawdown": f"{min(drawdowns) if drawdowns else 0.0:+.2%}",
        "Win Rate": f"{win_rate:.0%}",
    }


def _render_summary(
    console: Console,
    metrics: dict[str, Any],
    stocks: list[dict[str, Any]],
    alerts: list[dict[str, Any]],
    ascii_only: bool,
) -> None:
    metric_table = Table(title="Strategy Summary", box=_theme(ascii_only)["box"])
    metric_table.add_column("Metric", style="cyan")
    metric_table.add_column("Value", justify="right")
    metric_table.add_row("Annual Return", f"{float(metrics.get('annual_return', 0.0)):+.2%}")
    metric_table.add_row("Sharpe", f"{float(metrics.get('sharpe', 0.0)):+.4f}")
    metric_table.add_row("Max Drawdown", f"{float(metrics.get('max_drawdown', 0.0)):+.2%}")
    metric_table.add_row("Win Rate", f"{float(metrics.get('win_rate', 0.0)):.0%}")
    metric_table.add_row("Avg Turnover", f"{float(metrics.get('avg_turnover', 0.0)):.2f}")
    metric_table.add_row("Trades", str(metrics.get("total_trades", 0)))
    console.print(metric_table)
    console.print(_build_score_table(stocks, ascii_only))
    if alerts:
        console.print("[bold red]Active Alerts[/]")
        for alert in alerts:
            console.print(
                _safe_text(
                    f"- {alert.get('ticker', '?')}: {alert.get('message', alert.get('signal_type', ''))}",
                    ascii_only,
                )
            )
    else:
        console.print("[green]No active alerts.[/]")


def _build_stock_rows(scored_df: Any) -> list[dict[str, Any]]:
    return [
        {
            "ticker": str(row["ticker"]),
            "rank": int(row["rank"]),
            "composite_score": float(row["composite_score"]),
        }
        for _, row in scored_df.iterrows()
    ]


def _find_stock_row(stocks: list[dict[str, Any]], ticker: str) -> dict[str, Any] | None:
    target = ticker.upper()
    for stock in stocks:
        if str(stock.get("ticker", "")).upper() == target:
            return stock
    return None


def _build_ticker_breakdown(
    scored_df: Any,
    factor_weights: list[dict[str, Any]],
    ticker: str,
) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    ticker = ticker.upper()
    by_ticker = scored_df.set_index("ticker")
    if ticker not in by_ticker.index:
        raise ValueError(f"Ticker {ticker} is not present in the scored universe.")

    stock_row = by_ticker.loc[ticker].to_dict()
    contributions: list[dict[str, Any]] = []

    for factor in factor_weights:
        name = str(factor["name"])
        if name not in by_ticker.columns:
            continue

        factor_series = by_ticker[name].dropna()
        if ticker not in factor_series.index:
            continue

        raw_rank = float(factor_series.rank(method="average", ascending=True).loc[ticker])
        effective_rank = (len(factor_series) + 1 - raw_rank) if float(factor["ic"]) < 0 else raw_rank
        contribution = effective_rank * abs(float(factor["ic"]))

        contributions.append(
            {
                "factor": name,
                "value": float(factor_series.loc[ticker]),
                "ic": float(factor["ic"]),
                "rank": raw_rank,
                "effective_rank": effective_rank,
                "contribution": contribution,
            }
        )

    contributions.sort(key=lambda item: item["contribution"], reverse=True)
    return stock_row, contributions


def _ticker_history(history_rows: list[dict[str, Any]], ticker: str) -> list[dict[str, Any]]:
    target = ticker.upper()
    related_rows: list[dict[str, Any]] = []
    for row in history_rows:
        entries = [str(value).upper() for value in row.get("entries", [])]
        exits = [str(value).upper() for value in row.get("exits", [])]
        holdings = [str(value).upper() for value in row.get("holdings", [])]

        if target not in entries and target not in exits and target not in holdings:
            continue

        actions: list[str] = []
        if target in entries:
            actions.append("ENTRY")
        if target in exits:
            actions.append("EXIT")
        if target in holdings:
            actions.append("HELD")

        related_rows.append(
            {
                "date": row.get("date", ""),
                "action": ",".join(actions) if actions else "HELD",
                "day_return": float(row.get("day_return", 0.0)),
                "turnover": float(row.get("turnover", 0.0)),
            }
        )
    return related_rows


def _render_ticker_focus(
    console: Console,
    ticker: str,
    scored_df: Any,
    factor_weights: list[dict[str, Any]],
    alerts: list[dict[str, Any]],
    history_rows: list[dict[str, Any]],
    ascii_only: bool,
    show_last: int = 8,
) -> None:
    ticker = ticker.upper()
    stock_row, contributions = _build_ticker_breakdown(scored_df, factor_weights, ticker)
    related_alerts = [alert for alert in alerts if str(alert.get("ticker", "")).upper() == ticker]
    history = _ticker_history(history_rows, ticker)

    console.rule(_safe_text(f"Ticker Focus: {ticker}", ascii_only))

    summary = Table(title=f"{ticker} Snapshot", box=_theme(ascii_only)["box"])
    summary.add_column("Metric", style="cyan")
    summary.add_column("Value", justify="right")
    summary.add_row("Rank", str(int(stock_row.get("rank", 0))))
    summary.add_row("Composite Score", f"{float(stock_row.get('composite_score', 0.0)):.1f}")
    summary.add_row("Signal", _safe_text(_stock_signal(float(stock_row.get("composite_score", 0.0))), ascii_only))
    summary.add_row("Alert Count", str(len(related_alerts)))
    if history:
        summary.add_row("Held Days", str(sum(1 for row in history if "HELD" in row["action"])))
        summary.add_row("Entries", str(sum(1 for row in history if "ENTRY" in row["action"])))
        summary.add_row("Exits", str(sum(1 for row in history if "EXIT" in row["action"])))
    else:
        summary.add_row("Replay History", "Not computed")
    console.print(summary)

    contribution_table = Table(title="Factor Contribution Breakdown", box=_theme(ascii_only)["box"])
    contribution_table.add_column("Factor", style="cyan")
    contribution_table.add_column("Value", justify="right")
    contribution_table.add_column("IC", justify="right")
    contribution_table.add_column("Adj Rank", justify="right")
    contribution_table.add_column("Contribution", justify="right")
    for item in contributions[:8]:
        contribution_table.add_row(
            _safe_text(item["factor"], ascii_only),
            f"{item['value']:.4f}",
            f"{item['ic']:+.4f}",
            f"{item['effective_rank']:.1f}",
            f"{item['contribution']:.4f}",
        )
    console.print(contribution_table)

    if related_alerts:
        console.print("[bold yellow]Ticker Alerts[/]")
        for alert in related_alerts:
            console.print(_safe_text(f"- {alert.get('message', alert.get('signal_type', ''))}", ascii_only))
    else:
        console.print("[green]No ticker-specific alerts.[/]")

    if history:
        history_table = Table(title="Ticker Replay History", box=_theme(ascii_only)["box"])
        history_table.add_column("Date", width=12)
        history_table.add_column("Action", width=16)
        history_table.add_column("Day Ret", justify="right", width=10)
        history_table.add_column("Turnover", justify="right", width=10)
        for row in history[-show_last:]:
            history_table.add_row(
                _safe_text(row["date"], ascii_only),
                _safe_text(row["action"], ascii_only),
                f"{row['day_return']:+.2%}",
                f"{row['turnover']:.2f}",
            )
        console.print(history_table)


def _parse_compare_specs(
    compare_specs: list[str],
    base_config: dict[str, Any],
) -> list[dict[str, Any]]:
    scenarios = [{"label": "base", **base_config}]

    alias_map = {
        "label": "label",
        "topk": "topk",
        "n_drop": "n_drop",
        "n-drop": "n_drop",
        "end": "end_date",
        "end_date": "end_date",
        "top_n": "top_n_factors",
        "top-n": "top_n_factors",
        "top_n_factors": "top_n_factors",
    }

    for index, raw_spec in enumerate(compare_specs, start=1):
        scenario = dict(base_config)
        scenario["label"] = f"scenario-{index}"

        for piece in raw_spec.split(","):
            item = piece.strip()
            if not item:
                continue
            if "=" not in item:
                raise ValueError(
                    f'Invalid compare spec "{raw_spec}". Use comma-separated key=value pairs, '
                    'for example: --compare "label=defensive,topk=3,n_drop=1"'
                )
            key, value = item.split("=", 1)
            normalized_key = alias_map.get(key.strip().lower())
            if normalized_key is None:
                raise ValueError(
                    f'Unsupported compare field "{key}". Supported fields: '
                    "label, topk, n_drop, end, top_n"
                )

            value = value.strip()
            if normalized_key == "label":
                scenario["label"] = value or scenario["label"]
            elif normalized_key in ("topk", "n_drop", "top_n_factors"):
                scenario[normalized_key] = int(value)
            else:
                scenario[normalized_key] = value

        scenarios.append(scenario)

    return scenarios


def _run_scenario_bundle(
    tickers: list[str],
    thesis_name: str | None,
    start_date: str,
    end_date: str | None,
    topk: int,
    n_drop: int,
    top_n_factors: int,
    include_history: bool,
) -> dict[str, Any]:
    started = time.perf_counter()
    timings: dict[str, float] = {}

    if end_date is None:
        end_date = datetime.today().strftime("%Y-%m-%d")

    load_started = time.perf_counter()
    ensure_qlib_init()
    available_tickers, skipped = filter_available_instruments(tickers)
    if not available_tickers:
        raise ValueError("None of the requested tickers are available in the local Qlib store.")
    features = _load_alpha158_features(available_tickers, start_date, end_date)
    timings["load"] = time.perf_counter() - load_started

    factor_started = time.perf_counter()
    forward_returns = _compute_forward_returns(available_tickers, start_date, end_date, lookahead=1)
    ic_data = _compute_ic_series(features, forward_returns)
    if not ic_data:
        raise ValueError("IC computation returned no results for the selected window.")

    sorted_factors = sorted(
        [{"name": name, "ic": values["ic"], "icir": values["icir"]} for name, values in ic_data.items()],
        key=lambda item: abs(float(item["ic"])),
        reverse=True,
    )
    for rank, factor in enumerate(sorted_factors, start=1):
        factor["rank"] = rank
    timings["factor"] = time.perf_counter() - factor_started

    score_started = time.perf_counter()
    factor_weights = sorted_factors[:top_n_factors]
    scored_df = _compute_composite_scores(features, factor_weights)
    alerts = _evaluate_signals(scored_df, features, factor_weights)
    stocks = _build_stock_rows(scored_df)
    timings["score"] = time.perf_counter() - score_started

    backtest_started = time.perf_counter()
    backtest_result = run_backtest(
        tickers=available_tickers,
        universe_name=thesis_name or "custom",
        start_date=start_date,
        end_date=end_date,
        topk=topk,
        n_drop=n_drop,
        include_artifacts=include_history,
    )
    timings["backtest"] = time.perf_counter() - backtest_started

    metrics = {**backtest_result.get("metrics", {})}
    metrics["annual_return"] = backtest_result.get("annual_return", 0.0)
    metrics["sharpe"] = backtest_result.get("sharpe", 0.0)
    metrics["max_drawdown"] = backtest_result.get("max_drawdown", 0.0)
    timings["total"] = time.perf_counter() - started

    return {
        "thesis_name": thesis_name,
        "available_tickers": available_tickers,
        "skipped_tickers": skipped,
        "sorted_factors": sorted_factors,
        "factor_weights": factor_weights,
        "scored_df": scored_df,
        "stocks": stocks,
        "alerts": alerts,
        "backtest_result": backtest_result,
        "history_rows": backtest_result.get("portfolio_history", []),
        "metrics": metrics,
        "start_date": start_date,
        "end_date": end_date,
        "topk": topk,
        "n_drop": n_drop,
        "top_n_factors": top_n_factors,
        "timings": timings,
    }


def _render_comparison(
    console: Console,
    bundles: list[dict[str, Any]],
    ticker_focus: str | None,
    ascii_only: bool,
) -> None:
    table = Table(title="Scenario Comparison", box=_theme(ascii_only)["box"])
    table.add_column("Scen", style="cyan", width=10)
    table.add_column("End", width=10)
    table.add_column("K", justify="right", width=3)
    table.add_column("Drop", justify="right", width=5)
    table.add_column("Top", width=6)
    table.add_column("Alrt", justify="right", width=4)
    table.add_column("Ann", justify="right", width=7)
    table.add_column("Shp", justify="right", width=7)
    table.add_column("MDD", justify="right", width=7)
    if ticker_focus:
        table.add_column(f"{ticker_focus.upper()}#", justify="right", width=5)
        table.add_column(f"{ticker_focus.upper()}S", justify="right", width=6)

    for bundle in bundles:
        metrics = bundle["metrics"]
        stocks = bundle["stocks"]
        top_ticker = stocks[0]["ticker"] if stocks else "-"
        row = [
            _safe_text(bundle["label"], ascii_only),
            _safe_text(bundle["end_date"], ascii_only),
            str(bundle["topk"]),
            str(bundle["n_drop"]),
            _safe_text(top_ticker, ascii_only),
            str(len(bundle["alerts"])),
            f"{float(metrics.get('annual_return', 0.0)):+.2%}",
            f"{float(metrics.get('sharpe', 0.0)):+.4f}",
            f"{float(metrics.get('max_drawdown', 0.0)):+.2%}",
        ]

        if ticker_focus:
            stock = _find_stock_row(stocks, ticker_focus)
            row.append(str(stock["rank"]) if stock else "-")
            row.append(f"{float(stock['composite_score']):.1f}" if stock else "-")

        table.add_row(*row)

    console.print(table)


def _render_timings(
    console: Console,
    timings: dict[str, float],
    ascii_only: bool,
    title: str = "Phase Timings",
) -> None:
    if not timings:
        return

    table = Table(title=title, box=_theme(ascii_only)["box"])
    table.add_column("Phase", style="cyan")
    table.add_column("Seconds", justify="right")
    for key, value in timings.items():
        table.add_row(_safe_text(key, ascii_only), f"{value:.2f}")
    console.print(table)


def _render_compare_timings(
    console: Console,
    bundles: list[dict[str, Any]],
    ascii_only: bool,
) -> None:
    table = Table(title="Scenario Timings", box=_theme(ascii_only)["box"])
    table.add_column("Scen", style="cyan", width=10)
    table.add_column("Load", justify="right", width=6)
    table.add_column("Fact", justify="right", width=6)
    table.add_column("Score", justify="right", width=6)
    table.add_column("Bktst", justify="right", width=7)
    table.add_column("Total", justify="right", width=7)
    for bundle in bundles:
        timings = bundle.get("timings", {})
        table.add_row(
            _safe_text(bundle["label"], ascii_only),
            f"{float(timings.get('load', 0.0)):.2f}",
            f"{float(timings.get('factor', 0.0)):.2f}",
            f"{float(timings.get('score', 0.0)):.2f}",
            f"{float(timings.get('backtest', 0.0)):.2f}",
            f"{float(timings.get('total', 0.0)):.2f}",
        )
    console.print(table)


def _snapshot_payload(
    bundle: dict[str, Any],
    ticker_focus: str | None,
    show_last: int,
) -> dict[str, Any]:
    payload = {
        "label": bundle.get("label"),
        "thesis": bundle.get("thesis_name"),
        "start_date": bundle.get("start_date"),
        "end_date": bundle.get("end_date"),
        "topk": bundle.get("topk"),
        "n_drop": bundle.get("n_drop"),
        "top_n_factors": bundle.get("top_n_factors"),
        "available_tickers": bundle.get("available_tickers", []),
        "skipped_tickers": bundle.get("skipped_tickers", []),
        "factor_rankings": bundle.get("sorted_factors", [])[:10],
        "stocks": bundle.get("stocks", [])[:10],
        "alerts": bundle.get("alerts", []),
        "metrics": bundle.get("metrics", {}),
        "timings": bundle.get("timings", {}),
        "history": bundle.get("history_rows", [])[-show_last:],
    }

    if ticker_focus and bundle.get("scored_df") is not None:
        try:
            stock_row, contributions = _build_ticker_breakdown(
                bundle["scored_df"],
                bundle.get("factor_weights", []),
                ticker_focus,
            )
            payload["ticker_focus"] = {
                "ticker": ticker_focus.upper(),
                "stock": stock_row,
                "contributions": contributions[:8],
                "history": _ticker_history(bundle.get("history_rows", []), ticker_focus)[-show_last:],
                "alerts": [
                    alert for alert in bundle.get("alerts", [])
                    if str(alert.get("ticker", "")).upper() == ticker_focus.upper()
                ],
            }
        except ValueError:
            payload["ticker_focus"] = {"ticker": ticker_focus.upper(), "error": "Ticker not present in scenario"}

    return payload


def _markdown_snapshot(payload: dict[str, Any]) -> str:
    lines = [
        f"# Qlib Simulation Snapshot - {payload.get('label') or payload.get('thesis') or 'custom'}",
        "",
        f"- Thesis: {payload.get('thesis') or 'custom'}",
        f"- Window: {payload.get('start_date')} -> {payload.get('end_date')}",
        f"- TopK / NDrop: {payload.get('topk')} / {payload.get('n_drop')}",
        f"- Top N Factors: {payload.get('top_n_factors')}",
        "",
        "## Metrics",
        "",
    ]

    metrics = payload.get("metrics", {})
    metric_rows = [[key, value] for key, value in metrics.items()]
    if metric_rows:
        lines.append(build_table(["Metric", "Value"], metric_rows))
        lines.append("")

    factor_rows = [
        [row.get("rank", ""), row.get("name", ""), f"{float(row.get('ic', 0.0)):+.4f}", f"{float(row.get('icir', 0.0)):+.4f}"]
        for row in payload.get("factor_rankings", [])
    ]
    if factor_rows:
        lines.extend(["## Factors", "", build_table(["Rank", "Factor", "IC", "ICIR"], factor_rows), ""])

    stock_rows = [
        [row.get("rank", ""), row.get("ticker", ""), f"{float(row.get('composite_score', 0.0)):.1f}"]
        for row in payload.get("stocks", [])
    ]
    if stock_rows:
        lines.extend(["## Scoreboard", "", build_table(["Rank", "Ticker", "Score"], stock_rows), ""])

    alerts = payload.get("alerts", [])
    if alerts:
        lines.append("## Alerts")
        lines.append("")
        for alert in alerts:
            lines.append(f"- {alert.get('ticker', '?')}: {alert.get('message', alert.get('signal_type', ''))}")
        lines.append("")

    ticker_data = payload.get("ticker_focus")
    if ticker_data:
        lines.extend([f"## Ticker Focus: {ticker_data.get('ticker', '')}", ""])
        if ticker_data.get("error"):
            lines.extend([ticker_data["error"], ""])
        else:
            stock = ticker_data.get("stock", {})
            lines.append(build_table(["Metric", "Value"], [[key, value] for key, value in stock.items()]))
            lines.append("")

    return "\n".join(lines).strip() + "\n"


def _default_snapshot_path(
    thesis_name: str | None,
    save_format: str,
    compare_mode: bool,
) -> Path:
    base_dir = Path(__file__).resolve().parents[1] / ".cache" / "qlib_sim"
    base_dir.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    name = _sanitize_filename_segment(thesis_name or "custom")
    suffix = "compare" if compare_mode else "snapshot"
    return base_dir / f"{stamp}_{name}_{suffix}.{save_format}"


def _write_snapshot(
    *,
    bundles: list[dict[str, Any]],
    thesis_name: str | None,
    ticker_focus: str | None,
    show_last: int,
    save_format: str,
    save_path: str | None,
    compare_mode: bool,
) -> Path:
    output_path = Path(save_path) if save_path else _default_snapshot_path(thesis_name, save_format, compare_mode)
    if not output_path.is_absolute():
        output_path = (Path.cwd() / output_path).resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)

    payload = {
        "mode": "compare" if compare_mode else "single",
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "scenarios": [_snapshot_payload(bundle, ticker_focus, show_last) for bundle in bundles],
    }

    if save_format == "json":
        output_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    else:
        if compare_mode:
            sections = [_markdown_snapshot(scenario) for scenario in payload["scenarios"]]
            output_path.write_text("\n\n".join(sections), encoding="utf-8")
        else:
            output_path.write_text(_markdown_snapshot(payload["scenarios"][0]), encoding="utf-8")

    return output_path


def _demo_simulation(console: Console, thesis_name: str | None, ascii_only: bool, speed: float) -> None:
    rng = random.Random(42)
    tickers = ["AAA", "BBB", "CCC", "DDD", "EEE"]
    factors = [
        {"name": "DEMO1", "ic": 0.1245, "icir": 1.21, "rank": 1},
        {"name": "DEMO2", "ic": -0.0821, "icir": -0.94, "rank": 2},
        {"name": "DEMO3", "ic": 0.0573, "icir": 0.63, "rank": 3},
    ]
    stocks = []
    for rank, ticker in enumerate(tickers, start=1):
        stocks.append({
            "ticker": ticker,
            "rank": rank,
            "composite_score": round(100 - rank * 15.5, 1),
        })

    console.rule("Demo Mode")
    console.print(f"[yellow]Running explicit fallback/demo mode for {thesis_name or 'custom universe'}.[/]")
    console.print(_build_factor_table(factors, ascii_only))
    _sleep(speed)
    console.print(_build_score_table(stocks, ascii_only))
    _sleep(speed)

    history_rows: list[dict[str, Any]] = []
    cumulative_values: list[float] = []
    daily_returns: list[float] = []
    cumulative = 1.0
    with Live(console=console, refresh_per_second=20) as live:
        for offset in range(8):
            day_return = rng.uniform(-0.02, 0.03)
            cumulative *= 1.0 + day_return
            daily_returns.append(day_return)
            cumulative_values.append(cumulative)
            history_rows.append({
                "date": f"2026-04-{offset + 1:02d}",
                "holdings": tickers[:3],
                "entries": [tickers[offset % len(tickers)]],
                "exits": [],
                "day_return": day_return,
            })
            table = _build_replay_table(history_rows, cumulative_values, ascii_only)
            live.update(Panel(table, title="Demo Replay", box=_theme(ascii_only)["box"]))
            _sleep(speed)

    _render_summary(
        console,
        {
            "annual_return": cumulative - 1.0,
            "sharpe": 1.234,
            "max_drawdown": -0.05,
            "win_rate": 0.625,
            "avg_turnover": 0.33,
            "total_trades": 8,
        },
        stocks,
        [],
        ascii_only,
    )


def run_simulation(
    tickers: list[str] | None = None,
    thesis_name: str | None = None,
    start_date: str = "2020-01-01",
    end_date: str | None = None,
    topk: int = 5,
    n_drop: int = 2,
    speed: str = "normal",
    top_n_factors: int = 5,
    ascii_only: bool = False,
    allow_fallback: bool = False,
    summary_only: bool = False,
    ticker_focus: str | None = None,
    compare_specs: list[str] | None = None,
    phase: str = "replay",
    show_last: int = 8,
    show_timings: bool = False,
    save_format: str | None = None,
    save_path: str | None = None,
) -> None:
    """Run the full terminal simulation using the real Qlib pipeline."""
    delay = {"slow": 0.15, "normal": 0.06, "fast": 0.015, "instant": 0.0}.get(speed, 0.06)
    ascii_only = ascii_only or not _supports_unicode()
    console = Console(safe_box=ascii_only)
    phase_order = {"factors": 2, "score": 3, "backtest": 4, "replay": 5}
    target_phase = phase_order.get(phase, 5)
    show_last = max(1, int(show_last))

    if end_date is None:
        end_date = datetime.today().strftime("%Y-%m-%d")

    if thesis_name:
        tickers = get_thesis_tickers(thesis_name)

    if not tickers:
        if allow_fallback:
            _demo_simulation(console, thesis_name, ascii_only, delay)
            return
        raise ValueError("No tickers provided. Pass --tickers or --thesis.")

    if compare_specs:
        console.print(
            Panel(
                _safe_text(
                    "Comparison mode runs summary output only.\n"
                    f"Base scenario: end={end_date or datetime.today().strftime('%Y-%m-%d')}, "
                    f"topk={topk}, n_drop={n_drop}, top_n={top_n_factors}",
                    ascii_only,
                ),
                box=_theme(ascii_only)["box"],
            )
        )

        scenarios = _parse_compare_specs(
            compare_specs,
            {
                "tickers": tickers,
                "thesis_name": thesis_name,
                "start_date": start_date,
                "end_date": end_date or datetime.today().strftime("%Y-%m-%d"),
                "topk": topk,
                "n_drop": n_drop,
                "top_n_factors": top_n_factors,
            },
        )

        bundles: list[dict[str, Any]] = []
        for scenario in scenarios:
            bundle = _run_scenario_bundle(
                tickers=scenario["tickers"],
                thesis_name=scenario["thesis_name"],
                start_date=scenario["start_date"],
                end_date=scenario["end_date"],
                topk=scenario["topk"],
                n_drop=scenario["n_drop"],
                top_n_factors=scenario["top_n_factors"],
                include_history=bool(ticker_focus),
            )
            bundle["label"] = scenario["label"]
            bundles.append(bundle)

        _render_comparison(console, bundles, ticker_focus, ascii_only)
        if show_timings:
            _render_compare_timings(console, bundles, ascii_only)
        if save_format:
            snapshot_path = _write_snapshot(
                bundles=bundles,
                thesis_name=thesis_name,
                ticker_focus=ticker_focus,
                show_last=show_last,
                save_format=save_format,
                save_path=save_path,
                compare_mode=True,
            )
            console.print(_safe_text(f"Saved snapshot: {snapshot_path}", ascii_only))
        return

    console.print(
        Panel(
            f"Qlib Pipeline Simulator\n"
            f"Universe: {thesis_name or 'custom'}\n"
            f"Tickers: {', '.join(tickers[:8])}{'...' if len(tickers) > 8 else ''}\n"
            f"Window: {start_date}{_theme(ascii_only)['sep']}{end_date} | TopK={topk} | Speed={speed} | ASCII={ascii_only}",
            box=_theme(ascii_only)["box"],
        )
    )

    try:
        phase_timings: dict[str, float] = {}
        run_started = time.perf_counter()
        available_tickers: list[str] = []
        skipped: list[str] = []
        sorted_factors: list[dict[str, Any]] = []
        factor_weights: list[dict[str, Any]] = []
        scored_df = None
        alerts: list[dict[str, Any]] = []
        stocks: list[dict[str, Any]] = []
        backtest_result: dict[str, Any] = {}
        metrics: dict[str, Any] = {}
        history_rows: list[dict[str, Any]] = []
        features = None

        console.rule("Phase 1: Loading Data")
        phase_started = time.perf_counter()
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            console=console,
        ) as progress:
            task = progress.add_task("Initialising Qlib and loading features", total=3)
            ensure_qlib_init()
            progress.advance(task)
            available_tickers, skipped = filter_available_instruments(tickers)
            progress.advance(task)
            if not available_tickers:
                raise ValueError("None of the requested tickers are available in the local Qlib store.")
            features = _load_alpha158_features(available_tickers, start_date, end_date)
            progress.advance(task)
        phase_timings["load"] = time.perf_counter() - phase_started

        console.print(f"Available: {', '.join(available_tickers)}")
        if skipped:
            console.print(_safe_text(f"Skipped: {', '.join(skipped)}", ascii_only))

        console.rule("Phase 2: Factor Analysis")
        phase_started = time.perf_counter()
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            console=console,
        ) as progress:
            task = progress.add_task("Computing forward returns", total=3)
            forward_returns = _compute_forward_returns(available_tickers, start_date, end_date, lookahead=1)
            progress.update(task, advance=1, description="Calculating factor IC / ICIR")
            ic_data = _compute_ic_series(features, forward_returns)
            progress.update(task, advance=1, description="Ranking factors for scoring")
            progress.advance(task)
        if not ic_data:
            raise ValueError("IC computation returned no results for the selected window.")
        sorted_factors = sorted(
            [{"name": name, "ic": values["ic"], "icir": values["icir"]} for name, values in ic_data.items()],
            key=lambda item: abs(float(item["ic"])),
            reverse=True,
        )
        for rank, factor in enumerate(sorted_factors, start=1):
            factor["rank"] = rank
        factor_weights = sorted_factors[:top_n_factors]
        console.print(_build_factor_table(sorted_factors, ascii_only))
        phase_timings["factor"] = time.perf_counter() - phase_started

        if target_phase <= 2:
            phase_timings["total"] = time.perf_counter() - run_started
            single_bundle = {
                "label": phase,
                "thesis_name": thesis_name,
                "start_date": start_date,
                "end_date": end_date,
                "topk": topk,
                "n_drop": n_drop,
                "top_n_factors": top_n_factors,
                "available_tickers": available_tickers,
                "skipped_tickers": skipped,
                "sorted_factors": sorted_factors,
                "factor_weights": factor_weights,
                "alerts": [],
                "stocks": [],
                "metrics": {},
                "history_rows": [],
                "timings": phase_timings,
            }
            if show_timings:
                _render_timings(console, phase_timings, ascii_only)
            if save_format:
                snapshot_path = _write_snapshot(
                    bundles=[single_bundle],
                    thesis_name=thesis_name,
                    ticker_focus=None,
                    show_last=show_last,
                    save_format=save_format,
                    save_path=save_path,
                    compare_mode=False,
                )
                console.print(_safe_text(f"Saved snapshot: {snapshot_path}", ascii_only))
            return

        console.rule("Phase 3: Composite Scoring")
        phase_started = time.perf_counter()
        scored_df = _compute_composite_scores(features, factor_weights)
        alerts = _evaluate_signals(scored_df, features, factor_weights)
        stocks = _build_stock_rows(scored_df)
        console.print(_build_score_table(stocks, ascii_only))
        if alerts:
            console.print(f"[yellow]Alerts triggered: {len(alerts)}[/]")
        phase_timings["score"] = time.perf_counter() - phase_started

        if target_phase <= 3:
            phase_timings["total"] = time.perf_counter() - run_started
            if ticker_focus:
                _render_ticker_focus(console, ticker_focus, scored_df, factor_weights, alerts, [], ascii_only, show_last=show_last)
            if show_timings:
                _render_timings(console, phase_timings, ascii_only)
            if save_format:
                snapshot_path = _write_snapshot(
                    bundles=[{
                        "label": phase,
                        "thesis_name": thesis_name,
                        "start_date": start_date,
                        "end_date": end_date,
                        "topk": topk,
                        "n_drop": n_drop,
                        "top_n_factors": top_n_factors,
                        "available_tickers": available_tickers,
                        "skipped_tickers": skipped,
                        "sorted_factors": sorted_factors,
                        "factor_weights": factor_weights,
                        "scored_df": scored_df,
                        "alerts": alerts,
                        "stocks": stocks,
                        "metrics": {},
                        "history_rows": [],
                        "timings": phase_timings,
                    }],
                    thesis_name=thesis_name,
                    ticker_focus=ticker_focus,
                    show_last=show_last,
                    save_format=save_format,
                    save_path=save_path,
                    compare_mode=False,
                )
                console.print(_safe_text(f"Saved snapshot: {snapshot_path}", ascii_only))
            return

        console.rule("Phase 4: Backtest Preparation")
        phase_started = time.perf_counter()
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console,
        ) as progress:
            task = progress.add_task("Training model and preparing replay", total=None)
            backtest_result = run_backtest(
                tickers=available_tickers,
                universe_name=thesis_name or "custom",
                start_date=start_date,
                end_date=end_date,
                topk=topk,
                n_drop=n_drop,
                include_artifacts=(not summary_only) or bool(ticker_focus),
            )
            progress.remove_task(task)
        phase_timings["backtest"] = time.perf_counter() - phase_started

        metrics = {**backtest_result.get("metrics", {})}
        metrics["annual_return"] = backtest_result.get("annual_return", 0.0)
        metrics["sharpe"] = backtest_result.get("sharpe", 0.0)
        metrics["max_drawdown"] = backtest_result.get("max_drawdown", 0.0)
        console.print(_safe_text(f"Train Window: {metrics.get('train_window', 'n/a')}", ascii_only))
        console.print(_safe_text(f"Test Window : {metrics.get('test_window', 'n/a')}", ascii_only))

        history_rows = backtest_result.get("portfolio_history", [])
        if summary_only or target_phase <= 4:
            console.rule("Phase 5: Portfolio Replay")
            replay_reason = "Replay skipped (--summary-only)." if summary_only else f"Replay skipped (--phase {phase})."
            console.print(_safe_text(replay_reason, ascii_only))
        else:
            console.rule("Phase 5: Portfolio Replay")
            if not history_rows:
                raise ValueError("Backtest replay produced no holdings history.")

            phase_started = time.perf_counter()
            cumulative_values: list[float] = []
            running_returns: list[float] = []
            cumulative_value = 1.0
            with Live(console=console, refresh_per_second=20) as live:
                for row in history_rows:
                    day_return = float(row.get("day_return", 0.0))
                    cumulative_value *= 1.0 + day_return
                    cumulative_values.append(cumulative_value)
                    running_returns.append(day_return)

                    replay_table = _build_replay_table(
                        history_rows[: len(cumulative_values)],
                        cumulative_values,
                        ascii_only,
                        show_last=show_last,
                    )
                    metric_panel = Table(box=_theme(ascii_only)["box"], show_header=False)
                    metric_panel.add_column("Metric", style="cyan")
                    metric_panel.add_column("Value", justify="right")
                    for label, value in _running_metrics(running_returns, cumulative_value).items():
                        metric_panel.add_row(label, value)

                    live.update(
                        Panel(
                            Group(replay_table, metric_panel),
                            title="Replay",
                            box=_theme(ascii_only)["box"],
                        )
                    )
                    _sleep(delay)
            phase_timings["replay"] = time.perf_counter() - phase_started

        console.rule("Phase 6: Summary")
        _render_summary(console, metrics, stocks, alerts, ascii_only)
        if ticker_focus:
            _render_ticker_focus(console, ticker_focus, scored_df, factor_weights, alerts, history_rows, ascii_only, show_last=show_last)
        phase_timings["total"] = time.perf_counter() - run_started
        if show_timings:
            _render_timings(console, phase_timings, ascii_only)
        if save_format:
            snapshot_path = _write_snapshot(
                bundles=[{
                    "label": phase,
                    "thesis_name": thesis_name,
                    "start_date": start_date,
                    "end_date": end_date,
                    "topk": topk,
                    "n_drop": n_drop,
                    "top_n_factors": top_n_factors,
                    "available_tickers": available_tickers,
                    "skipped_tickers": skipped,
                    "sorted_factors": sorted_factors,
                    "factor_weights": factor_weights,
                    "scored_df": scored_df,
                    "alerts": alerts,
                    "stocks": stocks,
                    "metrics": metrics,
                    "history_rows": history_rows,
                    "timings": phase_timings,
                }],
                thesis_name=thesis_name,
                ticker_focus=ticker_focus,
                show_last=show_last,
                save_format=save_format,
                save_path=save_path,
                compare_mode=False,
            )
            console.print(_safe_text(f"Saved snapshot: {snapshot_path}", ascii_only))

    except (RuntimeError, ValueError) as exc:
        if allow_fallback:
            console.print(f"[yellow]Simulation failed in trusted mode: {exc}[/]")
            _demo_simulation(console, thesis_name, ascii_only, delay)
            return
        raise


if __name__ == "__main__":
    run_simulation(thesis_name="Housing", ascii_only=True)
