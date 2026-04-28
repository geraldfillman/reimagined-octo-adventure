"""
cli.py — Main CLI entry point for all Qlib operations in the My_Data vault.

Designed to be called from Node.js run.mjs via subprocess, but fully usable
standalone.

Usage:
    python scripts/qlib/cli.py setup                      # Bootstrap Qlib data
    python scripts/qlib/cli.py status                     # Show Qlib data status
    python scripts/qlib/cli.py universe --list            # List all thesis universes
    python scripts/qlib/cli.py universe --thesis Housing  # Tickers for one thesis
    python scripts/qlib/cli.py factors --universe thesis  # Factor analysis (Phase 2)
    python scripts/qlib/cli.py factors --thesis Housing   # Per-thesis factors (Phase 2)
    python scripts/qlib/cli.py backtest --strategy alpha158  # Backtest (Phase 2)
"""

import argparse
import sys
import time
from pathlib import Path

# Ensure sibling modules are importable regardless of working directory
_QLIB_DIR = str(Path(__file__).resolve().parent)
if _QLIB_DIR not in sys.path:
    sys.path.insert(0, _QLIB_DIR)

# ---------------------------------------------------------------------------
# .env loading — must happen before any module that reads env vars
# ---------------------------------------------------------------------------

def _load_dotenv() -> None:
    """Load .env from the vault root (best-effort; silent if dotenv absent)."""
    try:
        from dotenv import load_dotenv  # type: ignore  # noqa: PLC0415
        vault_root = Path(__file__).resolve().parent.parent.parent
        env_path = vault_root / ".env"
        if env_path.exists():
            load_dotenv(dotenv_path=env_path)
    except ImportError:
        pass  # python-dotenv not installed; env vars must be set externally


_load_dotenv()


# ---------------------------------------------------------------------------
# Timing helper (mirrors the Node.js CLI pattern)
# ---------------------------------------------------------------------------

class _Timer:
    """Simple elapsed-time context manager."""

    def __enter__(self):
        self._start = time.perf_counter()
        return self

    def __exit__(self, *_):
        self.elapsed = time.perf_counter() - self._start

    def __str__(self) -> str:
        return f"{self.elapsed:.1f}s"


# ---------------------------------------------------------------------------
# Subcommand: setup
# ---------------------------------------------------------------------------

def cmd_setup(args: argparse.Namespace) -> int:
    """Bootstrap Qlib data directory with fresh Yahoo Finance data."""
    from bootstrap_data import run as bootstrap_run  # noqa: PLC0415

    quick = getattr(args, "quick", False)
    print(f"[qlib/setup] Bootstrapping Qlib data — {'quick' if quick else 'full'} mode")

    with _Timer() as t:
        try:
            bootstrap_run(quick=quick)
        except RuntimeError as exc:
            print(f"[qlib/setup] ERROR: {exc}", file=sys.stderr)
            return 1
        except Exception as exc:  # noqa: BLE001
            print(f"[qlib/setup] Unexpected error: {exc}", file=sys.stderr)
            return 1

    print(f"[qlib/setup] Done in {t}.")
    return 0


# ---------------------------------------------------------------------------
# Subcommand: status
# ---------------------------------------------------------------------------

def cmd_status(args: argparse.Namespace) -> int:  # noqa: ARG001
    """Show Qlib data status, Python version, and instrument counts."""
    from data_bridge import get_data_dir, get_available_instruments  # noqa: PLC0415
    from universe import get_all_thesis_universes  # noqa: PLC0415

    print("[qlib/status] Qlib Integration Status")
    print("=" * 48)

    # Python version
    major, minor, micro = sys.version_info[:3]
    ok_py = (major, minor) >= (3, 8)
    flag = "OK " if ok_py else "ERR"
    print(f"  [{flag}] Python {major}.{minor}.{micro}")

    # qlib importable?
    try:
        import qlib  # type: ignore  # noqa: PLC0415, F401
        qlib_version = getattr(qlib, "__version__", "unknown")
        print(f"  [OK ] qlib importable — version {qlib_version}")
    except ImportError:
        print("  [ERR] qlib NOT importable — run: pip install pyqlib")

    # .qlib_data/ present?
    data_dir = get_data_dir()
    if data_dir.exists():
        print(f"  [OK ] .qlib_data/ exists — {data_dir}")
    else:
        print(f"  [ERR] .qlib_data/ not found — run: python scripts/qlib/cli.py setup")

    # Instrument count
    instruments = get_available_instruments()
    if instruments:
        print(f"  [OK ] Instruments available: {len(instruments)}")
    else:
        print("  [--] No instruments found in data store yet.")

    # Thesis universe counts
    universes = get_all_thesis_universes()
    if universes:
        total_tickers = sum(len(v) for v in universes.values())
        print(f"  [OK ] Thesis universes: {len(universes)} ({total_tickers} total tickers)")
    else:
        print("  [--] No thesis universes found.")

    print("=" * 48)
    return 0


# ---------------------------------------------------------------------------
# Subcommand: universe
# ---------------------------------------------------------------------------

def cmd_universe(args: argparse.Namespace) -> int:
    """List thesis universes or show tickers for a specific thesis."""
    from universe import (  # noqa: PLC0415
        get_all_thesis_universes,
        get_thesis_tickers,
    )

    if args.list:
        universes = get_all_thesis_universes()
        if not universes:
            print("[qlib/universe] No thesis files found.")
            return 0

        print(f"[qlib/universe] {len(universes)} thesis universe(s):\n")
        for thesis, tickers in sorted(universes.items()):
            ticker_str = ", ".join(tickers) if tickers else "(no core_entities)"
            print(f"  {thesis}")
            print(f"    {ticker_str}")
        return 0

    if args.thesis:
        tickers = get_thesis_tickers(args.thesis)
        if not tickers:
            print(
                f"[qlib/universe] No tickers found for thesis matching: {args.thesis}",
                file=sys.stderr,
            )
            return 1
        print(f"[qlib/universe] {args.thesis} ({len(tickers)} tickers):")
        for t in tickers:
            print(f"  {t}")
        return 0

    print("[qlib/universe] Specify --list or --thesis <name>.", file=sys.stderr)
    return 1


# ---------------------------------------------------------------------------
# Shared workflow helpers
# ---------------------------------------------------------------------------

def _run_factor_job(
    thesis: str | None = None,
    universe: str | None = None,
) -> tuple[dict, str]:
    from factors import run_factor_analysis, run_thesis_factors  # noqa: PLC0415
    from universe import get_all_tickers  # noqa: PLC0415

    if thesis:
        print(f"[qlib/factors] Running factor analysis for thesis: {thesis}")
        return run_thesis_factors(thesis), thesis

    if universe == "thesis":
        tickers = get_all_tickers()
        if not tickers:
            raise ValueError("No tickers found in 08_Entities/Stocks/.")
        print(f"[qlib/factors] Running factor analysis on {len(tickers)} vault tickers")
        return run_factor_analysis(tickers, universe_name="all_vault_stocks"), "All_Stocks"

    raise ValueError("Specify --thesis <name> or --universe thesis.")


def _run_score_job(
    thesis: str | None = None,
    score_all: bool = False,
    top_n: int = 5,
) -> list[dict]:
    from scorer import score_all_theses, score_thesis  # noqa: PLC0415

    if thesis:
        print(f"[qlib/score] Scoring thesis: {thesis}")
        return [score_thesis(thesis, top_n_factors=top_n)]

    if score_all:
        print("[qlib/score] Scoring all theses with factor reports ...")
        return score_all_theses(top_n_factors=top_n)

    raise ValueError("Specify --thesis <name> or --all.")


def _run_backtest_job(
    thesis: str | None = None,
    universe: str | None = None,
    strategy: str = "alpha158_lgbm",
    topk: int = 3,
    n_drop: int = 1,
) -> tuple[dict, str]:
    from backtest import run_backtest, run_thesis_backtest  # noqa: PLC0415
    from universe import get_all_tickers  # noqa: PLC0415

    if thesis:
        print(f"[qlib/backtest] Running backtest for thesis: {thesis}")
        return run_thesis_backtest(thesis, strategy=strategy, topk=topk, n_drop=n_drop), thesis

    if universe == "thesis":
        tickers = get_all_tickers()
        if not tickers:
            raise ValueError("No tickers found in 08_Entities/Stocks/.")
        print(f"[qlib/backtest] Running backtest on {len(tickers)} vault tickers")
        return (
            run_backtest(
                tickers,
                universe_name="all_vault_stocks",
                strategy=strategy,
                topk=topk,
                n_drop=n_drop,
            ),
            "All_Stocks",
        )

    raise ValueError("Specify --thesis <name> or --universe thesis.")


# ---------------------------------------------------------------------------
# Subcommand: factors
# ---------------------------------------------------------------------------

def cmd_factors(args: argparse.Namespace) -> int:
    """Run Alpha158 factor analysis on a thesis or custom universe."""
    from report import write_factor_report  # noqa: PLC0415

    try:
        result, thesis_label = _run_factor_job(thesis=args.thesis, universe=args.universe)
        filepath = write_factor_report(result, thesis_label)
        print(f"[qlib/factors] Report written: {filepath}")

        s = result.get("summary", {})
        print(f"  Total factors : {s.get('total_factors', 0)}")
        print(f"  Positive IC   : {s.get('positive_ic_count', 0)}")
        print(f"  Average IC    : {s.get('avg_ic', 0):.4f}")
        print(f"  Best factor   : {s.get('best_factor', '')} (IC={s.get('best_ic', 0):.4f})")
        return 0

    except (RuntimeError, ValueError) as exc:
        print(f"[qlib/factors] ERROR: {exc}", file=sys.stderr)
        return 1


# ---------------------------------------------------------------------------
# Subcommand: backtest  (Phase 2 stub)
# ---------------------------------------------------------------------------

def cmd_backtest(args: argparse.Namespace) -> int:
    """Run a LightGBM + Alpha158 backtest on a thesis universe."""
    from report import write_backtest_report  # noqa: PLC0415

    strategy = getattr(args, "strategy", "alpha158_lgbm")
    topk = getattr(args, "topk", 3)
    n_drop = getattr(args, "n_drop", 1)

    try:
        result, label = _run_backtest_job(
            thesis=args.thesis,
            universe=args.universe,
            strategy=strategy,
            topk=topk,
            n_drop=n_drop,
        )
        filepath = write_backtest_report(result, f"{strategy}_{label}")
        print(f"[qlib/backtest] Report written: {filepath}")

        print(f"  Strategy      : {result.get('strategy', strategy)}")
        print(f"  Universe      : {result.get('universe', '?')} ({len(result.get('tickers', []))} tickers)")
        print(f"  Test period   : {result.get('start_date', '?')} to {result.get('end_date', '?')}")
        print(f"  Sharpe Ratio  : {result.get('sharpe', 0):.4f}")
        print(f"  Annual Return : {result.get('annual_return', 0) * 100:.2f}%")
        print(f"  Max Drawdown  : {result.get('max_drawdown', 0) * 100:.2f}%")
        metrics = result.get("metrics", {})
        if "win_rate" in metrics:
            print(f"  Win Rate      : {metrics['win_rate']:.1%}")
        return 0

    except (RuntimeError, ValueError) as exc:
        print(f"[qlib/backtest] ERROR: {exc}", file=sys.stderr)
        return 1


# ---------------------------------------------------------------------------
# Subcommand: sim
# ---------------------------------------------------------------------------

def cmd_sim(args: argparse.Namespace) -> int:
    """Run animated pipeline simulation in the terminal."""
    from simulator import run_simulation  # noqa: PLC0415

    try:
        tickers = None
        thesis = getattr(args, "thesis", None)
        raw_tickers = getattr(args, "tickers", None)
        if raw_tickers:
            tickers = [t.strip().upper() for t in raw_tickers.split(",")]

        run_simulation(
            tickers=tickers,
            thesis_name=thesis,
            start_date=getattr(args, "start", "2020-01-01"),
            end_date=getattr(args, "end", None),
            topk=getattr(args, "topk", 5),
            n_drop=getattr(args, "n_drop", 2),
            speed=getattr(args, "speed", "normal"),
            top_n_factors=getattr(args, "top_n", 5),
            ascii_only=getattr(args, "ascii", False),
            allow_fallback=getattr(args, "allow_fallback", False),
            summary_only=getattr(args, "summary_only", False),
            ticker_focus=getattr(args, "ticker", None),
            compare_specs=getattr(args, "compare", None),
            phase=getattr(args, "phase", "replay"),
            show_last=getattr(args, "show_last", 8),
            show_timings=getattr(args, "timings", False),
            save_format=getattr(args, "save", None),
            save_path=getattr(args, "save_path", None),
        )
        return 0

    except (RuntimeError, ValueError) as exc:
        print(f"[qlib/sim] ERROR: {exc}", file=sys.stderr)
        return 1
    except KeyboardInterrupt:
        print("\n[qlib/sim] Interrupted.")
        return 0


# ---------------------------------------------------------------------------
# Subcommand: score
# ---------------------------------------------------------------------------

def cmd_score(args: argparse.Namespace) -> int:
    """Score thesis stocks using IC-weighted Alpha158 factors."""
    from report import write_score_report, write_signal_note  # noqa: PLC0415

    try:
        results_list = _run_score_job(
            thesis=args.thesis,
            score_all=args.all,
            top_n=args.top_n,
        )

        for result in results_list:
            thesis = result.get("thesis", "?")
            stocks = result.get("stocks", [])
            alerts = result.get("alerts", [])

            # Write score report
            filepath = write_score_report(result, thesis)
            print(f"\n  [{thesis}] Report: {filepath.name}")

            # Print ranked watchlist
            if stocks:
                print(f"  {'Rank':<5} {'Ticker':<8} {'Score':>7}  Signal")
                for s in stocks:
                    sig = s.get("signal", "—")
                    print(f"  {s['rank']:<5} {s['ticker']:<8} {s['composite_score']:>7.1f}  {sig}")

            # Write signal notes for alerts
            for alert in alerts:
                sig_path = write_signal_note(alert, thesis)
                sev = alert.get("severity", "watch").upper()
                print(f"  >> {sev}: {alert['ticker']} — {alert.get('signal_type', '')} → {sig_path.name}")

            if not alerts:
                print("  No threshold alerts triggered.")

        return 0

    except (RuntimeError, ValueError) as exc:
        print(f"[qlib/score] ERROR: {exc}", file=sys.stderr)
        return 1


# ---------------------------------------------------------------------------
# Subcommand: refresh
# ---------------------------------------------------------------------------

def cmd_refresh(args: argparse.Namespace) -> int:
    """Run the standard reporting workflow for one thesis or all theses."""
    from report import (
        write_backtest_report,
        write_factor_report,
        write_score_report,
        write_signal_note,
    )  # noqa: PLC0415
    from thesis_updater import update_thesis  # noqa: PLC0415
    from universe import get_all_thesis_universes  # noqa: PLC0415

    strategy = getattr(args, "strategy", "alpha158_lgbm")
    topk = getattr(args, "topk", 3)
    n_drop = getattr(args, "n_drop", 1)
    top_n = getattr(args, "top_n", 5)

    thesis_targets: list[str]
    if getattr(args, "all", False):
        thesis_targets = sorted(get_all_thesis_universes())
        if not thesis_targets:
            print("[qlib/refresh] No thesis universes found.", file=sys.stderr)
            return 1
    elif args.thesis:
        thesis_targets = [args.thesis]
    else:
        print("[qlib/refresh] Specify --thesis <name> or --all.", file=sys.stderr)
        return 1

    def _refresh_one(thesis: str) -> dict:
        factor_result, factor_label = _run_factor_job(thesis=thesis)
        factor_path = write_factor_report(factor_result, factor_label)
        print(f"[qlib/refresh] Factor report   : {factor_path.name}")

        score_results = _run_score_job(thesis=thesis, top_n=top_n)
        score_result = score_results[0]
        score_path = write_score_report(score_result, thesis)
        print(f"[qlib/refresh] Score report    : {score_path.name}")

        for alert in score_result.get("alerts", []):
            sig_path = write_signal_note(alert, thesis)
            sev = alert.get("severity", "watch").upper()
            print(f"[qlib/refresh] Signal ({sev})  : {sig_path.name}")

        if not score_result.get("alerts"):
            print("[qlib/refresh] Signal notes    : none")

        if args.with_backtest:
            backtest_result, backtest_label = _run_backtest_job(
                thesis=thesis,
                strategy=strategy,
                topk=topk,
                n_drop=n_drop,
            )
            backtest_path = write_backtest_report(backtest_result, f"{strategy}_{backtest_label}")
            print(f"[qlib/refresh] Backtest report : {backtest_path.name}")

        update_result = update_thesis(thesis)
        if not update_result.get("updated_fields"):
            print("[qlib/refresh] Thesis rollup did not update.", file=sys.stderr)
            return 1

        fields = update_result["updated_fields"]
        print("[qlib/refresh] Thesis updated  : "
              f"best_ic={fields.get('qlib_best_ic', 'n/a')}, "
              f"signal={fields.get('qlib_signal_status', 'n/a')}, "
              f"last_run={fields.get('qlib_last_run', 'n/a')}")
        return {
            "thesis": thesis,
            "updated_fields": fields,
        }

    if len(thesis_targets) == 1:
        try:
            _refresh_one(thesis_targets[0])
            return 0
        except (RuntimeError, ValueError) as exc:
            print(f"[qlib/refresh] ERROR: {exc}", file=sys.stderr)
            return 1

    refreshed: list[dict] = []
    failed: list[tuple[str, str]] = []
    for thesis in thesis_targets:
        print(f"\n[qlib/refresh] === {thesis} ===")
        try:
            refreshed.append(_refresh_one(thesis))
        except (RuntimeError, ValueError) as exc:
            failed.append((thesis, str(exc)))
            print(f"[qlib/refresh] ERROR: {exc}", file=sys.stderr)

    print(f"\n[qlib/refresh] Completed {len(refreshed)}/{len(thesis_targets)} thesis refreshes.")
    if failed:
        print("[qlib/refresh] Failed theses:")
        for thesis, error in failed:
            print(f"  - {thesis}: {error}")
        return 1

    return 0


# ---------------------------------------------------------------------------
# Subcommand: update-theses
# ---------------------------------------------------------------------------

def cmd_update_theses(args: argparse.Namespace) -> int:
    """Update thesis frontmatter with latest Qlib quantitative scores."""
    from thesis_updater import update_all_theses, update_thesis  # noqa: PLC0415

    try:
        if args.thesis:
            print(f"[qlib/update-theses] Updating thesis: {args.thesis}")
            result = update_thesis(args.thesis)
            results = [result]
        else:
            print("[qlib/update-theses] Updating all theses with available Qlib reports ...")
            results = update_all_theses()

        updated = [r for r in results if r.get("updated_fields")]
        skipped = [r for r in results if not r.get("updated_fields")]

        if updated:
            print(f"\n  Updated {len(updated)} thesis note(s):")
            for r in updated:
                fields = r["updated_fields"]
                parts = []
                v = fields.get("qlib_best_ic")
                if v is not None:
                    parts.append(f"best_ic={v:.4f}")
                v = fields.get("qlib_backtest_sharpe")
                if v is not None:
                    parts.append(f"sharpe={v:.4f}")
                v = fields.get("qlib_positive_factor_count")
                if v is not None:
                    parts.append(f"pos_factors={v}")
                v = fields.get("qlib_universe_size")
                if v is not None:
                    parts.append(f"universe={v}")
                v = fields.get("qlib_signal_status")
                if v is not None:
                    parts.append(f"signal={v}")
                print(f"    {r['thesis']}: {', '.join(parts) or 'last_run updated'}")
        else:
            print("\n  No theses updated — run factors/backtest first to generate reports.")

        if skipped:
            print(f"  Skipped {len(skipped)} thesis(es) (no Qlib reports found)")

        return 0

    except (RuntimeError, ValueError) as exc:
        print(f"[qlib/update-theses] ERROR: {exc}", file=sys.stderr)
        return 1


# ---------------------------------------------------------------------------
# Argument parser
# ---------------------------------------------------------------------------

def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="python scripts/qlib/cli.py",
        description="Qlib quantitative analysis CLI for the My_Data vault.",
    )
    sub = parser.add_subparsers(dest="command", metavar="COMMAND")
    sub.required = True

    # setup
    p_setup = sub.add_parser("setup", help="Bootstrap Qlib data directory with fresh Yahoo Finance data.")
    p_setup.add_argument(
        "--quick",
        action="store_true",
        help="Download only 10 test tickers instead of full vault universe.",
    )

    # status
    sub.add_parser("status", help="Show Qlib data status and diagnostics.")

    # universe
    p_uni = sub.add_parser("universe", help="List or query thesis instrument universes.")
    uni_group = p_uni.add_mutually_exclusive_group(required=True)
    uni_group.add_argument(
        "--list",
        action="store_true",
        help="List all thesis universes with their tickers.",
    )
    uni_group.add_argument(
        "--thesis",
        metavar="NAME",
        help="Show tickers for a specific thesis (case-insensitive substring match).",
    )

    # factors (Phase 2)
    p_fac = sub.add_parser("factors", help="Factor analysis (Phase 2).")
    p_fac.add_argument(
        "--universe",
        metavar="UNIVERSE",
        help="Instrument universe to analyse (e.g. 'thesis', 'all').",
    )
    p_fac.add_argument(
        "--thesis",
        metavar="NAME",
        help="Limit factor analysis to a specific thesis universe.",
    )

    # backtest
    p_bt = sub.add_parser("backtest", help="Run LightGBM + Alpha158 backtest.")
    p_bt.add_argument(
        "--strategy",
        metavar="STRATEGY",
        default="alpha158_lgbm",
        help="Strategy name (default: alpha158_lgbm).",
    )
    p_bt.add_argument(
        "--thesis",
        metavar="NAME",
        help="Run backtest on a specific thesis universe.",
    )
    p_bt.add_argument(
        "--universe",
        metavar="UNIVERSE",
        help="Instrument universe (e.g. 'thesis' for all vault stocks).",
    )
    p_bt.add_argument(
        "--topk",
        type=int,
        default=3,
        help="Number of top stocks to hold (default: 3).",
    )
    p_bt.add_argument(
        "--n-drop",
        type=int,
        default=1,
        dest="n_drop",
        help="Dropout buffer per rebalance (default: 1).",
    )

    # sim
    p_sim = sub.add_parser("sim", help="Animated pipeline simulation in terminal.")
    p_sim.add_argument("--thesis", metavar="NAME", help="Thesis universe to simulate.")
    p_sim.add_argument("--tickers", metavar="T1,T2", help="Comma-separated ticker list.")
    p_sim.add_argument("--speed", default="normal", choices=["slow", "normal", "fast", "instant"],
                        help="Animation speed (default: normal).")
    p_sim.add_argument("--topk", type=int, default=5, help="Stocks to hold (default: 5).")
    p_sim.add_argument("--n-drop", type=int, default=2, dest="n_drop", help="Dropout per rebalance (default: 2).")
    p_sim.add_argument("--start", default="2020-01-01", help="Start date (default: 2020-01-01).")
    p_sim.add_argument("--end", help="End date (default: today).")
    p_sim.add_argument("--top-n", type=int, default=5, dest="top_n", help="Top N factors (default: 5).")
    p_sim.add_argument(
        "--phase",
        default="replay",
        choices=["factors", "score", "backtest", "replay"],
        help="Stop after a specific phase (default: replay).",
    )
    p_sim.add_argument("--summary-only", action="store_true", dest="summary_only", help="Skip animated replay and print summary only.")
    p_sim.add_argument("--ticker", metavar="SYMBOL", help="Explain one ticker's score, alerts, and replay history.")
    p_sim.add_argument("--show-last", type=int, default=8, dest="show_last", help="Rows to show in replay/history tables (default: 8).")
    p_sim.add_argument("--timings", action="store_true", help="Print phase timing diagnostics.")
    p_sim.add_argument("--save", choices=["json", "md"], help="Save a diagnostic snapshot outside the vault note flow.")
    p_sim.add_argument("--save-path", help="Optional output path for --save (defaults to scripts/.cache/qlib_sim/...).")
    p_sim.add_argument(
        "--compare",
        action="append",
        metavar="SPEC",
        help='Compare scenario overrides like "label=defensive,topk=3,n_drop=1,end=2025-12-31". Repeatable.',
    )
    p_sim.add_argument("--ascii", action="store_true", help="Force ASCII-safe terminal rendering.")
    p_sim.add_argument(
        "--allow-fallback",
        action="store_true",
        dest="allow_fallback",
        help="Allow explicit demo/fallback behaviour instead of failing fast.",
    )

    # refresh
    p_rf = sub.add_parser("refresh", help="Run the standard quant reporting workflow for one thesis or all theses.")
    rf_group = p_rf.add_mutually_exclusive_group(required=True)
    rf_group.add_argument("--thesis", metavar="NAME", help="Thesis universe to refresh.")
    rf_group.add_argument("--all", action="store_true", help="Refresh all thesis universes.")
    p_rf.add_argument("--with-backtest", action="store_true", help="Include a fresh backtest in the refresh flow.")
    p_rf.add_argument("--strategy", metavar="STRATEGY", default="alpha158_lgbm", help="Backtest strategy name.")
    p_rf.add_argument("--topk", type=int, default=3, help="Stocks to hold if --with-backtest is used.")
    p_rf.add_argument("--n-drop", type=int, default=1, dest="n_drop", help="Dropout buffer if --with-backtest is used.")
    p_rf.add_argument("--top-n", type=int, default=5, dest="top_n", help="Top N factors to use for score generation.")

    # score
    p_sc = sub.add_parser("score", help="Score thesis stocks using IC-weighted factors.")
    p_sc.add_argument(
        "--thesis",
        metavar="NAME",
        help="Score stocks for a specific thesis.",
    )
    p_sc.add_argument(
        "--all",
        action="store_true",
        help="Score all theses that have factor reports.",
    )
    p_sc.add_argument(
        "--top-n",
        type=int,
        default=5,
        dest="top_n",
        help="Number of top factors to use for composite score (default: 5).",
    )

    # update-theses
    p_ut = sub.add_parser("update-theses", help="Update thesis frontmatter with Qlib scores.")
    p_ut.add_argument(
        "--thesis",
        metavar="NAME",
        help="Update a single thesis (case-insensitive substring match).",
    )

    return parser


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------

_COMMANDS = {
    "setup": cmd_setup,
    "status": cmd_status,
    "universe": cmd_universe,
    "factors": cmd_factors,
    "backtest": cmd_backtest,
    "sim": cmd_sim,
    "refresh": cmd_refresh,
    "score": cmd_score,
    "update-theses": cmd_update_theses,
}


def main() -> None:
    parser = _build_parser()
    args = parser.parse_args()

    handler = _COMMANDS.get(args.command)
    if handler is None:
        print(f"Unknown command: {args.command}", file=sys.stderr)
        sys.exit(1)

    with _Timer() as t:
        exit_code = handler(args)

    if args.command not in ("status", "universe"):
        # Timing is most useful for long-running operations
        print(f"[qlib/{args.command}] Elapsed: {t}")

    sys.exit(exit_code)


if __name__ == "__main__":
    main()
