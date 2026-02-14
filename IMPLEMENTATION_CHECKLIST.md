# Skintwind Implementation Checklist

This checklist guides you through implementing the complete skintwind system based on the analysis and architectural design.

## Overview

**Goal**: Transform skintwind from separate components into a unified three-layer system where the skincare domain builds on the generic supply chain foundation, all deployable to workerd.

**Timeline**: 3-4 weeks for complete implementation

---

## Phase 1: Skincare Domain Layer (Week 1)

### 1.1 Create Directory Structure

- [ ] Create `src/skincare/` directory
- [ ] Create `src/core/` directory (optional: reorganize existing src/)

```bash
mkdir -p src/skincare
mkdir -p src/core  # Optional: move existing files here
```

### 1.2 Define Skincare Actor Types

**File**: `src/skincare/actors.ts`

- [ ] Import base `Actor` interface from `../actors.ts`
- [ ] Define `Salon` interface extending `Actor`
  - [ ] Add `specialties: string[]`
  - [ ] Add `treatmentRooms: number`
  - [ ] Add `therapists: number`
  - [ ] Add `certifications: string[]`
  - [ ] Add `dailyCapacity: number`
  - [ ] Add `location: { city: string, state: string }`
- [ ] Define `MedSpa` interface extending `Actor`
  - [ ] Add `medicalStaff: { doctors: number, nurses: number }`
  - [ ] Add `deviceTypes: string[]`
  - [ ] Add `prescriptionCapable: boolean`
- [ ] Define `ProductionLab` interface extending `Actor`
  - [ ] Add `productionCapacity: Capacity`
  - [ ] Add `certifications: string[]`
  - [ ] Add `formulationTypes: string[]`
- [ ] Define `MobileTherapist` interface
- [ ] Define `Franchise` interface
- [ ] Export all types

**Expected Lines**: ~150-200

### 1.3 Define Formulation System

**File**: `src/skincare/formulations.ts`

- [ ] Define `Ingredient` interface
  - [ ] `name: string`
  - [ ] `percentage: number`
  - [ ] `supplier?: string`
  - [ ] `cost?: number`
- [ ] Define `Formulation` interface
  - [ ] `id: string`
  - [ ] `name: string`
  - [ ] `type: 'cleanser' | 'moisturizer' | 'serum' | 'mask' | 'treatment'`
  - [ ] `ingredients: Ingredient[]`
  - [ ] `skinTypes: string[]`
  - [ ] `cost: number`
  - [ ] `manufacturer?: string`
- [ ] Define `Product` interface (finished product)
  - [ ] Extends `Formulation`
  - [ ] Add `packaging: object`
  - [ ] Add `barcodeUPC?: string`
- [ ] Create helper function `calculateFormulationCost(ingredients: Ingredient[])`
- [ ] Export all types and functions

**Expected Lines**: ~100-150

### 1.4 Define Procedure System

**File**: `src/skincare/procedures.ts`

- [ ] Define `ProcedureStep` interface
  - [ ] `action: string`
  - [ ] `duration: number`
  - [ ] `productId?: string`
  - [ ] `equipmentRequired?: string[]`
- [ ] Define `Procedure` interface
  - [ ] `id: string`
  - [ ] `name: string`
  - [ ] `salonId: string`
  - [ ] `duration: number`
  - [ ] `steps: ProcedureStep[]`
  - [ ] `skinTypes: string[]`
  - [ ] `cost: number`
  - [ ] `contraindications?: string[]`
- [ ] Define `Treatment` interface (scheduled procedure)
  - [ ] `id: string`
  - [ ] `procedureId: string`
  - [ ] `clientId: string`
  - [ ] `salonId: string`
  - [ ] `date: string`
  - [ ] `therapistId: string`
- [ ] Create `calculateProcedureCost(procedure: Procedure, formulations: Formulation[])`
- [ ] Export all types and functions

**Expected Lines**: ~100-150

### 1.5 Define Skincare Queries

**File**: `src/skincare/queries.ts`

- [ ] Import `SupplyChainLookup` from `../lookup.ts`
- [ ] Create `SkincareLookup` class extending or wrapping `SupplyChainLookup`
- [ ] Add method `findSalonsBySpecialty(specialty: string)`
- [ ] Add method `findSalonsByCity(city: string)`
- [ ] Add method `findProceduresBySkinType(skinType: string)`
- [ ] Add method `findProceduresByDuration(min: number, max: number)`
- [ ] Add method `findFormulationsBySkinType(skinType: string)`
- [ ] Add method `findFormulationsByIngredient(ingredient: string)`
- [ ] Add method `findFormulationsByType(type: string)`
- [ ] Export `SkincareLookup` class

**Expected Lines**: ~200-300

### 1.6 Create Skincare Index

**File**: `src/skincare/index.ts`

- [ ] Export all types from `actors.ts`
- [ ] Export all types from `formulations.ts`
- [ ] Export all types from `procedures.ts`
- [ ] Export `SkincareLookup` from `queries.ts`
- [ ] Export helper functions

**Expected Lines**: ~50-100

### 1.7 Update Main Index

**File**: `src/index.ts`

- [ ] Add re-exports from `skincare/index.ts`
- [ ] Export as `export * as skincare from './skincare/index.js'`

### 1.8 Test Skincare Types

- [ ] Create `test/skincare/actors.test.ts`
- [ ] Create `test/skincare/formulations.test.ts`
- [ ] Create `test/skincare/procedures.test.ts`
- [ ] Create `test/skincare/queries.test.ts`
- [ ] Run `npm test` and ensure all pass

---

## Phase 2: Build System (Week 2)

### 2.1 Configure TypeScript for Workerd

**File**: `build/tsconfig.workerd.json`

- [ ] Set `"target": "ES2022"`
- [ ] Set `"module": "ES2022"`
- [ ] Set `"moduleResolution": "node"`
- [ ] Set `"outDir": "../dist"`
- [ ] Set `"rootDir": "../src"`
- [ ] Enable `"declaration": true`
- [ ] Enable `"declarationMap": true`
- [ ] Enable `"sourceMap": true`

### 2.2 Create Build Scripts

**File**: `build/compile.sh`

```bash
#!/bin/bash
set -e

echo "Building TypeScript for workerd..."

# Clean dist
rm -rf dist/

# Compile TypeScript
tsc --project build/tsconfig.workerd.json

echo "Build complete: dist/"
ls -lh dist/
```

- [ ] Create script
- [ ] Make executable: `chmod +x build/compile.sh`
- [ ] Test: `./build/compile.sh`

### 2.3 Update Package.json Scripts

**File**: `package.json`

- [ ] Add `"build:workerd": "tsc --project build/tsconfig.workerd.json"`
- [ ] Update `"build"` to run both normal and workerd builds
- [ ] Add `"clean": "rm -rf dist/"`

### 2.4 Test Compilation

- [ ] Run `npm run build:workerd`
- [ ] Verify `dist/` contains `.js` and `.d.ts` files
- [ ] Verify files are ES modules (use `import`/`export`)
- [ ] Test that files can be imported in Node.js

---

## Phase 3: Unified Skintwind Extension (Week 2)

### 3.1 Restructure Extension Directory

- [ ] Create `ext/skintwind/` directory
- [ ] Copy `ext/skincare-ext/*` to `ext/skintwind/`
- [ ] Rename files:
  - `skincare.capnp` → `skintwind.capnp`
  - `skincare-config.capnp` → `skintwind-config.capnp`
  - `skincare.js` → `skintwind.js`
  - `skincare-impl.js` → `skintwind-impl.js`
  - `skincare-binding.js` → `skintwind-binding.js`
  - `skincare-worker.js` → `skintwind-worker.js`

### 3.2 Update Cap'n Proto Extension Definition

**File**: `ext/skintwind/skintwind.capnp`

- [ ] Update extension name to `skintwind`
- [ ] Update module names:
  - `skintwind:skintwind` (public)
  - `skintwind-internal:impl` (internal)
  - `skintwind-internal:salon` (internal)
  - `skintwind-internal:formulations` (internal)
  - `skintwind-internal:procedures` (internal)
  - `skintwind:binding` (internal)
- [ ] Ensure internal modules have `internal = true`

### 3.3 Refactor Implementation to Use Dist

**File**: `ext/skintwind/skintwind-impl.js`

- [ ] Import from compiled dist: `import { Salon, SkincareLookup } from '../../dist/skincare/index.js'`
- [ ] Remove reimplemented logic
- [ ] Use `SkincareLookup` class instead of custom queries
- [ ] Keep class structure but delegate to imported functions

### 3.4 Update Helper Modules

**Files**: `salon.js`, `formulations.js`, `procedures.js`

For each file:
- [ ] Import types from `../../dist/skincare/`
- [ ] Remove reimplemented logic
- [ ] Use helper functions from dist
- [ ] Keep only workerd-specific wrappers if needed

### 3.5 Update Worker

**File**: `ext/skintwind/skintwind-worker.js`

- [ ] Import from public module: `import { SkincareBrand } from 'skintwind:skintwind'`
- [ ] Use `env.skintwind` binding
- [ ] Update API endpoints to match new structure
- [ ] Add comprehensive documentation endpoint

### 3.6 Consolidate Data Files

- [ ] Create `ext/skintwind/data/` directory
- [ ] Move all JSON files to `data/`
- [ ] Create `data/schema.json` with JSON schema definitions
- [ ] Ensure consistent structure across all data files

### 3.7 Test Extension

- [ ] Update `skintwind-config.capnp` to use new paths
- [ ] Test compilation: workerd loads extension successfully
- [ ] Test API endpoints work as expected
- [ ] Verify internal modules are not accessible

---

## Phase 4: Refactor Examples (Week 3)

### 4.1 Update Example 1: Mobile Therapist

**Directory**: `ext/skincare-examples/01-mobile-therapist/`

- [ ] Update `config.capnp` to import from `skintwind.capnp`
- [ ] Update bindings to use `skintwind:binding`
- [ ] Remove local implementation files (keep only data)
- [ ] Keep only: `config.capnp`, `data/`, `README.md`
- [ ] Update README to reflect new structure
- [ ] Test: Run with workerd and verify API works

### 4.2 Update Example 2: Small Salon

**Directory**: `ext/skincare-examples/02-small-salon/`

- [ ] Same process as Example 1
- [ ] Ensure formulations data works with unified extension
- [ ] Update README

### 4.3 Update Example 3: Mediclinic

**Directory**: `ext/skincare-examples/03-mediclinic/`

- [ ] Same process as Examples 1-2
- [ ] Ensure medical-specific data works
- [ ] Update README

### 4.4 Update Example 4: Franchise

**Directory**: `ext/skincare-examples/04-franchise/`

- [ ] Update to use unified extension
- [ ] Ensure relationship data works
- [ ] Test multi-actor queries
- [ ] Update README

### 4.5 Update Example 5: Supply Chain

**Directory**: `ext/skincare-examples/05-supply-chain/`

- [ ] Update to use unified extension
- [ ] Ensure BFS/DFS path-finding works
- [ ] Test complex queries
- [ ] Update README

### 4.6 Update Examples README

**File**: `ext/skincare-examples/README.md`

- [ ] Update to reflect unified extension pattern
- [ ] Add notes about data-only examples
- [ ] Update API endpoint documentation

---

## Phase 5: Documentation (Week 3-4)

### 5.1 API Documentation

- [ ] Create `docs/api/` directory
- [ ] Create `docs/api/wodog-core.md` - Core supply chain API
- [ ] Create `docs/api/wodog-skincare.md` - Skincare domain API
- [ ] Create `docs/api/skintwind-extension.md` - Extension API
- [ ] Document all public interfaces, types, methods

### 5.2 Tutorial Series

- [ ] Create `docs/tutorials/` directory
- [ ] Create `docs/tutorials/01-getting-started.md`
- [ ] Create `docs/tutorials/02-mobile-therapist.md`
- [ ] Create `docs/tutorials/03-small-salon.md`
- [ ] Create `docs/tutorials/04-mediclinic.md`
- [ ] Create `docs/tutorials/05-franchise.md`
- [ ] Create `docs/tutorials/06-supply-chain.md`

### 5.3 Deployment Guides

- [ ] Create `docs/guides/` directory
- [ ] Create `docs/guides/deployment.md` - Cloudflare Workers deployment
- [ ] Create `docs/guides/customization.md` - Customizing for your business
- [ ] Create `docs/guides/data-modeling.md` - Creating data files
- [ ] Create `docs/guides/extension-development.md` - Building new extensions

### 5.4 Update Main Documentation

- [ ] Verify `README.md` is current
- [ ] Verify `docs/ARCHITECTURE.md` is current
- [ ] Verify `docs/QUICK_START.md` is current
- [ ] Add links between all documentation files

---

## Phase 6: Testing (Week 4)

### 6.1 Unit Tests for Skincare

- [ ] Test all skincare actor types
- [ ] Test formulation calculations
- [ ] Test procedure cost calculations
- [ ] Test skincare queries
- [ ] Achieve >80% code coverage

### 6.2 Integration Tests

- [ ] Test TypeScript → JavaScript compilation
- [ ] Test workerd can load extensions
- [ ] Test bindings work correctly
- [ ] Test internal modules are hidden
- [ ] Test API endpoints return correct data

### 6.3 End-to-End Tests

- [ ] Test each example runs successfully
- [ ] Test queries work across all examples
- [ ] Test path-finding in supply chain example
- [ ] Test error handling

### 6.4 Update Test Infrastructure

- [ ] Update `package.json` test scripts
- [ ] Add test coverage reporting
- [ ] Add CI/CD configuration (optional)

---

## Phase 7: Polish and Release (Week 4)

### 7.1 Code Quality

- [ ] Run linter and fix issues
- [ ] Add JSDoc comments to all public APIs
- [ ] Ensure consistent code style
- [ ] Remove dead code and console.logs

### 7.2 Performance

- [ ] Profile path-finding algorithms
- [ ] Optimize query performance
- [ ] Test with large datasets (100+ actors)
- [ ] Document performance characteristics

### 7.3 Security Review

- [ ] Verify internal modules are truly hidden
- [ ] Test capability-based security model
- [ ] Review input validation
- [ ] Document security model

### 7.4 Final Documentation Review

- [ ] Proofread all documentation
- [ ] Verify all code examples work
- [ ] Check all links are valid
- [ ] Add contributing guidelines

### 7.5 Package for Release

- [ ] Update `package.json` version
- [ ] Create changelog
- [ ] Tag release in git
- [ ] Publish to NPM (if applicable)

---

## Validation Checklist

After completing all phases, verify:

- [ ] ✅ `npm run build` completes successfully
- [ ] ✅ `npm run build:workerd` compiles TypeScript to dist/
- [ ] ✅ `npm test` passes all tests
- [ ] ✅ All 5 examples run with workerd
- [ ] ✅ API endpoints work for all examples
- [ ] ✅ Path-finding works in supply chain example
- [ ] ✅ Internal modules are not accessible from worker code
- [ ] ✅ Documentation is complete and accurate
- [ ] ✅ TypeScript types are exported correctly
- [ ] ✅ Examples use unified extension (no code duplication)

---

## Success Criteria

The implementation is complete when:

1. **Type Safety**: ✅ TypeScript types exist for all skincare domain models
2. **Compilation**: ✅ TypeScript compiles to ES modules usable by workerd
3. **Integration**: ✅ Workerd extensions import from compiled dist/
4. **Unified Extension**: ✅ Single skintwind extension used by all examples
5. **Data-Driven**: ✅ Examples provide only data, not implementation
6. **Tested**: ✅ Good test coverage (>80%) for core and skincare
7. **Documented**: ✅ Complete documentation with tutorials and API reference
8. **Working Examples**: ✅ All 5 examples run and demonstrate features
9. **Performant**: ✅ Path-finding and queries perform well
10. **Secure**: ✅ Capability-based security model enforced

---

## Troubleshooting Common Issues

### Issue: TypeScript compilation errors

**Solution**: 
- Check `tsconfig.json` settings
- Ensure all imports use `.js` extension
- Verify ES module syntax

### Issue: Workerd can't load extension

**Solution**:
- Check `.capnp` file syntax
- Verify module names match exactly
- Ensure `internal = true` for internal modules

### Issue: Import from dist/ fails

**Solution**:
- Verify dist/ directory structure
- Check file paths are correct
- Use relative imports: `../../dist/skincare/`

### Issue: Path-finding returns null

**Solution**:
- Check relationship data exists
- Verify actor IDs match
- Test with smaller dataset first

---

## Resources

- **Main Documentation**: See `docs/` directory
- **Architecture**: `docs/ARCHITECTURE.md`
- **Implementation Plan**: `SKINTWIND_IMPLEMENTATION_PLAN.md`
- **Analysis**: `ANALYSIS_SUMMARY.md`
- **Examples**: `ext/skincare-examples/*/README.md`

---

## Quick Reference: File Organization

```
skintwind/
├── src/
│   ├── core/              # Generic supply chain (optional reorganization)
│   │   ├── actors.ts
│   │   ├── relationships.ts
│   │   ├── products.ts
│   │   ├── config.ts
│   │   ├── lookup.ts
│   │   └── index.ts
│   │
│   └── skincare/          # NEW: Skincare domain
│       ├── actors.ts      # Salon, MedSpa, Lab types
│       ├── formulations.ts # Formulation, Ingredient types
│       ├── procedures.ts   # Procedure, Treatment types
│       ├── queries.ts      # SkincareLookup class
│       └── index.ts        # Exports
│
├── dist/                  # Compiled JavaScript (generated)
│   ├── core/
│   └── skincare/
│
├── ext/
│   ├── skintwind/         # NEW: Unified extension
│   │   ├── skintwind.capnp
│   │   ├── skintwind-config.capnp
│   │   ├── skintwind.js
│   │   ├── skintwind-impl.js (imports from dist/)
│   │   ├── skintwind-binding.js
│   │   ├── skintwind-worker.js
│   │   └── data/
│   │       ├── schema.json
│   │       ├── salons.json
│   │       ├── formulations.json
│   │       └── procedures.json
│   │
│   └── skincare-examples/  # REFACTORED: Data-only examples
│       ├── 01-mobile-therapist/
│       │   ├── config.capnp (uses skintwind extension)
│       │   ├── data/ (JSON only)
│       │   └── README.md
│       └── ... (same pattern for all examples)
│
├── build/                 # NEW: Build configuration
│   ├── tsconfig.workerd.json
│   └── compile.sh
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── QUICK_START.md
│   ├── api/              # NEW: API documentation
│   ├── tutorials/        # NEW: Tutorial series
│   └── guides/           # NEW: Deployment and customization guides
│
└── test/
    ├── core/             # Core tests
    └── skincare/         # NEW: Skincare tests
```

---

## Time Estimates

- **Phase 1**: 2-3 days (skincare domain layer)
- **Phase 2**: 1 day (build system)
- **Phase 3**: 2-3 days (unified extension)
- **Phase 4**: 2-3 days (refactor examples)
- **Phase 5**: 3-4 days (documentation)
- **Phase 6**: 2-3 days (testing)
- **Phase 7**: 1-2 days (polish)

**Total**: 13-19 days (2.5-4 weeks)

---

## Getting Started

1. **Read the analysis**: Review `ANALYSIS_SUMMARY.md`
2. **Understand the architecture**: Read `docs/ARCHITECTURE.md`
3. **Start Phase 1**: Create `src/skincare/` and define types
4. **Commit frequently**: Small, focused commits
5. **Test as you go**: Run tests after each phase
6. **Document as you build**: Update docs with implementation

Good luck! 🚀
