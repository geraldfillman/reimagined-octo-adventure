from __future__ import annotations

import sys
import unittest
from pathlib import Path
import shutil
from unittest.mock import patch

QLIB_DIR = Path(__file__).resolve().parents[1]
if str(QLIB_DIR) not in sys.path:
    sys.path.insert(0, str(QLIB_DIR))

import thesis_updater  # noqa: E402
from report import build_frontmatter  # noqa: E402


class ThesisUpdaterTests(unittest.TestCase):
    def test_update_thesis_rewrites_rollup_and_removes_deprecated_fields(self) -> None:
        root = QLIB_DIR / "tests" / "_tmp_thesis_updater"
        shutil.rmtree(root, ignore_errors=True)
        root.mkdir(parents=True, exist_ok=True)
        try:
            quant_dir = root / "Quant"
            theses_dir = root / "10_Theses"
            quant_dir.mkdir(parents=True)
            theses_dir.mkdir(parents=True)

            thesis_path = theses_dir / "Housing Supply Correction.md"
            thesis_path.write_text(
                "---\n"
                'title: "Housing Supply Correction"\n'
                'node_type: "thesis"\n'
                'conviction: "high"\n'
                "qlib_alpha_score: 11.2\n"
                "qlib_factor_count: 3\n"
                'tags: ["housing"]\n'
                "---\n"
                "Body.\n",
                encoding="utf-8",
            )

            (quant_dir / "2026-04-01_Qlib_Factors_Housing_Supply_Correction.md").write_text(
                build_frontmatter(
                    {
                        "title": "Factor report",
                        "date_pulled": "2026-04-01",
                        "signal_status": "clear",
                        "best_ic": -0.2125,
                        "positive_factor_count": 86,
                        "universe_size": 6,
                    }
                ),
                encoding="utf-8",
            )
            (quant_dir / "2026-04-01_Qlib_Scores_Housing_Supply_Correction.md").write_text(
                build_frontmatter(
                    {
                        "title": "Score report",
                        "date_pulled": "2026-04-01",
                        "scoring_date": "2026-03-30",
                        "signal_status": "watch",
                        "universe_size": 6,
                    }
                ),
                encoding="utf-8",
            )
            (quant_dir / "2026-04-01_Qlib_Backtest_alpha158_lgbm_Housing_Supply_Correction.md").write_text(
                build_frontmatter(
                    {
                        "title": "Backtest report",
                        "date_pulled": "2026-04-01",
                        "signal_status": "watch",
                        "sharpe": -0.6698,
                        "universe_size": 6,
                    }
                ),
                encoding="utf-8",
            )

            with (
                patch.object(thesis_updater, "_QUANT_DIR", quant_dir),
                patch.object(thesis_updater, "_THESES_DIR", theses_dir),
            ):
                result = thesis_updater.update_thesis("Housing Supply Correction")

            self.assertEqual(result["updated_fields"]["qlib_positive_factor_count"], 86)
            self.assertEqual(result["updated_fields"]["qlib_universe_size"], 6)
            self.assertEqual(result["updated_fields"]["qlib_backtest_sharpe"], -0.6698)

            updated_text = thesis_path.read_text(encoding="utf-8")
            self.assertNotIn("qlib_alpha_score", updated_text)
            self.assertNotIn("qlib_factor_count", updated_text)
            self.assertIn("qlib_positive_factor_count: 86", updated_text)
            self.assertIn("qlib_universe_size: 6", updated_text)
            self.assertIn('qlib_signal_status: "watch"', updated_text)
            self.assertIn("qlib_backtest_sharpe: -0.6698", updated_text)
            self.assertLess(updated_text.index("qlib_best_ic"), updated_text.index("tags:"))
        finally:
            shutil.rmtree(root, ignore_errors=True)

    def test_update_thesis_matches_reports_written_from_frontmatter_name(self) -> None:
        root = QLIB_DIR / "tests" / "_tmp_thesis_updater_name_match"
        shutil.rmtree(root, ignore_errors=True)
        root.mkdir(parents=True, exist_ok=True)
        try:
            quant_dir = root / "Quant"
            theses_dir = root / "10_Theses"
            quant_dir.mkdir(parents=True)
            theses_dir.mkdir(parents=True)

            thesis_path = theses_dir / "Alzheimers Disease Modification.md"
            thesis_path.write_text(
                "---\n"
                'name: "Alzheimer\'s Disease Modification"\n'
                'node_type: "thesis"\n'
                'conviction: "medium"\n'
                'qlib_signal_status: "clear"\n'
                'tags: ["healthcare"]\n'
                "---\n"
                "Body.\n",
                encoding="utf-8",
            )

            (quant_dir / "2026-04-01_Qlib_Factors_Alzheimer's_Disease_Modification.md").write_text(
                build_frontmatter(
                    {
                        "title": "Factor report",
                        "date_pulled": "2026-04-01",
                        "signal_status": "watch",
                        "best_ic": 0.0123,
                        "positive_factor_count": 71,
                        "universe_size": 4,
                    }
                ),
                encoding="utf-8",
            )
            (quant_dir / "2026-04-01_Qlib_Scores_Alzheimer's_Disease_Modification.md").write_text(
                build_frontmatter(
                    {
                        "title": "Score report",
                        "date_pulled": "2026-04-01",
                        "scoring_date": "2026-03-30",
                        "signal_status": "watch",
                        "universe_size": 4,
                    }
                ),
                encoding="utf-8",
            )

            with (
                patch.object(thesis_updater, "_QUANT_DIR", quant_dir),
                patch.object(thesis_updater, "_THESES_DIR", theses_dir),
            ):
                result = thesis_updater.update_thesis("Alzheimers Disease Modification")

            self.assertEqual(result["updated_fields"]["qlib_best_ic"], 0.0123)
            self.assertEqual(result["updated_fields"]["qlib_positive_factor_count"], 71)
            updated_text = thesis_path.read_text(encoding="utf-8")
            self.assertIn("qlib_best_ic: 0.0123", updated_text)
            self.assertIn("qlib_positive_factor_count: 71", updated_text)
            self.assertIn('qlib_signal_status: "watch"', updated_text)
        finally:
            shutil.rmtree(root, ignore_errors=True)


if __name__ == "__main__":
    unittest.main()
