from __future__ import annotations

import sys
import unittest
from pathlib import Path

import pandas as pd
from pandas.testing import assert_series_equal

QLIB_DIR = Path(__file__).resolve().parents[1]
if str(QLIB_DIR) not in sys.path:
    sys.path.insert(0, str(QLIB_DIR))

from backtest import _simulate_topk_portfolio  # noqa: E402


class BacktestParityTests(unittest.TestCase):
    def test_portfolio_history_matches_backtest_return_series(self) -> None:
        dates = pd.to_datetime(["2026-01-02", "2026-01-03", "2026-01-04"])
        instruments = ["AAA", "BBB", "CCC"]
        index = pd.MultiIndex.from_product(
            [dates, instruments],
            names=["datetime", "instrument"],
        )

        predictions = pd.Series(
            [
                0.90, 0.80, 0.10,
                0.20, 0.70, 0.95,
                0.10, 0.60, 0.85,
            ],
            index=index,
            name="score",
        )
        daily_returns = pd.DataFrame(
            {
                "ret_1": [
                    0.01, 0.02, -0.01,
                    -0.02, -0.01, 0.03,
                    -0.01, 0.01, -0.02,
                ]
            },
            index=index,
        )

        series_only = _simulate_topk_portfolio(
            predictions=predictions,
            daily_returns=daily_returns,
            topk=2,
            n_drop=0,
            return_history=False,
        )
        series_with_history, history_rows = _simulate_topk_portfolio(
            predictions=predictions,
            daily_returns=daily_returns,
            topk=2,
            n_drop=0,
            return_history=True,
        )

        assert_series_equal(series_only, series_with_history)
        self.assertEqual(history_rows[0]["entries"], ["AAA", "BBB"])
        self.assertEqual(history_rows[1]["entries"], ["CCC"])
        self.assertEqual(history_rows[1]["exits"], ["AAA"])

        cumulative_from_history = 1.0
        for row in history_rows:
            cumulative_from_history *= 1.0 + float(row["day_return"])

        cumulative_from_series = float((1.0 + series_with_history).prod())
        self.assertAlmostEqual(cumulative_from_history, cumulative_from_series, places=6)


if __name__ == "__main__":
    unittest.main()
