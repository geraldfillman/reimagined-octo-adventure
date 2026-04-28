"""
setup.py — One-time Qlib bootstrap for the My_Data vault.

Usage (from repo root):
    python scripts/qlib/setup.py

What it does:
    1. Checks Python version >= 3.8
    2. Resolves the .qlib_data/ directory at the project root
    3. Downloads US stock data via Qlib's Yahoo Finance collector
    4. Initialises Qlib with the downloaded data directory
    5. Creates 05_Data_Pulls/Quant/ if it does not exist
"""

import sys
import os
from pathlib import Path


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _step(msg: str) -> None:
    print(f"\n[setup] {msg}")


def _ok(msg: str) -> None:
    print(f"        OK  {msg}")


def _fail(msg: str) -> None:
    print(f"        ERR {msg}", file=sys.stderr)


# ---------------------------------------------------------------------------
# Step 1 — Python version check
# ---------------------------------------------------------------------------

def check_python_version() -> None:
    _step("Checking Python version …")
    major, minor = sys.version_info[:2]
    if (major, minor) < (3, 8):
        _fail(f"Python 3.8+ required; found {major}.{minor}. Aborting.")
        sys.exit(1)
    _ok(f"Python {major}.{minor} detected.")


# ---------------------------------------------------------------------------
# Path resolution
# ---------------------------------------------------------------------------

# scripts/qlib/setup.py  →  scripts/qlib/  →  scripts/  →  project root
_SCRIPT_DIR = Path(__file__).resolve().parent          # scripts/qlib/
_PROJECT_ROOT = _SCRIPT_DIR.parent.parent              # vault root

DATA_DIR = _PROJECT_ROOT / ".qlib_data"
QUANT_OUTPUT_DIR = _PROJECT_ROOT / "05_Data_Pulls" / "Quant"


# ---------------------------------------------------------------------------
# Step 2 — Ensure data directory exists
# ---------------------------------------------------------------------------

def ensure_data_dir() -> None:
    _step(f"Qlib data directory: {DATA_DIR}")
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    _ok("Directory ready.")


# ---------------------------------------------------------------------------
# Step 3 — Download US market data via Yahoo Finance collector
# ---------------------------------------------------------------------------

def download_market_data() -> None:
    _step("Downloading US stock data from Yahoo Finance via Qlib collector …")
    _step("  (This can take several minutes on first run.)")

    try:
        # Qlib ships a get_data CLI; we invoke it programmatically.
        from qlib.tests.data import GetData  # type: ignore

        GetData().qlib_data(
            name="qlib_data_simple",
            target_dir=str(DATA_DIR),
            region="us",
            interval="1d",
        )
        _ok("Market data downloaded successfully.")
    except ImportError:
        # Older Qlib versions expose the collector differently.
        _step("  Falling back to scripts.get_data entry-point …")
        import subprocess

        result = subprocess.run(
            [
                sys.executable,
                "-m",
                "qlib.run.get_data",
                "qlib_data",
                "--target_dir",
                str(DATA_DIR),
                "--region",
                "us",
                "--interval",
                "1d",
            ],
            check=False,
        )
        if result.returncode != 0:
            _fail(
                "Data download failed. Check your internet connection and that "
                "pyqlib is installed correctly."
            )
            sys.exit(1)
        _ok("Market data downloaded via subprocess fallback.")
    except Exception as exc:  # noqa: BLE001
        _fail(f"Unexpected error during data download: {exc}")
        sys.exit(1)


# ---------------------------------------------------------------------------
# Step 4 — Initialise Qlib
# ---------------------------------------------------------------------------

def init_qlib() -> None:
    _step(f"Initialising Qlib with provider_uri={DATA_DIR} …")

    import qlib  # type: ignore
    from qlib.utils import init_instance_by_config  # noqa: F401 (imported for completeness)

    qlib.init(provider_uri=str(DATA_DIR), region="us")
    _ok("Qlib initialised.")


# ---------------------------------------------------------------------------
# Step 5 — Create Quant output directory
# ---------------------------------------------------------------------------

def ensure_output_dir() -> None:
    _step(f"Creating Quant output directory: {QUANT_OUTPUT_DIR}")
    QUANT_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    _ok("Output directory ready.")


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("=" * 60)
    print("  Qlib Bootstrap — My_Data Vault")
    print("=" * 60)

    check_python_version()
    ensure_data_dir()
    download_market_data()
    init_qlib()
    ensure_output_dir()

    print("\n" + "=" * 60)
    print("  Setup complete. Qlib is ready.")
    print(f"  Data:    {DATA_DIR}")
    print(f"  Output:  {QUANT_OUTPUT_DIR}")
    print("=" * 60 + "\n")
