from __future__ import annotations

import sys
import unittest
from pathlib import Path

import pandas as pd

QLIB_DIR = Path(__file__).resolve().parents[1]
if str(QLIB_DIR) not in sys.path:
    sys.path.insert(0, str(QLIB_DIR))

from factors import _compute_ic_series  # noqa: E402


class FactorICTests(unittest.TestCase):
    def test_compute_ic_series_preserves_daily_spearman_behavior(self) -> None:
        dates = pd.to_datetime(["2026-01-02", "2026-01-03"])
        instruments = ["AAA", "BBB", "CCC", "DDD", "EEE"]
        index = pd.MultiIndex.from_product(
            [dates, instruments],
            names=["datetime", "instrument"],
        )

        features = pd.DataFrame(
            {
                "POS_FACTOR": [1, 2, 3, 4, 5, 5, 4, 3, 2, 1],
                "NEG_FACTOR": [5, 4, 3, 2, 1, 1, 2, 3, 4, 5],
            },
            index=index,
        )
        forward_returns = pd.Series(
            [1, 2, 3, 4, 5, 5, 4, 3, 2, 1],
            index=index,
            name="fwd_ret",
        )

        result = _compute_ic_series(features, forward_returns)

        self.assertAlmostEqual(result["POS_FACTOR"]["ic"], 1.0, places=6)
        self.assertAlmostEqual(result["NEG_FACTOR"]["ic"], -1.0, places=6)
        self.assertAlmostEqual(result["POS_FACTOR"]["icir"], 0.0, places=6)
        self.assertAlmostEqual(result["NEG_FACTOR"]["icir"], 0.0, places=6)


if __name__ == "__main__":
    unittest.main()
