---
title: Calibration Board
type: cockpit-board
status: active
tags: [cockpit, calibration]
---

# Calibration Board

```dataview
TABLE WITHOUT ID agent AS "Agent", window AS "Window",
  accuracy AS "Acc", n AS "N", brier AS "Brier",
  refuted AS "Refuted", survived AS "Survived", refute_rate AS "Refute Rate"
FROM "00_Cockpit/_data"
WHERE type = "calibration-rollup"
SORT agent ASC, window ASC
```
