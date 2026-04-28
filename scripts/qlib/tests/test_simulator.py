from __future__ import annotations

import sys
import unittest
from pathlib import Path

import pandas as pd

QLIB_DIR = Path(__file__).resolve().parents[1]
if str(QLIB_DIR) not in sys.path:
    sys.path.insert(0, str(QLIB_DIR))

from simulator import (  # noqa: E402
    _build_ticker_breakdown,
    _parse_compare_specs,
    _snapshot_payload,
    _ticker_history,
)


class SimulatorOptionTests(unittest.TestCase):
    def test_parse_compare_specs_uses_base_and_overrides(self) -> None:
        scenarios = _parse_compare_specs(
            [
                "label=defensive,topk=3,n_drop=1,end=2025-12-31",
                "topk=2,top_n=8",
            ],
            {
                "tickers": ["DHI", "LEN"],
                "thesis_name": "Housing Supply Correction",
                "start_date": "2020-01-01",
                "end_date": "2026-04-01",
                "topk": 5,
                "n_drop": 2,
                "top_n_factors": 5,
            },
        )

        self.assertEqual(len(scenarios), 3)
        self.assertEqual(scenarios[0]["label"], "base")
        self.assertEqual(scenarios[1]["label"], "defensive")
        self.assertEqual(scenarios[1]["topk"], 3)
        self.assertEqual(scenarios[1]["n_drop"], 1)
        self.assertEqual(scenarios[1]["end_date"], "2025-12-31")
        self.assertEqual(scenarios[2]["label"], "scenario-2")
        self.assertEqual(scenarios[2]["topk"], 2)
        self.assertEqual(scenarios[2]["top_n_factors"], 8)

    def test_ticker_breakdown_and_history_extract_focus_views(self) -> None:
        scored_df = pd.DataFrame(
            [
                {"ticker": "AAA", "rank": 1, "composite_score": 100.0, "IMXD60": 1.0, "ROC30": 5.0},
                {"ticker": "BBB", "rank": 2, "composite_score": 60.0, "IMXD60": 2.0, "ROC30": 4.0},
                {"ticker": "CCC", "rank": 3, "composite_score": 0.0, "IMXD60": 3.0, "ROC30": 3.0},
            ]
        )
        stock_row, contributions = _build_ticker_breakdown(
            scored_df,
            [
                {"name": "IMXD60", "ic": -0.2},
                {"name": "ROC30", "ic": 0.1},
            ],
            "AAA",
        )
        history = _ticker_history(
            [
                {"date": "2026-03-28", "entries": ["AAA"], "exits": [], "holdings": ["AAA"], "day_return": 0.01, "turnover": 1.0},
                {"date": "2026-03-29", "entries": [], "exits": [], "holdings": ["AAA"], "day_return": -0.02, "turnover": 0.0},
                {"date": "2026-03-30", "entries": [], "exits": ["AAA"], "holdings": [], "day_return": 0.0, "turnover": 0.5},
            ],
            "AAA",
        )

        self.assertEqual(stock_row["composite_score"], 100.0)
        self.assertEqual(contributions[0]["factor"], "IMXD60")
        self.assertEqual(history[0]["action"], "ENTRY,HELD")
        self.assertEqual(history[-1]["action"], "EXIT")

    def test_snapshot_payload_trims_history_and_includes_ticker_focus(self) -> None:
        bundle = {
            "label": "base",
            "thesis_name": "Housing Supply Correction",
            "start_date": "2020-01-01",
            "end_date": "2026-04-01",
            "topk": 5,
            "n_drop": 2,
            "top_n_factors": 5,
            "available_tickers": ["AAA", "BBB", "CCC"],
            "skipped_tickers": [],
            "sorted_factors": [{"name": "IMXD60", "ic": -0.2, "icir": 1.1, "rank": 1}],
            "factor_weights": [{"name": "IMXD60", "ic": -0.2}],
            "scored_df": pd.DataFrame(
                [
                    {"ticker": "AAA", "rank": 1, "composite_score": 100.0, "IMXD60": 1.0},
                    {"ticker": "BBB", "rank": 2, "composite_score": 50.0, "IMXD60": 2.0},
                    {"ticker": "CCC", "rank": 3, "composite_score": 0.0, "IMXD60": 3.0},
                ]
            ),
            "stocks": [{"ticker": "AAA", "rank": 1, "composite_score": 100.0}],
            "alerts": [{"ticker": "AAA", "message": "Top setup"}],
            "metrics": {"sharpe": 1.2},
            "timings": {"total": 3.4},
            "history_rows": [
                {"date": "2026-03-28", "entries": ["AAA"], "exits": [], "holdings": ["AAA"], "day_return": 0.01, "turnover": 1.0},
                {"date": "2026-03-29", "entries": [], "exits": [], "holdings": ["AAA"], "day_return": -0.02, "turnover": 0.0},
                {"date": "2026-03-30", "entries": [], "exits": ["AAA"], "holdings": [], "day_return": 0.0, "turnover": 0.5},
            ],
        }

        payload = _snapshot_payload(bundle, ticker_focus="AAA", show_last=2)

        self.assertEqual(len(payload["history"]), 2)
        self.assertEqual(payload["ticker_focus"]["ticker"], "AAA")
        self.assertEqual(len(payload["ticker_focus"]["history"]), 2)
        self.assertEqual(payload["ticker_focus"]["alerts"][0]["ticker"], "AAA")


if __name__ == "__main__":
    unittest.main()
