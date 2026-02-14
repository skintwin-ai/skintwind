# 🎨 Skintwind Visual Implementation Guide

## 📊 Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SKINTWIND SYSTEM                                 │
│                  (Skincare-Specific Application)                         │
└─────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────┐
                              │  HTTP API   │
                              │  Requests   │
                              └──────┬──────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  LAYER 3: Workerd Extension (ext/skintwind/)                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐            │
│   │ skintwind.js │───▶│ skintwind-   │───▶│ skintwind-   │            │
│   │ (Public API) │    │ impl.js      │    │ worker.js    │            │
│   │              │    │ (Business)   │    │ (HTTP)       │            │
│   └──────────────┘    └──────┬───────┘    └──────────────┘            │
│                              │                                          │
│                              │ uses compiled JS                         │
│                              ▼                                          │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              │ import { SkincareQueries }
                              │ from "../../dist/skincare/queries.js"
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  LAYER 2: Skincare Domain (src/skincare/ → dist/skincare/)             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   TypeScript Source           Build           JavaScript Output         │
│   ┌────────────────┐         ┌───┐          ┌────────────────┐        │
│   │ types.ts       │────────▶│tsc│─────────▶│ types.js       │        │
│   │ actors.ts      │         └───┘          │ actors.js      │        │
│   │ formulations.ts│                        │ formulations.js│        │
│   │ procedures.ts  │                        │ procedures.js  │        │
│   │ queries.ts     │                        │ queries.js     │        │
│   └────────────────┘                        └────────────────┘        │
│          │                                           │                  │
│          │ extends base types                       │                  │
│          ▼                                           ▼                  │
└─────────────────────────────────────────────────────────────────────────┘
           │                                           │
           │ import { Actor, Product, Service }       │
           ▼                                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  LAYER 1: Generic Supply Chain (src/core/ - wodog)                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌────────────────┐   ┌────────────────┐   ┌────────────────┐        │
│   │ actors.ts      │   │ products.ts    │   │ relationships.ts│        │
│   │ (Actor types)  │   │ (Product,      │   │ (Graph         │        │
│   │                │   │  Service)      │   │  algorithms)   │        │
│   └────────────────┘   └────────────────┘   └────────────────┘        │
│                                                                          │
│   ┌────────────────┐   ┌────────────────┐                              │
│   │ lookup.ts      │   │ config.ts      │                              │
│   │ (Query engine, │   │ (Configuration)│                              │
│   │  BFS/DFS)      │   │                │                              │
│   └────────────────┘   └────────────────┘                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow: Request to Response

```
┌──────────┐
│  Client  │  GET /skintwind/salons?specialty=facials
└────┬─────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. HTTP Worker (skintwind-worker.js)                        │
│    • Parse request                                          │
│    • Extract query params: specialty = "facials"            │
│    • Route to handler                                       │
└────┬────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Implementation (skintwind-impl.js)                       │
│    • Call: skintwind.findSalonsBySpecialty("facials")       │
└────┬────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. SkincareQueries (dist/skincare/queries.js)               │
│    • Filter actors by type: 'retailer'                      │
│    • Filter by subtype: 'salon'                             │
│    • Filter by specialty: 'facials'                         │
│    • Delegate to SupplyChainLookup for base query           │
└────┬────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. SupplyChainLookup (dist/core/lookup.js)                  │
│    • Generic actor query                                    │
│    • Apply filters                                          │
│    • Return paginated results                               │
└────┬────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Data Storage (JSON files / KV namespace)                 │
│    • Load actor data                                        │
│    • Return matching salons                                 │
└────┬────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────┐
│  Client  │  JSON: [{ id: "salon1", specialties: ["facials"], ... }]
└──────────┘
```

---

## 🧩 Type Extension Pattern

```
┌─────────────────────────────────────────────────────────────┐
│  GENERIC TYPE (Layer 1: src/core/actors.ts)                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  export interface Actor {                                   │
│    id: string;                   ◄─── Core identity         │
│    name: string;                                            │
│    type: ActorType;                                         │
│    location: Location;           ◄─── Common properties     │
│    capacities: Capacity[];                                  │
│    pricingRules: PricingRule[];                             │
│  }                                                           │
│                                                              │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               │ extends
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  SKINCARE EXTENSION (Layer 2: src/skincare/actors.ts)       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  import { Actor } from '../core/actors';                    │
│                                                              │
│  export interface Salon extends Actor {                     │
│    type: 'retailer';            ◄─── Specialize             │
│    subtype: 'salon';            ◄─── NEW: Domain tag        │
│    specialties: string[];       ◄─── NEW: Skincare-specific │
│    treatmentRooms: number;      ◄─── NEW: Skincare-specific │
│    therapists: Therapist[];     ◄─── NEW: Skincare-specific │
│    certifications: string[];    ◄─── NEW: Skincare-specific │
│    dailyCapacity: number;       ◄─── NEW: Skincare-specific │
│                                                              │
│    // INHERITS from Actor:                                  │
│    // • id, name, location                                  │
│    // • capacities, pricingRules                            │
│  }                                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 File Structure: Before & After

### BEFORE (Current)

```
skintwind/
├── src/                        # Generic supply chain
│   ├── actors.ts
│   ├── products.ts
│   ├── relationships.ts
│   ├── lookup.ts
│   └── index.ts
│
└── ext/
    ├── skincare-ext/           # Standalone extension
    │   ├── skincare.js
    │   ├── skincare-impl.js
    │   └── data/*.json
    │
    └── skincare-examples/      # 5 examples with duplicate logic
        ├── 01-mobile-therapist/
        ├── 02-small-salon/
        ├── 03-mediclinic/
        ├── 04-franchise/
        └── 05-supply-chain/
```

### AFTER (Target)

```
skintwind/
├── src/
│   ├── core/                   # Generic supply chain (renamed)
│   │   ├── actors.ts
│   │   ├── products.ts
│   │   ├── relationships.ts
│   │   ├── lookup.ts
│   │   └── index.ts
│   │
│   └── skincare/               # ✨ NEW: Skincare domain
│       ├── types.ts            # Enums: SkinType, FormulationType, etc.
│       ├── actors.ts           # Salon, MedicalSpa, FormulationLab
│       ├── formulations.ts     # Formulation, Ingredient
│       ├── procedures.ts       # Procedure, TreatmentPackage
│       ├── queries.ts          # SkincareQueries class
│       └── index.ts            # Exports
│
├── dist/                       # ✨ NEW: Compiled JavaScript
│   ├── core/                   # Compiled generic supply chain
│   └── skincare/               # Compiled skincare domain
│
└── ext/
    ├── skintwind/              # ✨ REFACTORED: Unified extension
    │   ├── skintwind.js
    │   ├── skintwind-impl.js   # Uses SkincareQueries
    │   ├── skintwind-worker.js
    │   └── data/*.json
    │
    └── skincare-examples/      # ✨ REFACTORED: Data-only
        ├── 01-mobile-therapist/
        │   ├── config.capnp    # Imports skintwind extension
        │   └── data/           # Data only
        └── ...
```

---

## 🎯 Implementation Phases (Visual)

```
┌──────────────────────────────────────────────────────────────┐
│  PHASE 1: Skincare Domain Layer (Week 1)                     │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Create: src/skincare/                                       │
│  ├── types.ts          ✅ STARTER PROVIDED                   │
│  ├── actors.ts         ⏳ To create (200 lines)              │
│  ├── formulations.ts   ⏳ To create (250 lines)              │
│  ├── procedures.ts     ⏳ To create (150 lines)              │
│  ├── queries.ts        ⏳ To create (400 lines)              │
│  └── index.ts          ⏳ To create (20 lines)               │
│                                                               │
│  Output: TypeScript types for skincare domain                │
│  Tests: Unit tests for each file (>80% coverage)             │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  PHASE 2: Build System (Week 2)                              │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Create: build/                                              │
│  ├── tsconfig.workerd.json   ⏳ TS config for ES modules     │
│  └── compile.sh              ⏳ Build script                 │
│                                                               │
│  Update: package.json                                        │
│  └── "build:workerd": "tsc --project build/tsconfig..."      │
│                                                               │
│  Output: dist/skincare/*.js (compiled JavaScript)            │
│  Tests: Verify compilation, check imports                    │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  PHASE 3: Unified Extension (Week 3)                         │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Refactor: ext/skintwind/                                    │
│  ├── skintwind-impl.js        Update imports                 │
│  │   OLD: local implementation                               │
│  │   NEW: import from "../../dist/skincare/queries.js"       │
│  │                                                            │
│  ├── skintwind-worker.js      Add API endpoints              │
│  └── *.capnp                  Update configuration           │
│                                                               │
│  Output: Working unified extension                           │
│  Tests: Integration tests, API tests                         │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 📋 Checklist: Phase 1 (Week 1)

### Day 1-2: Foundation

```
☐ Create src/skincare/ directory
☐ Copy SKINTWIND_STARTER_TYPES.ts → src/skincare/types.ts
☐ Review enums: SkinType, FormulationType, IngredientCategory, ProcedureType
☐ Test compilation: tsc src/skincare/types.ts

☐ Create src/skincare/actors.ts
  ☐ Import Actor from '../core/actors'
  ☐ Define Therapist interface (50 lines)
  ☐ Define Salon interface (80 lines)
  ☐ Define MedicalSpa interface (30 lines)
  ☐ Define FormulationLab interface (40 lines)
  ☐ Define IngredientSupplier interface (40 lines)
  ☐ Add JSDoc comments
  ☐ Test compilation
```

### Day 3-4: Products & Services

```
☐ Create src/skincare/formulations.ts
  ☐ Import Product from '../core/products'
  ☐ Define Ingredient interface (70 lines)
  ☐ Define StabilityProfile interface (40 lines)
  ☐ Define CostBreakdown interface (30 lines)
  ☐ Define RegulatoryStatus interface (30 lines)
  ☐ Define Formulation interface (80 lines)
  ☐ Add JSDoc comments
  ☐ Test compilation

☐ Create src/skincare/procedures.ts
  ☐ Import Service from '../core/products'
  ☐ Define ProcedureStep interface (40 lines)
  ☐ Define Procedure interface (80 lines)
  ☐ Define TreatmentPackage interface (30 lines)
  ☐ Add JSDoc comments
  ☐ Test compilation
```

### Day 5: Queries & Tests

```
☐ Create src/skincare/queries.ts
  ☐ Import SupplyChainLookup from '../core/lookup'
  ☐ Define SkincareQueries class
    ☐ Formulation queries (6 methods)
    ☐ Salon queries (4 methods)
    ☐ Procedure queries (3 methods)
    ☐ Supply chain queries (2 methods)
  ☐ Add JSDoc comments
  ☐ Test compilation

☐ Create src/skincare/index.ts
  ☐ Export all types
  ☐ Export all interfaces
  ☐ Export SkincareQueries class

☐ Write unit tests
  ☐ test/skincare/types.test.ts
  ☐ test/skincare/actors.test.ts
  ☐ test/skincare/formulations.test.ts
  ☐ test/skincare/procedures.test.ts
  ☐ test/skincare/queries.test.ts
  ☐ Run: npm test
  ☐ Target: >80% coverage
```

---

## 🎨 Color-Coded Complexity

```
┌────────────────────────────────────────────────────────┐
│  FILE COMPLEXITY GUIDE                                  │
├────────────────────────────────────────────────────────┤
│                                                         │
│  🟢 EASY    types.ts (✅ starter provided)             │
│            • Just enums and basic types                │
│            • No logic required                         │
│                                                         │
│  🟡 MEDIUM  actors.ts, formulations.ts, procedures.ts  │
│            • Interface definitions                     │
│            • Extend base types                         │
│            • Some complexity in nested structures      │
│                                                         │
│  🔴 HARD    queries.ts                                 │
│            • Business logic                            │
│            • 15 query methods                          │
│            • Interact with multiple types              │
│                                                         │
└────────────────────────────────────────────────────────┘
```

---

## 📊 Progress Tracker

Copy this to track your progress:

```
PHASE 1: Skincare Domain Layer
[✅] types.ts (starter provided)
[ ] actors.ts (200 lines)
[ ] formulations.ts (250 lines)
[ ] procedures.ts (150 lines)
[ ] queries.ts (400 lines)
[ ] index.ts (20 lines)
[ ] Unit tests (5 files)

PHASE 2: Build System
[ ] build/tsconfig.workerd.json
[ ] build/compile.sh
[ ] Update package.json
[ ] Test compilation

PHASE 3: Unified Extension
[ ] Refactor skintwind-impl.js
[ ] Update imports
[ ] Add API endpoints
[ ] Integration tests

PHASE 4: Refactor Examples (Optional)
[ ] 01-mobile-therapist
[ ] 02-small-salon
[ ] 03-mediclinic
[ ] 04-franchise
[ ] 05-supply-chain
```

---

## 🎯 Quick Start Command

```bash
# One-liner to get started
mkdir -p src/skincare && \
  cp SKINTWIND_STARTER_TYPES.ts src/skincare/types.ts && \
  touch src/skincare/actors.ts \
        src/skincare/formulations.ts \
        src/skincare/procedures.ts \
        src/skincare/queries.ts \
        src/skincare/index.ts && \
  echo "✅ Skincare domain structure created! Start coding!"
```

---

## 📚 Documentation Map

```
Start Here
    │
    ├─▶ IMPLEMENTATION_READY.md      (You are here!)
    │
    ├─▶ SKINTWIND_ANSWERS.md         Direct answers
    │   └─▶ SKINTWIND_QUICK_REFERENCE.md   Quick lookups
    │       └─▶ SKINTWIND_IMPLEMENTATION_GUIDE.md   Detailed steps
    │
    └─▶ SKINTWIND_ARCHITECTURE.md    Design decisions
        └─▶ SKINTWIND_STARTER_TYPES.ts   Starter code
```

---

**Ready to code? Start with Phase 1, Day 1! 🚀**

Copy `SKINTWIND_STARTER_TYPES.ts` to `src/skincare/types.ts` and begin!
