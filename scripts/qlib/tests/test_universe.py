from __future__ import annotations

import shutil
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

QLIB_DIR = Path(__file__).resolve().parents[1]
if str(QLIB_DIR) not in sys.path:
    sys.path.insert(0, str(QLIB_DIR))

import universe  # noqa: E402


class UniverseResolverTests(unittest.TestCase):
    def setUp(self) -> None:
        self.root = QLIB_DIR / "tests" / "_tmp_universe"
        shutil.rmtree(self.root, ignore_errors=True)
        (self.root / "08_Entities" / "Stocks").mkdir(parents=True, exist_ok=True)
        (self.root / "08_Entities" / "ETFs").mkdir(parents=True, exist_ok=True)
        (self.root / "08_Entities" / "Commodities").mkdir(parents=True, exist_ok=True)
        (self.root / "08_Entities" / "Countries").mkdir(parents=True, exist_ok=True)
        (self.root / "09_Macro" / "Regimes").mkdir(parents=True, exist_ok=True)
        (self.root / "10_Theses").mkdir(parents=True, exist_ok=True)

    def tearDown(self) -> None:
        universe._get_tradable_symbol_maps.cache_clear()
        universe._get_non_tradable_entity_maps.cache_clear()
        universe._get_available_market_symbols.cache_clear()
        shutil.rmtree(self.root, ignore_errors=True)

    def test_resolver_prefers_tradable_exact_match_and_filters_non_tradable_notes(self) -> None:
        (self.root / "08_Entities" / "Stocks" / "GOLD.md").write_text(
            "---\n"
            'node_type: "stock"\n'
            'ticker: "GOLD"\n'
            "---\n",
            encoding="utf-8",
        )
        (self.root / "08_Entities" / "Commodities" / "Gold.md").write_text(
            "---\n"
            'node_type: "commodity"\n'
            "---\n",
            encoding="utf-8",
        )
        (self.root / "08_Entities" / "Countries" / "USA.md").write_text(
            "---\n"
            'node_type: "country"\n'
            "---\n",
            encoding="utf-8",
        )

        with (
            patch.object(universe, "get_vault_root", return_value=self.root),
            patch.object(universe, "_get_available_market_symbols", return_value={"PLTR", "GOLD"}),
        ):
            resolved = universe._extract_universe_tickers(
                ["[[GOLD]]", "[[Gold]]", "[[USA]]", "[[PLTR]]", "[[WHO]]", "[[NATO]]"]
            )

        self.assertEqual(resolved, ["GOLD", "PLTR"])

    def test_get_thesis_tickers_supports_etf_notes_and_market_symbol_fallback(self) -> None:
        (self.root / "08_Entities" / "ETFs" / "PSIL.md").write_text(
            "---\n"
            'node_type: "etf"\n'
            'ticker: "PSIL"\n'
            "---\n",
            encoding="utf-8",
        )
        (self.root / "10_Theses" / "Example.md").write_text(
            "---\n"
            'name: "Example Basket"\n'
            'core_entities: ["[[PSIL]]", "[[NVDA]]", "[[WHO]]"]\n'
            "---\n",
            encoding="utf-8",
        )

        with (
            patch.object(universe, "get_vault_root", return_value=self.root),
            patch.object(universe, "_get_available_market_symbols", return_value={"PSIL", "NVDA"}),
        ):
            tickers = universe.get_thesis_tickers("Example Basket")

        self.assertEqual(tickers, ["NVDA", "PSIL"])


if __name__ == "__main__":
    unittest.main()
