from __future__ import annotations

import sys
import unittest
from pathlib import Path

QLIB_DIR = Path(__file__).resolve().parents[1]
if str(QLIB_DIR) not in sys.path:
    sys.path.insert(0, str(QLIB_DIR))

from contracts import (  # noqa: E402
    backtest_frontmatter_fields,
    build_thesis_qlib_fields,
    factor_frontmatter_fields,
    score_frontmatter_fields,
)


class ReportingContractTests(unittest.TestCase):
    def test_factor_frontmatter_fields_expose_operator_metrics(self) -> None:
        fields = factor_frontmatter_fields(
            {
                "summary": {
                    "best_factor": "IMXD60",
                    "best_ic": -0.21254,
                    "positive_ic_count": 86,
                    "total_factors": 158,
                    "avg_ic": -0.01234,
                },
                "tickers": ["DHI", "LEN", "PHM", "NVR", "TOL", "BLD"],
                "benchmark": "XHB",
                "start_date": "2020-01-01",
                "end_date": "2026-03-30",
                "skipped_tickers": ["FAKE"],
            }
        )

        self.assertEqual(fields["best_factor"], "IMXD60")
        self.assertEqual(fields["best_ic"], -0.2125)
        self.assertEqual(fields["positive_factor_count"], 86)
        self.assertEqual(fields["total_factor_count"], 158)
        self.assertEqual(fields["avg_ic"], -0.0123)
        self.assertEqual(fields["universe_size"], 6)
        self.assertEqual(fields["benchmark"], "XHB")
        self.assertEqual(fields["skipped_tickers"], ["FAKE"])

    def test_score_and_backtest_frontmatter_roll_up_cleanly(self) -> None:
        score_fields = score_frontmatter_fields(
            {
                "tickers": ["DHI", "LEN", "PHM"],
                "scoring_date": "2026-03-30",
                "stocks": [
                    {"ticker": "DHI", "signal": "STRONG_BUY", "composite_score": 93.12},
                    {"ticker": "LEN", "signal": "BUY", "composite_score": 67.5},
                    {"ticker": "PHM", "signal": "WATCH", "composite_score": 24.0},
                ],
                "alerts": [{"ticker": "PHM"}, {"ticker": "LEN"}],
                "factor_weights": [{"name": "IMXD60", "ic": -0.21254}],
            }
        )
        backtest_fields = backtest_frontmatter_fields(
            {
                "tickers": ["DHI", "LEN", "PHM"],
                "metrics": {
                    "win_rate": 0.55,
                    "avg_turnover": 0.27,
                    "total_trades": 14,
                    "topk": 3,
                    "n_drop": 1,
                    "train_ratio": 0.6,
                    "train_window": "2020-01-01 -> 2023-09-30",
                    "test_window": "2023-10-01 -> 2026-03-30",
                    "skipped_tickers": ["FAKE"],
                    "benchmark": "SPY",
                },
            }
        )
        thesis_fields = build_thesis_qlib_fields(
            factor_report={
                "best_ic": -0.2125,
                "positive_factor_count": 86,
                "universe_size": 6,
                "signal_status": "clear",
                "date_pulled": "2026-04-01",
            },
            score_report={
                **score_fields,
                "signal_status": "alert",
                "date_pulled": "2026-04-01",
            },
            backtest_report={
                **backtest_fields,
                "sharpe": -0.6698,
                "signal_status": "watch",
                "date_pulled": "2026-04-01",
            },
        )

        self.assertEqual(score_fields["alert_count"], 2)
        self.assertEqual(score_fields["strong_buy_count"], 1)
        self.assertEqual(score_fields["buy_count"], 1)
        self.assertEqual(score_fields["watch_count"], 1)
        self.assertEqual(score_fields["avoid_count"], 0)
        self.assertEqual(score_fields["top_ticker"], "DHI")
        self.assertEqual(score_fields["top_factor"], "IMXD60")
        self.assertEqual(score_fields["top_factor_weight"], -0.2125)

        self.assertEqual(backtest_fields["universe_size"], 3)
        self.assertEqual(backtest_fields["avg_turnover"], 0.27)
        self.assertEqual(backtest_fields["total_trades"], 14)

        self.assertEqual(thesis_fields["qlib_best_ic"], -0.2125)
        self.assertEqual(thesis_fields["qlib_positive_factor_count"], 86)
        self.assertEqual(thesis_fields["qlib_universe_size"], 3)
        self.assertEqual(thesis_fields["qlib_last_score_date"], "2026-03-30")
        self.assertEqual(thesis_fields["qlib_last_backtest_date"], "2026-04-01")
        self.assertEqual(thesis_fields["qlib_signal_status"], "alert")
        self.assertEqual(thesis_fields["qlib_backtest_sharpe"], -0.6698)
        self.assertEqual(thesis_fields["qlib_last_run"], "2026-04-01")


if __name__ == "__main__":
    unittest.main()
