"""
bootstrap_data.py — Download fresh US market data via yfinance and convert to Qlib format.

The prebuilt qlib_data snapshot only contains data through late 2020.
This script downloads current OHLCV data for the vault's instrument universe
using yfinance, then converts it to Qlib's binary (.bin) format.

Usage:
    python scripts/qlib/bootstrap_data.py              # Download all vault tickers
    python scripts/qlib/bootstrap_data.py --quick       # Download a small test set
"""

import sys
import os
import struct
import tempfile
from pathlib import Path
from datetime import datetime

import numpy as np
import pandas as pd

# Ensure sibling imports work
_QLIB_DIR = str(Path(__file__).resolve().parent)
if _QLIB_DIR not in sys.path:
    sys.path.insert(0, _QLIB_DIR)

_SCRIPT_DIR = Path(__file__).resolve().parent
_VAULT_ROOT = _SCRIPT_DIR.parent.parent
_DATA_DIR = _VAULT_ROOT / ".qlib_data"


# ---------------------------------------------------------------------------
# Calendar management
# ---------------------------------------------------------------------------

def _get_trading_calendar(start: str = "2015-01-01", end: str = None) -> pd.DatetimeIndex:
    """Generate a US trading calendar using pandas market calendars or NYSE business days."""
    if end is None:
        end = datetime.now().strftime("%Y-%m-%d")
    try:
        import exchange_calendars as ec  # type: ignore
        cal = ec.get_calendar("XNYS")
        sessions = cal.sessions_in_range(start, end)
        return pd.DatetimeIndex(sessions)
    except ImportError:
        pass
    # Fallback: US business days (close enough for most purposes)
    return pd.bdate_range(start=start, end=end)


# ---------------------------------------------------------------------------
# Qlib binary format writer
# ---------------------------------------------------------------------------

def _write_bin_file(filepath: Path, values: np.ndarray, calendar: pd.DatetimeIndex,
                    dates: pd.DatetimeIndex) -> None:
    """Write a single feature as a Qlib .bin file.

    Qlib binary format:
      - First 4 bytes: float32 encoding of the start_index (position in calendar)
      - Remaining bytes: float32 values for each consecutive calendar day
        from start_index through the last available date.
        Missing interior days are filled with NaN.

    This compact format avoids writing NaN padding for dates before the
    instrument's first data point.
    """
    # Map dates to calendar positions
    cal_index = {pd.Timestamp(d).normalize(): i for i, d in enumerate(calendar)}
    positions = []
    for dt in dates:
        pos = cal_index.get(pd.Timestamp(dt).normalize())
        if pos is not None:
            positions.append(pos)

    if not positions:
        return  # No valid dates for this instrument

    start_pos = min(positions)
    end_pos = max(positions)
    length = end_pos - start_pos + 1

    # Build the data array aligned to calendar positions
    data = np.full(length, np.nan, dtype=np.float32)
    for val, dt in zip(values, dates):
        pos = cal_index.get(pd.Timestamp(dt).normalize())
        if pos is not None:
            data[pos - start_pos] = np.float32(val)

    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, "wb") as f:
        # Header: start_index as float32
        f.write(np.array([start_pos], dtype=np.float32).tobytes())
        # Data: float32 values
        f.write(data.tobytes())


def _write_calendar(calendar: pd.DatetimeIndex, data_dir: Path) -> None:
    """Write Qlib calendar file (one date per line, YYYY-MM-DD format)."""
    cal_dir = data_dir / "calendars"
    cal_dir.mkdir(parents=True, exist_ok=True)
    cal_file = cal_dir / "day.txt"
    lines = [d.strftime("%Y-%m-%d") for d in calendar]
    cal_file.write_text("\n".join(lines) + "\n", encoding="utf-8")


def _write_instruments(instruments: dict, data_dir: Path) -> None:
    """Write Qlib instruments files.

    instruments: {symbol: (start_date_str, end_date_str)}
    """
    inst_dir = data_dir / "instruments"
    inst_dir.mkdir(parents=True, exist_ok=True)
    lines = []
    for sym, (start, end) in sorted(instruments.items()):
        lines.append(f"{sym}\t{start}\t{end}")
    (inst_dir / "all.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")


# ---------------------------------------------------------------------------
# yfinance download
# ---------------------------------------------------------------------------

def download_tickers(tickers: list[str], start: str = "2015-01-01") -> pd.DataFrame:
    """Download OHLCV data for multiple tickers via yfinance.

    Returns a DataFrame with columns: symbol, date, open, high, low, close, volume.
    """
    import yfinance as yf  # type: ignore

    end = datetime.now().strftime("%Y-%m-%d")
    print(f"[bootstrap] Downloading {len(tickers)} tickers from {start} to {end} ...")

    all_data = []
    failed = []

    # Download in batches of 20 to avoid rate limits
    batch_size = 20
    for i in range(0, len(tickers), batch_size):
        batch = tickers[i:i + batch_size]
        batch_str = " ".join(batch)
        try:
            df = yf.download(batch_str, start=start, end=end, group_by="ticker",
                             auto_adjust=True, threads=True, progress=False)
            if len(batch) == 1:
                # Single ticker: columns are just OHLCV
                sym = batch[0]
                if df is not None and not df.empty:
                    sub = df[["Open", "High", "Low", "Close", "Volume"]].copy()
                    sub.columns = ["open", "high", "low", "close", "volume"]
                    sub["symbol"] = sym
                    sub["date"] = sub.index
                    all_data.append(sub)
                else:
                    failed.append(sym)
            else:
                # Multi-ticker: columns are multi-indexed (ticker, field)
                for sym in batch:
                    try:
                        sub = df[sym][["Open", "High", "Low", "Close", "Volume"]].copy()
                        sub.columns = ["open", "high", "low", "close", "volume"]
                        sub = sub.dropna(subset=["close"])
                        if not sub.empty:
                            sub["symbol"] = sym
                            sub["date"] = sub.index
                            all_data.append(sub)
                        else:
                            failed.append(sym)
                    except (KeyError, TypeError):
                        failed.append(sym)
        except Exception as exc:  # noqa: BLE001
            print(f"  Batch failed ({batch_str[:40]}...): {exc}")
            failed.extend(batch)

        done = min(i + batch_size, len(tickers))
        print(f"  Progress: {done}/{len(tickers)} tickers processed")

    if failed:
        print(f"[bootstrap] {len(failed)} tickers had no data: {failed[:20]}{'...' if len(failed) > 20 else ''}")

    if not all_data:
        raise RuntimeError("No data downloaded for any ticker.")

    result = pd.concat(all_data, ignore_index=True)
    print(f"[bootstrap] Downloaded {len(result)} total rows for {result['symbol'].nunique()} tickers")
    return result


# ---------------------------------------------------------------------------
# Convert DataFrame to Qlib binary format
# ---------------------------------------------------------------------------

def convert_to_qlib(df: pd.DataFrame, data_dir: Path, start: str = "2015-01-01") -> None:
    """Convert an OHLCV DataFrame to Qlib's binary directory structure.

    Creates:
      data_dir/calendars/day.txt
      data_dir/instruments/all.txt
      data_dir/features/{SYMBOL}/{field}.day.bin
    """
    print(f"[bootstrap] Converting to Qlib format in {data_dir} ...")

    # Build calendar
    all_dates = pd.DatetimeIndex(df["date"].unique()).sort_values()
    calendar = _get_trading_calendar(start=start, end=all_dates.max().strftime("%Y-%m-%d"))
    _write_calendar(calendar, data_dir)

    # Build instruments registry
    instruments = {}
    feature_fields = ["open", "high", "low", "close", "volume"]
    symbols = sorted(df["symbol"].unique())

    for idx, sym in enumerate(symbols):
        sym_data = df[df["symbol"] == sym].sort_values("date")
        dates = pd.DatetimeIndex(sym_data["date"])

        if dates.empty:
            continue

        start_dt = dates.min().strftime("%Y-%m-%d")
        end_dt = dates.max().strftime("%Y-%m-%d")
        instruments[sym] = (start_dt, end_dt)

        # Write binary files for each feature
        for field in feature_fields:
            values = sym_data[field].values.astype(np.float64)
            bin_path = data_dir / "features" / sym / f"{field}.day.bin"
            _write_bin_file(bin_path, values, calendar, dates)

        # Also write 'change' and 'factor' (Qlib expects these)
        close_vals = sym_data["close"].values
        # change = daily return
        change = np.concatenate([[np.nan], np.diff(close_vals) / close_vals[:-1]])
        change_path = data_dir / "features" / sym / "change.day.bin"
        _write_bin_file(change_path, change, calendar, dates)
        # factor = adjustment factor (1.0 since we use adjusted close)
        factor = np.ones(len(close_vals))
        factor_path = data_dir / "features" / sym / "factor.day.bin"
        _write_bin_file(factor_path, factor, calendar, dates)

        if (idx + 1) % 50 == 0 or (idx + 1) == len(symbols):
            print(f"  Converted: {idx + 1}/{len(symbols)} symbols")

    _write_instruments(instruments, data_dir)
    print(f"[bootstrap] Done. {len(instruments)} instruments written to {data_dir}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def run(quick: bool = False) -> None:
    """Full bootstrap: download tickers and convert to Qlib format."""
    from universe import get_all_tickers, get_all_thesis_universes

    if quick:
        tickers = ["AAPL", "MSFT", "GOOGL", "AMZN", "SPY", "DHI", "LEN", "VST", "NRG", "PLTR"]
        print(f"[bootstrap] Quick mode: {len(tickers)} test tickers")
    else:
        # Get all vault tickers + thesis tickers
        entity_tickers = set(get_all_tickers())
        thesis_universes = get_all_thesis_universes()
        thesis_tickers = set()
        for t_list in thesis_universes.values():
            thesis_tickers.update(t_list)

        # Filter to likely stock tickers (all caps, 1-5 chars)
        all_tickers = entity_tickers | thesis_tickers
        tickers = sorted([t for t in all_tickers if t.isalpha() and t.isupper() and 1 <= len(t) <= 5])

        # Always include SPY as benchmark
        if "SPY" not in tickers:
            tickers.append("SPY")

        print(f"[bootstrap] Full mode: {len(tickers)} tickers from vault entities + theses")

    # Clean existing data
    import shutil
    features_dir = _DATA_DIR / "features"
    if features_dir.exists():
        print("[bootstrap] Clearing existing feature data ...")
        shutil.rmtree(features_dir)

    _DATA_DIR.mkdir(parents=True, exist_ok=True)

    # Download and convert
    df = download_tickers(tickers, start="2020-01-01")
    convert_to_qlib(df, _DATA_DIR, start="2020-01-01")

    # Verify
    import qlib
    qlib.init(provider_uri=str(_DATA_DIR), region="us")
    from qlib.data import D
    test_df = D.features(["AAPL"], ["$close"], start_time="2024-01-01", end_time="2026-01-01", freq="day")
    print(f"\n[bootstrap] Verification — AAPL close data: {test_df.shape[0]} rows")
    if test_df.shape[0] > 0:
        print(f"  Date range: {test_df.index.get_level_values('datetime').min().date()} to "
              f"{test_df.index.get_level_values('datetime').max().date()}")
        print("[bootstrap] SUCCESS — Qlib data is up to date.")
    else:
        print("[bootstrap] WARNING — verification returned no data.")


if __name__ == "__main__":
    quick = "--quick" in sys.argv
    run(quick=quick)
