"""
data_bridge.py — Data format conversion between Node.js pullers and Qlib.

Handles:
  - Vault/data directory path resolution
  - US market data bootstrapping via Qlib's Yahoo Finance collector
  - Qlib initialisation
  - CSV-to-Qlib binary conversion (future bridge for Node.js CSV exports)
  - Instrument listing from the local Qlib data store

Typical usage:
    from scripts.qlib.data_bridge import init_qlib, get_available_instruments
    init_qlib()
    instruments = get_available_instruments()
"""

import sys
import subprocess
from pathlib import Path


# ---------------------------------------------------------------------------
# Path resolution
# ---------------------------------------------------------------------------

# scripts/qlib/data_bridge.py  ->  scripts/qlib/  ->  scripts/  ->  vault root
_SCRIPT_DIR = Path(__file__).resolve().parent   # scripts/qlib/
_VAULT_ROOT = _SCRIPT_DIR.parent.parent         # vault root


def get_vault_root() -> Path:
    """Return vault root path (two levels up from scripts/qlib/)."""
    return _VAULT_ROOT


def get_data_dir() -> Path:
    """Return .qlib_data directory path at vault root."""
    return _VAULT_ROOT / ".qlib_data"


# ---------------------------------------------------------------------------
# Market data bootstrap
# ---------------------------------------------------------------------------

def bootstrap_us_data(region: str = "us") -> None:
    """Download US market data using Qlib's Yahoo Finance collector.

    Stores downloaded data in .qlib_data/ at the vault root.
    Tries the Python API first; falls back to a direct subprocess call if the
    API is unavailable (older Qlib builds).

    Args:
        region: Qlib region string — "us" (default) or "cn".
    """
    data_dir = get_data_dir()
    data_dir.mkdir(parents=True, exist_ok=True)

    print(f"[data_bridge] Downloading {region.upper()} market data to {data_dir} …")
    print("[data_bridge] This may take several minutes on first run.")

    try:
        from qlib.tests.data import GetData  # type: ignore

        GetData().qlib_data(
            name="qlib_data_simple",
            target_dir=str(data_dir),
            region=region,
            interval="1d",
        )
        print("[data_bridge] Market data downloaded via Python API.")
        return
    except ImportError:
        pass  # Fall through to subprocess fallback
    except Exception as exc:  # noqa: BLE001
        print(f"[data_bridge] Python API failed ({exc}); trying subprocess fallback …",
              file=sys.stderr)

    # Subprocess fallback — works with all Qlib versions that ship get_data
    result = subprocess.run(
        [
            sys.executable,
            "-m",
            "qlib.run.get_data",
            "qlib_data",
            "--target_dir",
            str(data_dir),
            "--region",
            region,
            "--interval",
            "1d",
        ],
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(
            "Data download failed. Verify your internet connection and that "
            "pyqlib is installed correctly (pip install pyqlib)."
        )
    print("[data_bridge] Market data downloaded via subprocess fallback.")


# ---------------------------------------------------------------------------
# Qlib initialisation
# ---------------------------------------------------------------------------

def init_qlib(region: str = "us") -> None:
    """Initialise Qlib with the local data directory.

    Must be called before any Qlib data or factor operations.

    Args:
        region: Qlib region string passed to qlib.init() — "us" (default) or "cn".

    Raises:
        ImportError: if pyqlib is not installed.
        RuntimeError: if .qlib_data/ does not exist (run bootstrap_us_data first).
    """
    import qlib  # type: ignore  # noqa: PLC0415

    data_dir = get_data_dir()
    if not data_dir.exists():
        raise RuntimeError(
            f"Qlib data directory not found: {data_dir}\n"
            "Run `python scripts/qlib/cli.py setup` to download market data first."
        )

    qlib.init(provider_uri=str(data_dir), region=region)
    print(f"[data_bridge] Qlib initialised — provider_uri={data_dir}")


# ---------------------------------------------------------------------------
# CSV-to-Qlib conversion (Phase 2 bridge for Node.js CSV exports)
# ---------------------------------------------------------------------------

def csv_to_qlib(
    csv_path: Path,
    symbol_col: str = "symbol",
    date_col: str = "date",
) -> None:
    """Convert a CSV file with OHLCV data to Qlib binary format.

    Intended for future use when bridging data exported by Node.js pullers.
    Expects the CSV to have at minimum columns: symbol, date, open, high, low,
    close, volume (column names configurable via symbol_col / date_col).

    The CSV is split by symbol and written to .qlib_data/ using Qlib's
    DumpDataUpdate workflow (scripts/dump_bin equivalent).

    Args:
        csv_path:   Path to the source CSV file.
        symbol_col: Column name containing the ticker symbol.
        date_col:   Column name containing the date (YYYY-MM-DD).

    Raises:
        FileNotFoundError: if csv_path does not exist.
        ImportError: if pyqlib or pandas are not installed.
        ValueError: if required columns are missing from the CSV.
    """
    import pandas as pd  # type: ignore  # noqa: PLC0415

    csv_path = Path(csv_path)
    if not csv_path.exists():
        raise FileNotFoundError(f"CSV not found: {csv_path}")

    df = pd.read_csv(csv_path, parse_dates=[date_col])

    required_cols = {symbol_col, date_col, "open", "high", "low", "close", "volume"}
    missing = required_cols - set(df.columns)
    if missing:
        raise ValueError(f"CSV is missing required columns: {sorted(missing)}")

    data_dir = get_data_dir()
    if not data_dir.exists():
        raise RuntimeError(
            f"Qlib data directory not found: {data_dir}\n"
            "Run `python scripts/qlib/cli.py setup` before converting CSVs."
        )

    try:
        from qlib.data.storage.storage import FeatureStorage  # type: ignore  # noqa: PLC0415,F401
        # Qlib >= 0.9: use DumpDataUpdate for incremental writes
        from qlib.scripts.dump_bin import DumpDataUpdate  # type: ignore  # noqa: PLC0415

        DumpDataUpdate(
            csv_path=str(csv_path),
            qlib_dir=str(data_dir),
            symbol_field_name=symbol_col,
            date_field_name=date_col,
            include_fields=["open", "high", "low", "close", "volume"],
        ).dump()
        print(f"[data_bridge] CSV converted to Qlib binary: {csv_path}")
    except ImportError as exc:
        raise ImportError(
            "Could not import Qlib dump utilities. "
            "Ensure pyqlib >= 0.9 is installed: pip install pyqlib"
        ) from exc


# ---------------------------------------------------------------------------
# Instrument listing
# ---------------------------------------------------------------------------

def get_available_instruments() -> list[str]:
    """List instruments available in the Qlib data store.

    Returns the list of tickers found in .qlib_data/instruments/ (the standard
    Qlib layout).  Falls back to scanning feature subdirectories if the
    instruments directory is absent.

    Returns:
        Sorted list of ticker strings (e.g. ["AAPL", "MSFT", ...]).
        Returns an empty list if .qlib_data/ does not exist or is empty.
    """
    data_dir = get_data_dir()
    if not data_dir.exists():
        return []

    # Primary: instruments/*.txt files list available symbols per universe
    instruments_dir = data_dir / "instruments"
    if instruments_dir.is_dir():
        symbols: set[str] = set()
        for txt_file in instruments_dir.glob("*.txt"):
            for line in txt_file.read_text(encoding="utf-8").splitlines():
                parts = line.split("\t")
                if parts and parts[0].strip():
                    symbols.add(parts[0].strip().upper())
        if symbols:
            return sorted(symbols)

    # Fallback: feature directories are named by symbol (Qlib binary layout)
    features_dir = data_dir / "features"
    if features_dir.is_dir():
        tickers = sorted(
            d.name.upper()
            for d in features_dir.iterdir()
            if d.is_dir() and not d.name.startswith(".")
        )
        return tickers

    return []
