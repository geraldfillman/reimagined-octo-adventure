"""
thesis_updater.py - Update thesis frontmatter with current Qlib summary fields.

Reads factor, score, and backtest reports from 05_Data_Pulls/Quant/ and writes
the latest qlib_* rollup block into matching thesis notes in 10_Theses/.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

import yaml

_QLIB_DIR = str(Path(__file__).resolve().parent)
if _QLIB_DIR not in sys.path:
    sys.path.insert(0, _QLIB_DIR)

from common import (
    DEPRECATED_THESIS_QLIB_FIELDS,
    QUANT_DIR as _QUANT_DIR,
    THESIS_QLIB_FIELDS,
    THESES_DIR as _THESES_DIR,
)
from contracts import build_thesis_qlib_fields
from report import build_frontmatter, _sanitize_filename_segment


def _find_latest_report(quant_dir: Path, thesis_candidates: list[str], report_type: str) -> Path | None:
    """Find the newest Qlib report for a thesis by report type."""
    if not quant_dir.is_dir():
        return None

    candidate_paths: dict[str, Path] = {}
    for thesis_candidate in thesis_candidates:
        safe_stem = _sanitize_filename_segment(thesis_candidate)
        if not safe_stem:
            continue
        for report_path in quant_dir.glob(f"*_Qlib_{report_type}_*{safe_stem}*.md"):
            candidate_paths.setdefault(report_path.name, report_path)

    if not candidate_paths:
        return None

    candidates = sorted(candidate_paths.values(), key=lambda path: path.name, reverse=True)
    return candidates[0]


def _parse_qlib_report(report_path: Path | None) -> dict:
    """Parse frontmatter from a Qlib report note."""
    if report_path is None:
        return {}

    text = report_path.read_text(encoding="utf-8")
    match = re.match(r"^---\n(.*?)\n---", text, re.DOTALL)
    if not match:
        return {}
    try:
        return yaml.safe_load(match.group(1)) or {}
    except yaml.YAMLError:
        return {}


def _read_thesis_file(thesis_path: Path) -> tuple[dict, str]:
    """Read a thesis file, returning (frontmatter_dict, body_text)."""
    text = thesis_path.read_text(encoding="utf-8")
    match = re.match(r"^---\n(.*?)\n---\n?(.*)", text, re.DOTALL)
    if not match:
        return {}, text

    try:
        frontmatter = yaml.safe_load(match.group(1)) or {}
    except yaml.YAMLError:
        frontmatter = {}
    return frontmatter, match.group(2)


def _write_thesis_file(thesis_path: Path, frontmatter: dict, body: str) -> None:
    """Write thesis file with updated frontmatter and original body."""
    fm_str = build_frontmatter(frontmatter)
    content = fm_str + ("\n" if body and not body.startswith("\n") else "") + body
    thesis_path.write_text(content, encoding="utf-8")


def _insert_qlib_fields(frontmatter: dict, qlib_fields: dict) -> dict:
    """Insert the current qlib_* block before tags and remove deprecated keys."""
    result = {}
    removable = set(THESIS_QLIB_FIELDS) | set(DEPRECATED_THESIS_QLIB_FIELDS)
    inserted = False

    for key, value in frontmatter.items():
        if key in removable:
            continue
        if key == "tags" and not inserted:
            for q_key, q_value in qlib_fields.items():
                result[q_key] = q_value
            inserted = True
        result[key] = value

    if not inserted:
        for q_key, q_value in qlib_fields.items():
            result[q_key] = q_value

    return result


def update_thesis(thesis_name: str) -> dict:
    """Update one thesis with the latest Qlib rollup fields."""
    thesis_path = _THESES_DIR / f"{thesis_name}.md"
    if not thesis_path.exists():
        matches = [path for path in sorted(_THESES_DIR.glob("*.md")) if thesis_name.lower() in path.stem.lower()]
        if not matches:
            return {
                "thesis": thesis_name,
                "updated_fields": {},
                "report_sources": [],
                "error": f"Thesis file not found: {thesis_name}.md",
            }
        thesis_path = matches[0]

    existing_fm, body = _read_thesis_file(thesis_path)
    report_candidates = [
        thesis_name,
        thesis_path.stem,
        str(existing_fm.get("name") or ""),
    ]
    factor_report = _find_latest_report(_QUANT_DIR, report_candidates, "Factors")
    score_report = _find_latest_report(_QUANT_DIR, report_candidates, "Scores")
    backtest_report = _find_latest_report(_QUANT_DIR, report_candidates, "Backtest")

    report_sources = [path.name for path in (factor_report, score_report, backtest_report) if path]
    qlib_fields = build_thesis_qlib_fields(
        factor_report=_parse_qlib_report(factor_report),
        score_report=_parse_qlib_report(score_report),
        backtest_report=_parse_qlib_report(backtest_report),
    )

    if not qlib_fields:
        return {
            "thesis": thesis_name,
            "updated_fields": {},
            "report_sources": [],
            "error": "No Qlib reports found for this thesis.",
        }

    updated_fm = _insert_qlib_fields(existing_fm, qlib_fields)
    _write_thesis_file(thesis_path, updated_fm, body)

    return {
        "thesis": thesis_path.stem,
        "updated_fields": qlib_fields,
        "report_sources": report_sources,
    }


def update_all_theses() -> list[dict]:
    """Update all theses that have at least one matching Qlib report."""
    if not _THESES_DIR.is_dir():
        return []

    results = []
    for thesis_path in sorted(_THESES_DIR.glob("*.md")):
        result = update_thesis(thesis_path.stem)
        if result.get("report_sources"):
            results.append(result)
    return results


if __name__ == "__main__":
    print("Running thesis_updater - scanning all theses for Qlib reports...")
    updates = update_all_theses()

    if not updates:
        print("No theses updated. Run 'node run.mjs qlib refresh --thesis <name>' first.")
    else:
        print(f"\nUpdated {len(updates)} thesis file(s):\n")
        for result in updates:
            fields = result.get("updated_fields", {})
            print(f"  {result['thesis']}")
            print(f"    qlib_best_ic:              {fields.get('qlib_best_ic', 'n/a')}")
            print(f"    qlib_positive_factor_count:{fields.get('qlib_positive_factor_count', 'n/a')}")
            print(f"    qlib_universe_size:        {fields.get('qlib_universe_size', 'n/a')}")
            print(f"    qlib_signal_status:        {fields.get('qlib_signal_status', 'n/a')}")
            print(f"    qlib_last_run:             {fields.get('qlib_last_run', 'n/a')}")
