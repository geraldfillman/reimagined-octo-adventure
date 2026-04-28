"""
universe.py — Qlib instrument universe builder for the My_Data Obsidian vault.

Reads entity files from 08_Entities/Stocks/ and thesis files from 10_Theses/
to produce filtered instrument lists compatible with Qlib's instruments TSV format.

Typical usage:
    from scripts.qlib.universe import get_all_tickers, get_thesis_tickers, write_qlib_instruments
    tickers = get_thesis_tickers("Housing Supply Correction")
    write_qlib_instruments(tickers, Path("instruments/housing.txt"))
"""

import re
import yaml
from functools import lru_cache
from pathlib import Path

from data_bridge import get_available_instruments

_TICKER_RE = re.compile(r"^[A-Z]{1,5}(?:[._-][A-Z0-9]{1,3})?$")
_MANUAL_NON_TRADABLE_ALIASES = {
    "BARDA",
    "NATO",
    "SPACE",
    "WHO",
}

# ---------------------------------------------------------------------------
# Vault location helpers
# ---------------------------------------------------------------------------

def get_vault_root() -> Path:
    """Return the vault root (two levels up from scripts/qlib/)."""
    return Path(__file__).resolve().parent.parent.parent


# ---------------------------------------------------------------------------
# Frontmatter parsing
# ---------------------------------------------------------------------------

def parse_frontmatter(filepath: Path) -> dict:
    """Extract YAML frontmatter from a Markdown file.

    Reads the content between the first and second '---' fence and returns
    the parsed YAML as a dict.  Returns an empty dict if the file has no
    frontmatter or cannot be read.
    """
    try:
        text = filepath.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError):
        return {}

    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return {}

    end_index = None
    for i, line in enumerate(lines[1:], start=1):
        if line.strip() == "---":
            end_index = i
            break

    if end_index is None:
        return {}

    yaml_block = "\n".join(lines[1:end_index])
    try:
        data = yaml.safe_load(yaml_block)
        return data if isinstance(data, dict) else {}
    except yaml.YAMLError:
        return {}


# ---------------------------------------------------------------------------
# Wikilink utilities
# ---------------------------------------------------------------------------

_WIKILINK_RE = re.compile(r"\[\[([^\]|]+?)(?:\|[^\]]+)?\]\]")


def _strip_wikilink(value: str) -> str:
    """Return the target of a wikilink, stripping [[ and ]] (and aliases).

    '[[AAPL]]'        -> 'AAPL'
    '[[AAPL|Apple]]'  -> 'AAPL'
    'AAPL'            -> 'AAPL'  (plain strings returned as-is)
    """
    m = _WIKILINK_RE.match(value.strip())
    return m.group(1).strip() if m else value.strip()


def _extract_tickers_from_field(raw_field) -> list[str]:
    """Convert a frontmatter field value (string, list, or None) to a list
    of plain ticker symbols by stripping wikilinks where present."""
    if raw_field is None:
        return []
    if isinstance(raw_field, str):
        raw_field = [raw_field]
    if not isinstance(raw_field, list):
        return []
    return [_strip_wikilink(str(item)) for item in raw_field if item]


# ---------------------------------------------------------------------------
# Stock entity universe
# ---------------------------------------------------------------------------

def get_all_tickers() -> list[str]:
    """Return all ticker symbols found in 08_Entities/Stocks/.

    The ticker symbol is taken from the file stem (e.g. AAPL.md -> AAPL).
    Files that cannot be parsed are silently skipped.
    """
    stocks_dir = get_vault_root() / "08_Entities" / "Stocks"
    if not stocks_dir.is_dir():
        return []

    tickers: list[str] = []
    for md_file in sorted(stocks_dir.glob("*.md")):
        ticker = md_file.stem.strip()
        if ticker:
            tickers.append(ticker)

    return tickers


# ---------------------------------------------------------------------------
# Thesis-scoped universes
# ---------------------------------------------------------------------------

@lru_cache(maxsize=1)
def _get_tradable_symbol_maps() -> tuple[dict[str, str], dict[str, str]]:
    """Return exact and case-folded maps for stock/ETF notes to ticker symbols."""
    vault_root = get_vault_root()
    exact: dict[str, str] = {}
    folded: dict[str, str] = {}

    for folder_name in ("Stocks", "ETFs"):
        note_dir = vault_root / "08_Entities" / folder_name
        if not note_dir.is_dir():
            continue

        for note_path in sorted(note_dir.glob("*.md")):
            fm = parse_frontmatter(note_path)
            ticker = str(fm.get("ticker") or note_path.stem).strip().upper()
            if not ticker:
                continue

            candidates = {
                note_path.stem.strip(),
                str(fm.get("ticker") or "").strip(),
                str(fm.get("name") or "").strip(),
            }
            for candidate in {value for value in candidates if value}:
                exact.setdefault(candidate, ticker)
                folded.setdefault(candidate.upper(), ticker)

    return exact, folded


@lru_cache(maxsize=1)
def _get_non_tradable_entity_maps() -> tuple[set[str], set[str]]:
    """Return exact and case-folded names for non-tradable entity and macro notes."""
    vault_root = get_vault_root()
    exact: set[str] = set()
    folded: set[str] = set()

    entities_root = vault_root / "08_Entities"
    if entities_root.is_dir():
        for subdir in entities_root.iterdir():
            if not subdir.is_dir() or subdir.name in {"Stocks", "ETFs"}:
                continue
            for note_path in subdir.glob("*.md"):
                name = note_path.stem.strip()
                if name:
                    exact.add(name)
                    folded.add(name.upper())

    macro_root = vault_root / "09_Macro"
    if macro_root.is_dir():
        for note_path in macro_root.rglob("*.md"):
            name = note_path.stem.strip()
            if name:
                exact.add(name)
                folded.add(name.upper())

    return exact, folded


@lru_cache(maxsize=1)
def _get_available_market_symbols() -> set[str]:
    """Return ticker symbols currently present in the local Qlib data store."""
    return {ticker.upper() for ticker in get_available_instruments()}


def _extract_universe_tickers(raw_field) -> list[str]:
    """Resolve thesis core_entities into tradable stock tickers only."""
    exact_tradable, folded_tradable = _get_tradable_symbol_maps()
    exact_non_tradable, folded_non_tradable = _get_non_tradable_entity_maps()
    market_symbols = _get_available_market_symbols()

    resolved: set[str] = set()
    for entity in _extract_tickers_from_field(raw_field):
        token = entity.strip()
        if not token:
            continue

        if token in exact_tradable:
            resolved.add(exact_tradable[token])
            continue

        if token in exact_non_tradable:
            continue

        folded = token.upper()
        if folded in _MANUAL_NON_TRADABLE_ALIASES:
            continue

        if folded in folded_tradable:
            resolved.add(folded_tradable[folded])
            continue

        if folded in folded_non_tradable:
            continue

        if _TICKER_RE.match(folded) and folded in market_symbols:
            resolved.add(folded)

    return sorted(resolved)


def _match_thesis_file(thesis_name: str) -> Path | None:
    """Resolve a thesis query to the best matching thesis file."""
    theses_dir = get_vault_root() / "10_Theses"
    if not theses_dir.is_dir():
        return None

    query = thesis_name.strip().lower()
    if not query:
        return None

    exact_matches: list[Path] = []
    prefix_matches: list[Path] = []
    contains_matches: list[Path] = []

    for md_file in sorted(theses_dir.glob("*.md")):
        fm = parse_frontmatter(md_file)
        candidates = [md_file.stem.lower()]
        if fm.get("name"):
            candidates.append(str(fm["name"]).lower())

        if any(candidate == query for candidate in candidates):
            exact_matches.append(md_file)
            continue
        if any(candidate.startswith(query) for candidate in candidates):
            prefix_matches.append(md_file)
            continue
        if any(query in candidate for candidate in candidates):
            contains_matches.append(md_file)

    if exact_matches:
        return exact_matches[0]
    if prefix_matches:
        return prefix_matches[0]
    if contains_matches:
        return contains_matches[0]
    return None

def get_thesis_tickers(thesis_name: str) -> list[str]:
    """Return tickers from the core_entities field of a thesis note.

    thesis_name is matched as a case-insensitive substring of filenames in
    10_Theses/.  The first matching file wins.  Wikilinks in core_entities
    are stripped to plain ticker symbols.  Returns an empty list if no
    matching thesis is found or the field is absent.
    """
    theses_dir = get_vault_root() / "10_Theses"
    if not theses_dir.is_dir():
        return []

    match = _match_thesis_file(thesis_name)
    if match is None:
        return []

    fm = parse_frontmatter(match)
    return _extract_universe_tickers(fm.get("core_entities"))


def get_all_thesis_universes() -> dict[str, list[str]]:
    """Return {thesis_stem: [tickers]} for every thesis file in 10_Theses/.

    Files with no core_entities field produce an empty list (still included
    so callers can see which theses exist).
    """
    theses_dir = get_vault_root() / "10_Theses"
    if not theses_dir.is_dir():
        return {}

    universes: dict[str, list[str]] = {}
    for md_file in sorted(theses_dir.glob("*.md")):
        fm = parse_frontmatter(md_file)
        thesis_name = str(fm.get("name") or md_file.stem)
        universes[thesis_name] = _extract_universe_tickers(fm.get("core_entities"))

    return universes


# ---------------------------------------------------------------------------
# Qlib instruments file writer
# ---------------------------------------------------------------------------

def write_qlib_instruments(tickers: list[str], output_path: Path) -> None:
    """Write a Qlib instruments TSV file.

    Format per line:  <SYMBOL>\\t<start_date>\\t<end_date>
    Dates default to 2020-01-01 and 2099-12-31 respectively.
    The output directory is created if it does not already exist.
    """
    START_DATE = "2020-01-01"
    END_DATE = "2099-12-31"

    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    lines = [f"{ticker}\t{START_DATE}\t{END_DATE}" for ticker in tickers]
    output_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


# ---------------------------------------------------------------------------
# Quick smoke-test
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    universes = get_all_thesis_universes()
    if not universes:
        print("No thesis files found — check vault path.")
    else:
        for thesis, tickers in universes.items():
            ticker_str = ", ".join(tickers) if tickers else "(none)"
            print(f"{thesis}: {ticker_str}")
