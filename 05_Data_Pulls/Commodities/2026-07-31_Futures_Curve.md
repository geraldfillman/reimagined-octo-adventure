---
title: "Futures Term Structure"
source: "Yahoo Finance futures chains (unofficial)"
date_pulled: "2026-07-31"
domain: "commodities"
data_type: "futures_curve"
curves:
  crude_oil: "backwardation"
  natural_gas: "contango"
  copper: "contango"
  gold: "flat"
  wheat: "contango"
  corn: "contango"
  soybeans: "flat"
curves_json: "{\"crude_oil\":\"backwardation\",\"natural_gas\":\"contango\",\"copper\":\"contango\",\"gold\":\"flat\",\"wheat\":\"contango\",\"corn\":\"contango\",\"soybeans\":\"flat\"}"
signal_status: "watch"
tags: ["commodities", "futures", "term-structure"]
related_pulls: []
---

## Is the physical market tight? (front vs ~6-month deferred)

| Commodity | Front | Deferred | Spread | State |
| --- | --- | --- | --- | --- |
| WTI Crude | 86.80 | CLF27.NYM: 76.23 | +13.9% | backwardation |
| Natural Gas | 2.79 | NGF27.NYM: 4.22 | -33.8% | contango (seasonal caveat) |
| Copper | 6.51 | HGH27.CMX: 6.70 | -2.9% | contango |
| Gold | 4098.60 | GCG27.CMX: 4132.50 | -0.8% | flat |
| Wheat (SRW) | 638.00 | ZWH27.CBT: 673.00 | -5.2% | contango |
| Corn | 463.75 | ZCH27.CBT: 479.75 | -3.3% | contango |
| Soybeans | 1188.25 | ZSF27.CBT: 1201.75 | -1.1% | flat |

## Reading the curve

- **Backwardation** (front > deferred): buyers pay a premium for prompt delivery — physical tightness. Raises confidence in rise-side transmission edges.
- **Contango** (front < deferred): normal carry. Deep contango can mean glut.
- Natural gas carries seasonal contango into winter — compare against seasonal norms before reading it as supply signal.
- Keys match `transmission-map.json`; `commodity-transmission` annotates its signals with these states.
- Source is unofficial (Yahoo); when TastyTrade futures-chain exports arrive, they become the verified curve source.
