#!/usr/bin/env python3
"""
yfinance_vol.py - Pull free vol indices + option-chain derived metrics from Yahoo Finance.

Outputs JSON to stdout. Called from yfinance-vol.mjs Node wrapper.

Usage:
    python yfinance_vol.py --indices vix,vvix,move,skew,gvz,ovx,vxn,rvx,vix9d \
                           --interval 1d --period 5d \
                           --pcr SPY,QQQ,IWM \
                           --term-structure SPY \
                           --option-chain-expirations 0,1,2,4,8,12

Dependencies: yfinance, pandas (install with: pip install yfinance pandas).
"""
from __future__ import annotations

import argparse
import json
import math
import sys
import warnings
from datetime import datetime, timezone

# yfinance is noisy with FutureWarnings; suppress for clean JSON output.
warnings.filterwarnings("ignore")


INDEX_TICKERS = {
    "vix": "^VIX",
    "vvix": "^VVIX",
    "move": "^MOVE",
    "skew": "^SKEW",
    "gvz": "^GVZ",
    "ovx": "^OVX",
    "vxn": "^VXN",
    "rvx": "^RVX",
    "vix9d": "^VIX9D",
    "vix3m": "^VIX3M",
    "vix6m": "^VIX6M",
    "vxd": "^VXD",
}


def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--indices", default="vix,vvix,move,skew,gvz,ovx,vxn,rvx,vix9d")
    p.add_argument("--interval", default="1d", help="1m,2m,5m,15m,30m,60m,90m,1h,1d,5d,1wk,1mo,3mo")
    p.add_argument("--period", default="5d", help="1d,5d,1mo,3mo,6mo,1y,2y,5y,10y,ytd,max")
    p.add_argument("--pcr", default="", help="Comma-separated tickers for put/call ratio, e.g. SPY,QQQ,IWM")
    p.add_argument("--term-structure", default="", help="Comma-separated tickers for IV term structure")
    p.add_argument("--option-chain-expirations", default="0,1,2,4,8,12",
                   help="Indices into ticker.options[] to fetch chains for (limits API calls)")
    return p.parse_args()


def import_yfinance():
    try:
        import yfinance as yf  # noqa: F401
        import pandas as pd  # noqa: F401
    except ImportError:
        sys.stderr.write(
            "yfinance and pandas are required. Install with: pip install yfinance pandas\n"
        )
        sys.exit(2)
    return __import__("yfinance"), __import__("pandas")


def sanitize_json_value(value):
    if isinstance(value, float):
        return value if math.isfinite(value) else None
    if isinstance(value, dict):
        return {k: sanitize_json_value(v) for k, v in value.items()}
    if isinstance(value, list):
        return [sanitize_json_value(v) for v in value]
    if isinstance(value, tuple):
        return [sanitize_json_value(v) for v in value]
    return value


def fetch_indices(yf, pd, names, interval, period):
    tickers = [INDEX_TICKERS[n] for n in names if n in INDEX_TICKERS]
    if not tickers:
        return {}
    df = yf.download(
        tickers=" ".join(tickers),
        period=period,
        interval=interval,
        group_by="ticker",
        progress=False,
        auto_adjust=False,
        threads=True,
    )
    out = {}
    for n in names:
        sym = INDEX_TICKERS.get(n)
        if not sym:
            continue
        try:
            sub = df[sym] if len(tickers) > 1 else df
            sub = sub.dropna(how="all")
            if sub.empty:
                continue
            last = sub.iloc[-1]
            prev = sub.iloc[-2] if len(sub) >= 2 else None
            close = float(last.get("Close", float("nan")))
            prev_close = float(prev.get("Close", float("nan"))) if prev is not None else None
            out[n] = {
                "ticker": sym,
                "interval": interval,
                "period": period,
                "last_timestamp": str(sub.index[-1]),
                "close": close,
                "prev_close": prev_close,
                "change": (close - prev_close) if (prev_close is not None and prev_close == prev_close) else None,
                "pct_change": ((close / prev_close - 1.0) * 100) if (prev_close and prev_close == prev_close) else None,
                "high": float(last.get("High", float("nan"))),
                "low": float(last.get("Low", float("nan"))),
                "history": [
                    {
                        "timestamp": str(idx),
                        "open": float(row.get("Open", float("nan"))),
                        "high": float(row.get("High", float("nan"))),
                        "low": float(row.get("Low", float("nan"))),
                        "close": float(row.get("Close", float("nan"))),
                    }
                    for idx, row in sub.tail(40).iterrows()
                ],
            }
        except Exception as exc:  # pragma: no cover
            out[n] = {"ticker": sym, "error": str(exc)}
    return out


def safe_sum(series):
    try:
        return float(series.fillna(0).sum())
    except Exception:
        return 0.0


def compute_pcr(yf, pd, ticker_str, expiration_indices):
    t = yf.Ticker(ticker_str)
    try:
        expiries = list(t.options or [])
    except Exception as exc:
        return {"ticker": ticker_str, "error": f"options list failed: {exc}"}
    if not expiries:
        return {"ticker": ticker_str, "error": "no expiries"}

    spot = None
    try:
        info = t.fast_info
        spot = float(info.get("lastPrice") or info.get("last_price") or 0) or None
    except Exception:
        try:
            hist = t.history(period="1d", interval="1m")
            spot = float(hist["Close"].dropna().iloc[-1]) if not hist.empty else None
        except Exception:
            spot = None

    selected = []
    for idx in expiration_indices:
        if 0 <= idx < len(expiries):
            selected.append(expiries[idx])
    selected = list(dict.fromkeys(selected))  # dedupe preserve order

    by_expiry = []
    total_call_vol = 0.0
    total_put_vol = 0.0
    total_call_oi = 0.0
    total_put_oi = 0.0

    for exp in selected:
        try:
            chain = t.option_chain(exp)
        except Exception as exc:
            by_expiry.append({"expiry": exp, "error": str(exc)})
            continue

        calls = chain.calls
        puts = chain.puts
        cv = safe_sum(calls.get("volume", pd.Series(dtype=float)))
        pv = safe_sum(puts.get("volume", pd.Series(dtype=float)))
        coi = safe_sum(calls.get("openInterest", pd.Series(dtype=float)))
        poi = safe_sum(puts.get("openInterest", pd.Series(dtype=float)))
        total_call_vol += cv
        total_put_vol += pv
        total_call_oi += coi
        total_put_oi += poi

        atm_iv = None
        if spot and not calls.empty and not puts.empty:
            try:
                ck = (calls["strike"] - spot).abs().idxmin()
                pk = (puts["strike"] - spot).abs().idxmin()
                ciV = float(calls.loc[ck, "impliedVolatility"])
                piV = float(puts.loc[pk, "impliedVolatility"])
                atm_iv = (ciV + piV) / 2.0
            except Exception:
                atm_iv = None

        by_expiry.append({
            "expiry": exp,
            "call_volume": cv,
            "put_volume": pv,
            "pc_volume_ratio": (pv / cv) if cv else None,
            "call_open_interest": coi,
            "put_open_interest": poi,
            "pc_oi_ratio": (poi / coi) if coi else None,
            "atm_iv": atm_iv,
            "strikes": int(len(calls) + len(puts)),
        })

    return {
        "ticker": ticker_str,
        "spot": spot,
        "expiries_used": selected,
        "expiries_available": len(expiries),
        "totals": {
            "call_volume": total_call_vol,
            "put_volume": total_put_vol,
            "pc_volume_ratio": (total_put_vol / total_call_vol) if total_call_vol else None,
            "call_open_interest": total_call_oi,
            "put_open_interest": total_put_oi,
            "pc_oi_ratio": (total_put_oi / total_call_oi) if total_call_oi else None,
        },
        "by_expiry": by_expiry,
    }


def compute_term_structure(yf, pd, ticker_str, expiration_indices):
    t = yf.Ticker(ticker_str)
    try:
        expiries = list(t.options or [])
    except Exception as exc:
        return {"ticker": ticker_str, "error": str(exc)}
    if not expiries:
        return {"ticker": ticker_str, "error": "no expiries"}

    spot = None
    try:
        info = t.fast_info
        spot = float(info.get("lastPrice") or info.get("last_price") or 0) or None
    except Exception:
        spot = None

    points = []
    for idx in expiration_indices:
        if not (0 <= idx < len(expiries)):
            continue
        exp = expiries[idx]
        try:
            chain = t.option_chain(exp)
            calls = chain.calls
            puts = chain.puts
            atm_iv = None
            if spot and not calls.empty and not puts.empty:
                try:
                    ck = (calls["strike"] - spot).abs().idxmin()
                    pk = (puts["strike"] - spot).abs().idxmin()
                    atm_iv = (float(calls.loc[ck, "impliedVolatility"]) +
                              float(puts.loc[pk, "impliedVolatility"])) / 2.0
                except Exception:
                    pass
            days = (datetime.strptime(exp, "%Y-%m-%d") - datetime.utcnow()).days
            points.append({"expiry": exp, "days_to_expiry": max(days, 0), "atm_iv": atm_iv})
        except Exception as exc:
            points.append({"expiry": exp, "error": str(exc)})

    return {"ticker": ticker_str, "spot": spot, "points": points}


def main():
    args = parse_args()
    yf, pd = import_yfinance()

    out = {
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "interval": args.interval,
        "period": args.period,
        "indices": {},
        "pcr": [],
        "term_structure": [],
    }

    if args.indices:
        names = [n.strip().lower() for n in args.indices.split(",") if n.strip()]
        out["indices"] = fetch_indices(yf, pd, names, args.interval, args.period)

    expiration_indices = [int(x) for x in args.option_chain_expirations.split(",") if x.strip().isdigit()]

    if args.pcr:
        for ticker in [t.strip() for t in args.pcr.split(",") if t.strip()]:
            out["pcr"].append(compute_pcr(yf, pd, ticker, expiration_indices))

    if args.term_structure:
        for ticker in [t.strip() for t in args.term_structure.split(",") if t.strip()]:
            out["term_structure"].append(compute_term_structure(yf, pd, ticker, expiration_indices))

    json.dump(sanitize_json_value(out), sys.stdout, default=str, allow_nan=False)


if __name__ == "__main__":
    main()
