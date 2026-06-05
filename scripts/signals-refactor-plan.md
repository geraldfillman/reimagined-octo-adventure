# Implementation Plan: signals.mjs Decomposition

## Overview

Split `lib/signals.mjs` (1256 lines, 26 exports, 13 importers) into 8 domain modules under `lib/signals/` with a barrel `index.mjs` that re-exports everything. Zero breaking changes — all 13 importers continue working without modification.

## Current State

- **File**: `lib/signals.mjs` — 1256 lines, 1 internal helper (`createSignal`), 26 exports
- **Importers**: 13 files under `pullers/`
- **Dead exports** (defined but never imported): `evaluateCaseShiller`, `evaluateCPIHousingDivergence`, `evaluateOilPrice`

## Target Module Structure

```
lib/
  signals.mjs              <-- thin redirect after migration (Phase 3)
  signals/
    index.mjs              <-- barrel re-export (backwards compat)
    base.mjs               <-- createSignal, Signal typedef
    utils.mjs              <-- highestSeverity, formatSignalsSection
    macro.mjs              <-- yield curve, unemployment, claims, CPI, Fed, credit, RRP
    housing.mjs            <-- housing starts, mortgage rate, Case-Shiller
    energy.mjs             <-- oil, electricity demand, generation gap, regional load
    market.mjs             <-- put/call, SKEW, VIX term structure, unusual options
    biotech.mjs            <-- FDA approvals, Phase 3 trials
    government.mjs         <-- large contract, large opportunity, opportunity cluster
    cross-domain.mjs       <-- FEMA spike, CPI-housing divergence, patent velocity
```

## Function-to-Module Assignment

### `signals/base.mjs` (~20 lines)
| Function | Lines | Notes |
|---|---|---|
| `createSignal` | 1243-1256 | Internal, not re-exported from barrel |
| `Signal` typedef | 15-26 | JSDoc typedef |

### `signals/utils.mjs` (~50 lines)
| Function | Lines | Importers |
|---|---|---|
| `highestSeverity` | 1203-1210 | All 13 importers |
| `formatSignalsSection` | 1217-1239 | 10 importers |

### `signals/macro.mjs` (~310 lines)
| Function | Importers |
|---|---|
| `evaluateYieldCurve` | fred.mjs |
| `evaluateUnemploymentSpike` | fred.mjs |
| `evaluateInitialClaims` | fred.mjs |
| `evaluateCPI` | fred.mjs |
| `evaluateFedBalanceSheet` | fred.mjs |
| `evaluateCreditSpreads` | fred.mjs |
| `evaluateReverseRepo` | fred.mjs |

### `signals/housing.mjs` (~90 lines)
| Function | Importers |
|---|---|
| `evaluateHousingStarts` | fred.mjs |
| `evaluateMortgageRate` | fred.mjs |
| `evaluateCaseShiller` | **NONE (dead export)** |

### `signals/energy.mjs` (~150 lines)
| Function | Importers |
|---|---|
| `evaluateOilPrice` | **NONE (dead export)** |
| `evaluateElectricityDemandGrowth` | eia.mjs |
| `evaluateGenerationGap` | eia.mjs |
| `evaluateRegionalLoadSpike` | eia.mjs |

### `signals/market.mjs` (~170 lines)
| Function | Importers |
|---|---|
| `evaluatePutCallRatio` | cboe.mjs, fmp.mjs |
| `evaluateSkewIndex` | cboe.mjs |
| `evaluateVIXTermStructure` | cboe.mjs |
| `evaluateUnusualOptionsActivity` | fmp.mjs |

### `signals/biotech.mjs` (~80 lines)
| Function | Importers |
|---|---|
| `evaluateFDAApprovals` | fda.mjs |
| `evaluatePhase3Trials` | clinicaltrials.mjs |

### `signals/government.mjs` (~100 lines)
| Function | Importers |
|---|---|
| `evaluateLargeContract` | usaspending.mjs |
| `evaluateLargeOpportunity` | sam.mjs |
| `evaluateOpportunityCluster` | sam.mjs |

### `signals/cross-domain.mjs` (~120 lines)
| Function | Importers |
|---|---|
| `evaluateFEMASpike` | openfema.mjs |
| `evaluateCPIHousingDivergence` | **NONE (dead export)** |
| `evaluatePatentVelocity` | uspto.mjs |

## Importer Dependency Map

| Importer | utils | macro | housing | energy | market | biotech | gov | cross |
|---|---|---|---|---|---|---|---|---|
| fred.mjs | X | X | X | | | | | |
| cboe.mjs | X | | | | X | | | |
| fmp.mjs | X | | | | X | | | |
| eia.mjs | X | | | X | | | | |
| fda.mjs | X | | | | | X | | |
| clinicaltrials.mjs | X | | | | | X | | |
| openfema.mjs | X | | | | | | | X |
| usaspending.mjs | X | | | | | | X | |
| sam.mjs | X | | | | | | X | |
| uspto.mjs | X | | | | | | | X |
| dd-report.mjs | X | | | | | | | |
| dilution-monitor.mjs | X | | | | | | | |
| sec.mjs | X | | | | | | | |

## Implementation Steps

### Phase 1: Create base and utils (no importer changes)

1. `mkdir lib/signals/`
2. Create `lib/signals/base.mjs` — move `createSignal` + `Signal` typedef
3. Create `lib/signals/utils.mjs` — move `highestSeverity` + `formatSignalsSection`

### Phase 2: Create domain modules

Each imports `createSignal` from `./base.mjs`, exports domain functions.
Order: macro → housing → energy → market → biotech → government → cross-domain

### Phase 3: Barrel + thin redirect (zero-breakage cutover)

**Create `lib/signals/index.mjs`** — re-exports all 26 functions from domain modules.

**Replace `lib/signals.mjs`** with thin redirect:
```js
// DEPRECATED — import from './signals/index.mjs' directly.
// This shim exists only for backwards compatibility with 13 existing importers.
export * from './signals/index.mjs';
```

**Verify:** `node run.mjs system validate`

### Phase 4: Optional importer migration (non-blocking)

Update importers to use direct paths for smaller dependency trees.
Priority: eia, cboe, fda, clinicaltrials, sam, usaspending, openfema, uspto, fmp, fred (last — most complex).

### Phase 5: Dead export decision

Keep `evaluateCaseShiller`, `evaluateCPIHousingDivergence`, `evaluateOilPrice` — well-written definitions reserved for future pullers. Add `// TODO: no active importer` comment.

## Risks and Mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| Node resolves `signals.mjs` file vs `signals/` directory ambiguously | High | Thin redirect file at `signals.mjs` path; importers use `.mjs` extension explicitly |
| Circular dependency | Low | `utils.mjs` and `base.mjs` have zero imports from domain modules |
| Worktree stale copy | Low | Note in commit message |

## Testing Strategy

1. After Phase 3: run each puller family once (fred, cboe, eia, fda, sam)
2. `node run.mjs system validate`
3. `grep -r "from.*signals.mjs" scripts/` — should still show 13 importers (now via redirect)

## Success Criteria

- [ ] All 13 importers run without modification
- [ ] `lib/signals.mjs` is ≤5 lines (thin redirect)
- [ ] No module exceeds 400 lines
- [ ] `createSignal` stays internal to `signals/`
- [ ] `node run.mjs system validate` passes
