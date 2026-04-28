"""
report.py — Obsidian-compatible Markdown note generator for Qlib analysis results.

Mirrors the patterns of the Node.js markdown.mjs library:
  - build_frontmatter  →  buildFrontmatter
  - build_table        →  buildTable
  - build_note         →  buildNote
  - write_note         →  writeNote

All functions return new strings/objects — no mutation (immutable pattern).
"""

import os
import re
from datetime import date
from pathlib import Path

from common import QUANT_DIR as _QUANT_DIR
from common import VAULT_ROOT as _VAULT_ROOT
from contracts import (
    backtest_frontmatter_fields,
    factor_frontmatter_fields,
    score_frontmatter_fields,
)

# ---------------------------------------------------------------------------
# Vault root — used by write_factor_report / write_backtest_report as default
# ---------------------------------------------------------------------------


# ---------------------------------------------------------------------------
# Date helpers
# ---------------------------------------------------------------------------

def today() -> str:
    """Return today's date as a YYYY-MM-DD string."""
    return date.today().isoformat()


def date_stamped_filename(name: str) -> str:
    """Return a date-stamped filename in 'YYYY-MM-DD_Name.md' format.

    The name segment is sanitised: path-unsafe characters are replaced with
    underscores and runs of underscores are collapsed.
    """
    safe = _sanitize_filename_segment(name)
    return f"{today()}_{safe}.md"


# ---------------------------------------------------------------------------
# Frontmatter
# ---------------------------------------------------------------------------

def build_frontmatter(fields: dict) -> str:
    """Build a YAML frontmatter block enclosed in --- delimiters.

    Type handling (mirrors markdown.mjs serializeYamlField):
      - str    → always double-quoted
      - int / float / bool → bare value
      - list   → inline bracket format for simple (str/number) lists;
                 block style for lists containing dicts
      - dict   → block style with indented sub-keys
      - None   → field is omitted
    """
    lines = ["---"]
    for key, value in fields.items():
        if value is None:
            continue
        lines.append(_serialize_yaml_field(key, value, indent=0))
    lines.append("---")
    return "\n".join(lines)


def _serialize_yaml_field(key: str, value, indent: int) -> str:
    """Recursively serialize a single YAML key/value pair."""
    prefix = "  " * indent

    if isinstance(value, bool):
        # Must check bool before int — bool is a subclass of int in Python
        return f"{prefix}{key}: {str(value).lower()}"

    if isinstance(value, str):
        escaped = value.replace('"', '\\"')
        return f'{prefix}{key}: "{escaped}"'

    if isinstance(value, (int, float)):
        return f"{prefix}{key}: {value}"

    if isinstance(value, list):
        if not value:
            return f"{prefix}{key}: []"
        # Simple lists — inline bracket format
        if all(isinstance(v, (str, int, float, bool)) for v in value):
            items = []
            for v in value:
                if isinstance(v, bool):
                    items.append(str(v).lower())
                elif isinstance(v, str):
                    items.append(f'"{v}"')
                else:
                    items.append(str(v))
            return f"{prefix}{key}: [{', '.join(items)}]"
        # Complex lists — block style
        item_lines = []
        for v in value:
            if isinstance(v, dict):
                sub = "\n".join(
                    _serialize_yaml_field(k, val, indent + 2)
                    for k, val in v.items()
                )
                item_lines.append(f"{prefix}  -\n{sub}")
            elif isinstance(v, str):
                item_lines.append(f'{prefix}  - "{v}"')
            else:
                item_lines.append(f"{prefix}  - {v}")
        return f"{prefix}{key}:\n" + "\n".join(item_lines)

    if isinstance(value, dict):
        sub = "\n".join(
            _serialize_yaml_field(k, v, indent + 1)
            for k, v in value.items()
        )
        return f"{prefix}{key}:\n{sub}"

    return f"{prefix}{key}: {value}"


# ---------------------------------------------------------------------------
# Table
# ---------------------------------------------------------------------------

def build_table(headers: list, rows: list) -> str:
    """Build a pipe-delimited Markdown table.

    Pipe characters inside cell values are escaped as \\|.
    Empty headers list returns an empty string.
    """
    if not headers:
        return ""

    header_row = "| " + " | ".join(headers) + " |"
    separator = "| " + " | ".join("---" for _ in headers) + " |"

    data_rows = []
    for row in rows:
        cells = [
            _escape_table_cell(row[i] if i < len(row) else "")
            for i in range(len(headers))
        ]
        data_rows.append("| " + " | ".join(cells) + " |")

    return "\n".join([header_row, separator] + data_rows)


def _escape_table_cell(value) -> str:
    return str(value).replace("|", "\\|").replace("\n", " ")


# ---------------------------------------------------------------------------
# Note assembly
# ---------------------------------------------------------------------------

def build_note(frontmatter: dict, sections: list) -> str:
    """Build a complete Obsidian-compatible Markdown note.

    Args:
        frontmatter: dict of YAML fields passed to build_frontmatter.
        sections: list of dicts with optional keys:
                    'heading' (str) — rendered as ## heading
                    'content' (str) — body text / table string

    Returns:
        Full note string (frontmatter + sections).
    """
    parts = [build_frontmatter(frontmatter), ""]

    for section in sections:
        heading = section.get("heading", "")
        content = section.get("content", "")
        if heading:
            parts.append(f"## {heading}")
            parts.append("")
        if content:
            parts.append(content)
            parts.append("")

    return "\n".join(parts)


# ---------------------------------------------------------------------------
# File I/O
# ---------------------------------------------------------------------------

def write_note(filepath: str, content: str) -> None:
    """Write note content to disk, creating parent directories as needed."""
    path = Path(filepath)
    os.makedirs(path.parent, exist_ok=True)
    path.write_text(content, encoding="utf-8")


# ---------------------------------------------------------------------------
# Domain-specific report writers
# ---------------------------------------------------------------------------

def write_factor_report(
    results: dict,
    thesis_name: str,
    output_dir: Path = None,
) -> Path:
    """Write a Qlib factor analysis report as an Obsidian pull note.

    Args:
        results: dict with keys:
            tickers    (list[str])               — universe members
            factors    (list[dict])              — each: {name, ic, rank}
            universe   (str)                     — universe label
            run_date   (str, YYYY-MM-DD)         — when the analysis ran
        thesis_name: human-readable thesis label (used in title + tags).
        output_dir: override destination folder (defaults to vault
                    05_Data_Pulls/Quant/).

    Returns:
        Path to the written file.
    """
    run_date = results.get("run_date", today())
    universe = results.get("universe", "unknown")
    tickers = results.get("tickers", [])
    factors = results.get("factors", [])

    # Derive signal_status from best IC magnitude
    best_ic = max((abs(f.get("ic", 0)) for f in factors), default=0.0)
    signal_status = "watch" if best_ic < 0.02 else "clear"

    safe_thesis = _sanitize_filename_segment(thesis_name)
    title = f"Qlib Factor Analysis — {thesis_name} ({run_date})"

    fm = {
        "title": title,
        "source": "Qlib",
        "date_pulled": run_date,
        "domain": "quant",
        "data_type": "factor_analysis",
        "frequency": "on-demand",
        "signal_status": signal_status,
        "signals": [],
        "tags": ["qlib", "factor-analysis", safe_thesis.lower()],
        "universe": universe,
        "ticker_count": len(tickers),
        **factor_frontmatter_fields(results),
    }

    # Factor table
    factor_rows = [
        [f.get("name", ""), f"{f.get('ic', 0):.4f}", f.get("rank", "")]
        for f in factors
    ]
    factor_table = build_table(["Factor", "IC", "Rank"], factor_rows)

    # Ticker list — split into readable chunks of 10 per line
    ticker_lines = _chunk_list(tickers, 10)
    ticker_content = "\n".join(", ".join(chunk) for chunk in ticker_lines) if tickers else "_No tickers_"

    sections = [
        {
            "heading": "Factor Scores",
            "content": factor_table if factor_table else "_No factors_",
        },
        {
            "heading": "Universe",
            "content": f"**Universe:** {universe}  \n**Tickers ({len(tickers)}):** {ticker_content}",
        },
    ]

    content = build_note(fm, sections)

    if output_dir is None:
        output_dir = _QUANT_DIR

    filename = f"{run_date}_Qlib_Factors_{safe_thesis}.md"
    filepath = Path(output_dir) / filename
    write_note(str(filepath), content)
    return filepath


def write_backtest_report(
    results: dict,
    strategy_name: str,
    output_dir: Path = None,
) -> Path:
    """Write a Qlib backtest report as an Obsidian pull note.

    Args:
        results: dict with keys:
            strategy        (str)
            universe        (str)
            sharpe          (float)
            max_drawdown    (float)   — negative fraction, e.g. -0.18
            annual_return   (float)   — fraction, e.g. 0.14
            monthly_returns (list[dict])  — each: {month, return}
            metrics         (dict)    — arbitrary extra metrics
        strategy_name: human-readable strategy label.
        output_dir: override destination folder (defaults to vault
                    05_Data_Pulls/Quant/).

    Returns:
        Path to the written file.
    """
    run_date = results.get("run_date", today())
    sharpe = results.get("sharpe", 0.0)
    max_dd = results.get("max_drawdown", 0.0)
    annual_return = results.get("annual_return", 0.0)
    monthly_returns = results.get("monthly_returns", [])
    metrics = results.get("metrics", {})
    universe = results.get("universe", "unknown")

    # Signal status: negative Sharpe → watch; deep drawdown → alert
    if sharpe < 0:
        signal_status = "watch"
    elif max_dd < -0.25:
        signal_status = "alert"
    else:
        signal_status = "clear"

    safe_strategy = _sanitize_filename_segment(strategy_name)
    title = f"Qlib Backtest — {strategy_name} ({run_date})"

    fm = {
        "title": title,
        "source": "Qlib",
        "date_pulled": run_date,
        "domain": "quant",
        "data_type": "backtest",
        "frequency": "on-demand",
        "signal_status": signal_status,
        "signals": [],
        "tags": ["qlib", "backtest", safe_strategy.lower()],
        "universe": universe,
        "sharpe": round(sharpe, 4),
        "max_drawdown": round(max_dd, 4),
        "annual_return": round(annual_return, 4),
        **backtest_frontmatter_fields(results),
    }

    # Summary table
    summary_rows = [
        ["Sharpe Ratio", f"{sharpe:.4f}"],
        ["Annual Return", f"{annual_return * 100:.2f}%"],
        ["Max Drawdown", f"{max_dd * 100:.2f}%"],
    ]
    # Append extra metrics
    for k, v in metrics.items():
        summary_rows.append([str(k), str(v)])

    summary_table = build_table(["Metric", "Value"], summary_rows)

    # Monthly returns table
    if monthly_returns:
        monthly_rows = [
            [r.get("month", ""), f"{r.get('return', 0) * 100:.2f}%"]
            for r in monthly_returns
        ]
        monthly_table = build_table(["Month", "Return"], monthly_rows)
    else:
        monthly_table = "_No monthly return data_"

    sections = [
        {"heading": "Performance Summary", "content": summary_table},
        {"heading": "Monthly Returns", "content": monthly_table},
    ]

    content = build_note(fm, sections)

    if output_dir is None:
        output_dir = _QUANT_DIR

    filename = f"{run_date}_Qlib_Backtest_{safe_strategy}.md"
    filepath = Path(output_dir) / filename
    write_note(str(filepath), content)
    return filepath


# ---------------------------------------------------------------------------
# Score report writer
# ---------------------------------------------------------------------------

def write_score_report(
    results: dict,
    thesis_name: str,
    output_dir: Path = None,
) -> Path:
    """Write a Qlib per-stock score report as an Obsidian pull note.

    Args:
        results: dict from scorer.score_thesis() with keys:
            stocks       (list[dict])  — each: {ticker, composite_score, rank, signal, factors}
            alerts       (list[dict])  — each: {ticker, signal_type, severity, factor, value, threshold, message}
            factor_weights (list[dict]) — each: {name, ic}
            scoring_date (str)
            universe     (str)
            tickers      (list[str])
        thesis_name: human-readable thesis label.
        output_dir: override destination folder.

    Returns:
        Path to the written file.
    """
    run_date = results.get("run_date", today())
    scoring_date = results.get("scoring_date", run_date)
    universe = results.get("universe", "unknown")
    stocks = results.get("stocks", [])
    alerts = results.get("alerts", [])
    factor_weights = results.get("factor_weights", [])
    tickers = results.get("tickers", [])

    # Derive signal_status from highest alert severity
    severities = [a.get("severity", "clear") for a in alerts]
    if "alert" in severities:
        signal_status = "alert"
    elif "watch" in severities:
        signal_status = "watch"
    else:
        signal_status = "clear"

    safe_thesis = _sanitize_filename_segment(thesis_name)

    fm = {
        "title": f"Qlib Scores — {thesis_name} ({scoring_date})",
        "source": "Qlib",
        "date_pulled": run_date,
        "domain": "quant",
        "data_type": "factor_scores",
        "frequency": "daily",
        "signal_status": signal_status,
        "signals": [a.get("signal_type", "") for a in alerts],
        "tags": ["qlib", "factor-scores", safe_thesis.lower()],
        "universe": universe,
        "ticker_count": len(tickers),
        "scoring_date": scoring_date,
        **score_frontmatter_fields(results),
    }

    # Ranked watchlist table
    factor_names = [fw["name"] for fw in factor_weights[:5]]
    headers = ["Rank", "Ticker", "Score", "Signal"] + factor_names
    rows = []
    for s in stocks:
        factor_vals = s.get("factors", {})
        row = [
            s.get("rank", ""),
            s.get("ticker", ""),
            f"{s.get('composite_score', 0):.1f}",
            s.get("signal", "—"),
        ]
        for fn in factor_names:
            v = factor_vals.get(fn)
            row.append(f"{v:.4f}" if v is not None else "—")
        rows.append(row)
    watchlist_table = build_table(headers, rows)

    # Factor weights section
    weight_rows = [[fw["name"], f"{fw['ic']:.4f}"] for fw in factor_weights]
    weight_table = build_table(["Factor", "IC Weight"], weight_rows)

    # Alerts section
    if alerts:
        alert_lines = []
        for a in alerts:
            sev = a.get("severity", "watch").upper()
            alert_lines.append(
                f"- **{sev}** {a.get('ticker', '?')}: "
                f"{a.get('message', a.get('signal_type', ''))}"
            )
        alert_content = "\n".join(alert_lines)
    else:
        alert_content = "_No threshold alerts triggered._"

    sections = [
        {"heading": "Ranked Watchlist", "content": watchlist_table or "_No stocks scored_"},
        {"heading": "Alerts", "content": alert_content},
        {"heading": "Factor Weights", "content": weight_table or "_No factor weights_"},
    ]

    content = build_note(fm, sections)

    if output_dir is None:
        output_dir = _QUANT_DIR

    filename = f"{run_date}_Qlib_Scores_{safe_thesis}.md"
    filepath = Path(output_dir) / filename
    write_note(str(filepath), content)
    return filepath


# ---------------------------------------------------------------------------
# Signal note writer (for 06_Signals/)
# ---------------------------------------------------------------------------

def write_signal_note(alert: dict, thesis_name: str, output_dir: Path = None) -> Path:
    """Write a signal note to 06_Signals/ matching the vault's signal format.

    Args:
        alert: dict with keys: ticker, signal_type, severity, factor, value,
               threshold, message
        thesis_name: thesis context for tags.
        output_dir: override (defaults to 06_Signals/).

    Returns:
        Path to the written file.
    """
    signal_date = today()
    signal_type = alert.get("signal_type", "FACTOR_SIGNAL")
    ticker = alert.get("ticker", "UNKNOWN")
    severity = alert.get("severity", "watch")
    factor = alert.get("factor", "")
    value = alert.get("value", 0.0)
    threshold = alert.get("threshold", 0.0)
    message = alert.get("message", "")
    safe_thesis = _sanitize_filename_segment(thesis_name)

    signal_id = f"{signal_type}_{ticker}"

    fm = {
        "signal_id": signal_id,
        "signal_name": f"{signal_type.replace('_', ' ').title()} — {ticker}",
        "domain": "quant",
        "severity": severity,
        "value": round(value, 4) if isinstance(value, float) else value,
        "threshold": round(threshold, 4) if isinstance(threshold, float) else threshold,
        "date": signal_date,
        "source_pull": f"Qlib_Scores_{safe_thesis}",
        "tags": ["signal", "quant", severity, safe_thesis.lower(), ticker.lower()],
    }

    sections = [
        {
            "heading": fm["signal_name"],
            "content": f"{message}\n\n"
                       f"**Factor:** {factor}  \n"
                       f"**Value:** {value:.4f}  \n"
                       f"**Threshold:** {threshold:.4f}",
        },
        {
            "heading": "Implications",
            "content": _signal_implications(signal_type, ticker, factor),
        },
        {
            "heading": "Related Domains",
            "content": f"- {safe_thesis.replace('_', ' ')}\n- equities",
        },
    ]

    content = build_note(fm, sections)

    if output_dir is None:
        output_dir = _VAULT_ROOT / "06_Signals"

    filename = f"{signal_date}_{signal_id}.md"
    filepath = Path(output_dir) / filename
    write_note(str(filepath), content)
    return filepath


def _signal_implications(signal_type: str, ticker: str, factor: str) -> str:
    """Generate implications text based on signal type."""
    if signal_type == "FACTOR_STRONG_BUY":
        return (
            f"- {ticker} ranks in top quartile with extreme factor reading\n"
            f"- {factor} at statistical extreme suggests mean-reversion opportunity\n"
            f"- Consider adding or increasing position"
        )
    if signal_type == "FACTOR_BUY_SIGNAL":
        return (
            f"- {ticker} shows extreme {factor} reading (>2 std devs)\n"
            f"- Historical pattern suggests mean-reversion bounce\n"
            f"- Monitor for confirmation before acting"
        )
    if signal_type == "FACTOR_AVOID":
        return (
            f"- {ticker} ranks in bottom quartile of composite factor score\n"
            f"- Weakest quantitative profile in the thesis universe\n"
            f"- Consider reducing exposure or avoiding new entries"
        )
    return f"- {ticker}: {signal_type} triggered on {factor}"


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _sanitize_filename_segment(value: str) -> str:
    """Replace path-unsafe characters with underscores, collapse runs."""
    sanitized = re.sub(r'[<>:"/\\|?*]+', "_", str(value))
    sanitized = re.sub(r"\s+", "_", sanitized)
    sanitized = re.sub(r"_+", "_", sanitized)
    return sanitized.strip("_")


def _chunk_list(lst: list, size: int) -> list:
    """Split lst into sub-lists of at most size elements."""
    return [lst[i : i + size] for i in range(0, len(lst), size)]
