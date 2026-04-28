"""
common.py - Shared Qlib runtime helpers and reporting constants.

Centralises vault paths, Qlib initialisation, instrument filtering, and the
reporting field contracts used by reports, thesis rollups, and validation.
"""

from __future__ import annotations

import logging
from datetime import date, datetime
from pathlib import Path

logger = logging.getLogger(__name__)

SCRIPT_DIR = Path(__file__).resolve().parent
VAULT_ROOT = SCRIPT_DIR.parent.parent
DATA_DIR = VAULT_ROOT / ".qlib_data"
QUANT_DIR = VAULT_ROOT / "05_Data_Pulls" / "Quant"
THESES_DIR = VAULT_ROOT / "10_Theses"

REPORT_SCHEMA_VERSION = 2

SIGNAL_PRIORITY = {
    "clear": 0,
    "watch": 1,
    "alert": 2,
    "critical": 3,
}

THESIS_QLIB_CORE_FIELDS = (
    "qlib_best_ic",
    "qlib_positive_factor_count",
    "qlib_universe_size",
    "qlib_last_score_date",
    "qlib_signal_status",
    "qlib_last_run",
)

THESIS_QLIB_OPTIONAL_BACKTEST_FIELDS = (
    "qlib_backtest_sharpe",
    "qlib_last_backtest_date",
)

THESIS_QLIB_FIELDS = THESIS_QLIB_CORE_FIELDS + THESIS_QLIB_OPTIONAL_BACKTEST_FIELDS
DEPRECATED_THESIS_QLIB_FIELDS = ("qlib_alpha_score", "qlib_factor_count")

_QLIB_INITIALISED = False


def today() -> str:
    """Return today's date as YYYY-MM-DD."""
    return date.today().isoformat()


def build_instrument_config(
    tickers: list[str],
    start_date: str,
    end_date: str,
) -> dict:
    """Build a Qlib-compatible instrument config from a ticker list."""
    import pandas as pd  # type: ignore

    start = pd.Timestamp(start_date)
    end = pd.Timestamp(end_date)
    return {ticker: [(start, end)] for ticker in tickers}


def ensure_qlib_init() -> None:
    """Initialise Qlib once per process using the vault's local data store."""
    global _QLIB_INITIALISED
    if _QLIB_INITIALISED:
        return

    if not DATA_DIR.exists():
        raise RuntimeError(
            f"Qlib data directory not found at {DATA_DIR}.\n"
            "Run `node scripts/run.mjs qlib setup` first to download market data."
        )

    try:
        import qlib  # type: ignore

        qlib.init(
            provider_uri=str(DATA_DIR),
            region="us",
            kernels=1,
            joblib_backend="threading",
        )
        _QLIB_INITIALISED = True
        logger.info("Qlib initialised with provider_uri=%s", DATA_DIR)
    except ImportError as exc:
        raise RuntimeError(
            "pyqlib is not installed. Install it with the scripts/qlib/.venv environment."
        ) from exc


def filter_available_instruments(tickers: list[str]) -> tuple[list[str], list[str]]:
    """Return (available, skipped) after checking which tickers exist in Qlib."""
    all_instruments: set[str] = set()

    try:
        from qlib.data import D  # type: ignore

        instruments = D.instruments(market="all")
        all_instruments |= set(D.list_instruments(instruments=instruments, as_list=True))
    except Exception:  # noqa: BLE001
        logger.warning("Could not enumerate Qlib instruments; falling back to local data store.")

    try:
        from data_bridge import get_available_instruments  # type: ignore

        all_instruments |= {ticker.upper() for ticker in get_available_instruments()}
    except Exception:  # noqa: BLE001
        logger.warning("Could not inspect local Qlib data store for fallback symbol coverage.")

    if not all_instruments:
        return list(tickers), []

    upper_map = {ticker.upper(): ticker for ticker in tickers}
    available = [orig for upper, orig in upper_map.items() if upper in all_instruments]
    skipped = [orig for upper, orig in upper_map.items() if upper not in all_instruments]

    if skipped:
        logger.warning(
            "The following tickers are not in Qlib's data and will be skipped: %s",
            skipped,
        )

    return available, skipped


def merge_signal_statuses(statuses: list[str | None]) -> str:
    """Return the highest-severity signal status from a list of statuses."""
    best_status = "clear"
    best_priority = SIGNAL_PRIORITY[best_status]

    for status in statuses:
        priority = SIGNAL_PRIORITY.get(str(status or "").lower(), -1)
        if priority > best_priority:
            best_status = str(status)
            best_priority = priority

    return best_status


def parse_iso_date(value: object) -> date | None:
    """Best-effort parse of YYYY-MM-DD values stored in frontmatter."""
    if value in (None, ""):
        return None
    raw = str(value)[:10]
    try:
        return datetime.strptime(raw, "%Y-%m-%d").date()
    except ValueError:
        return None


def latest_iso_date(values: list[object]) -> str | None:
    """Return the latest YYYY-MM-DD string from a list of date-like values."""
    parsed = [parse_iso_date(value) for value in values]
    cleaned = [value for value in parsed if value is not None]
    if not cleaned:
        return None
    return max(cleaned).isoformat()
