# 🎯 Skintwind Quick Reference

## TL;DR - Your Questions Answered

### 1. Should skintwind be a unified implementation that wraps/extends generic supply chain?

**YES!** Absolutely the right approach.

```
Generic (wodog) → Skincare Domain → Workerd Extension → Examples
src/core/       → src/skincare/   → ext/skintwind/  → ext/skincare-examples/
```

### 2. What skincare-specific components to add?

#### Essential Types (11 core types)

| Category | Types | Purpose |
|----------|-------|---------|
| **Actors** | `Salon`, `MedicalSpa`, `FormulationLab`, `IngredientSupplier`, `Therapist` | Skincare supply chain participants |
| **Products** | `Formulation`, `Ingredient`, `StabilityProfile` | Skincare product specifications |
| **Services** | `Procedure`, `TreatmentPackage`, `ProcedureStep` | Skincare treatments |
| **Enums** | `SkinType`, `FormulationType`, `IngredientCategory`, `ProcedureType` | Domain classifications |

#### Skincare-Specific Queries (15 methods)

```typescript
// Formulation queries
findFormulationsBySkinType(skinType)
findFormulationsByIngredient(ingredientId)
findFormulationsByBenefit(benefit)
findFormulationsByPriceRange(min, max)
calculateFormulationCost(formulationId)

// Salon queries
findSalonsBySpecialty(specialty)
findSalonsByLocation(lat, lon, radius)
findSalonsByCertification(cert)

// Procedure queries
findProceduresByType(type)
findProceduresByDuration(maxMinutes)
findProceduresBySkinType(skinType)

// Supply chain queries
findSuppliersByIngredient(ingredientId)
findFormulationLabsByCapability(capability)
optimizeSupplyChain(formulationId)
```

### 3. Create src/skincare/ that extends wodog?

**YES!** Recommended structure:

```
src/
├── core/              # Generic supply chain (wodog)
│   ├── actors.ts
│   ├── products.ts
│   ├── relationships.ts
│   └── lookup.ts
│
└── skincare/          # NEW: Skincare domain
    ├── types.ts       # Enums: SkinType, FormulationType, etc.
    ├── actors.ts      # Salon extends Actor
    ├── formulations.ts # Formulation extends Product
    ├── procedures.ts   # Procedure extends Service
    ├── queries.ts      # SkincareQueries class
    └── index.ts        # Exports
```

### 4. Minimal changes needed?

**3 Phases (3-4 weeks)**:

| Phase | What | Time | Files |
|-------|------|------|-------|
| **1. Domain Layer** | Create `src/skincare/` | 1 week | 6 files |
| **2. Build System** | TypeScript → JavaScript | 3-4 days | 2 files |
| **3. Unified Extension** | Refactor `ext/skintwind/` | 1 week | 7 files |

---

## Implementation Checklist

### Phase 1: Skincare Domain Layer (Week 1)

```bash
# Create directory
mkdir -p src/skincare

# Create files (in order)
touch src/skincare/types.ts           # ← START HERE
touch src/skincare/actors.ts
touch src/skincare/formulations.ts
touch src/skincare/procedures.ts
touch src/skincare/queries.ts
touch src/skincare/index.ts
```

**Files to create**:
- [ ] `src/skincare/types.ts` - Enums and basic types (4 enums)
- [ ] `src/skincare/actors.ts` - Salon, MedicalSpa, FormulationLab, IngredientSupplier (5 interfaces)
- [ ] `src/skincare/formulations.ts` - Formulation, Ingredient, StabilityProfile (8 interfaces)
- [ ] `src/skincare/procedures.ts` - Procedure, ProcedureStep, TreatmentPackage (3 interfaces)
- [ ] `src/skincare/queries.ts` - SkincareQueries class (15 methods)
- [ ] `src/skincare/index.ts` - Barrel exports

### Phase 2: Build System (Week 2)

```bash
# Create build directory
mkdir -p build

# Create config files
touch build/tsconfig.workerd.json
touch build/compile.sh
chmod +x build/compile.sh

# Update package.json
npm run build:workerd
```

**Files to create**:
- [ ] `build/tsconfig.workerd.json` - TypeScript config for ES modules
- [ ] `build/compile.sh` - Build script
- [ ] Update `package.json` scripts

### Phase 3: Unified Extension (Week 3)

```bash
# Refactor extension
mv ext/skincare-ext ext/skintwind

# Update imports
cd ext/skintwind
# Edit: skintwind-impl.js to import from dist/
```

**Files to update**:
- [ ] `ext/skintwind/skintwind.js` - Public API
- [ ] `ext/skintwind/skintwind-impl.js` - Use SkincareQueries
- [ ] `ext/skintwind/skintwind-binding.js` - Binding module
- [ ] `ext/skintwind/skintwind-worker.js` - Worker handler
- [ ] `ext/skintwind/*.capnp` - Cap'n Proto configs

---

## Core Types Reference

### Actors

```typescript
// Salon - Primary skincare service provider
interface Salon extends Actor {
  specialties: string[];      // ['facials', 'peels', 'massage']
  treatmentRooms: number;
  therapists: Therapist[];
  certifications: string[];   // ['ISO9001', 'organic_certified']
  dailyCapacity: number;
}

// FormulationLab - Produces skincare products
interface FormulationLab extends Actor {
  type: 'producer';
  capabilities: string[];     // ['emulsions', 'serums', 'anhydrous']
  minBatchSize: number;
  maxBatchSize: number;
  productionCapacity: number;
}

// IngredientSupplier - Supplies raw ingredients
interface IngredientSupplier extends Actor {
  type: 'supplier';
  ingredientTypes: string[];  // ['botanical', 'active', 'preservative']
  certifications: string[];
  moq: number;               // minimum order quantity
}
```

### Formulations

```typescript
// Formulation - Complete skincare product specification
interface Formulation extends Product {
  formulationType: FormulationType;  // 'serum', 'moisturizer', etc.
  ingredients: Ingredient[];
  skinTypes: SkinType[];            // ['dry', 'sensitive']
  benefits: string[];               // ['hydration', 'anti-aging']
  costBreakdown: CostBreakdown;
  recommendedRetailPrice: number;
  stability: StabilityProfile;
}

// Ingredient - Component of formulation
interface Ingredient {
  inciName: string;           // INCI standard name
  category: IngredientCategory;
  percentage: number;
  costPerKg: number;
  safetyRating: number;       // 1-10 scale
  compatibility: {
    goodWith: string[];       // Compatible ingredients
    avoidWith: string[];      // Incompatible ingredients
  };
}
```

### Procedures

```typescript
// Procedure - Skincare treatment/service
interface Procedure extends Service {
  procedureType: ProcedureType;  // 'facial', 'peel', etc.
  duration: number;              // minutes
  steps: ProcedureStep[];
  requiredProducts: string[];    // formulation IDs
  contraindications: string[];
  pricing: {
    basePrice: number;
    memberPrice?: number;
    seriesPrice?: number;        // package pricing
  };
}
```

---

## Enums Reference

### SkinType (8 values)
`'normal' | 'dry' | 'oily' | 'combination' | 'sensitive' | 'acne_prone' | 'mature' | 'all'`

### FormulationType (8 values)
`'cleanser' | 'toner' | 'serum' | 'moisturizer' | 'mask' | 'sunscreen' | 'eye_cream' | 'body_lotion'`

### IngredientCategory (11 values)
`'active' | 'humectant' | 'emollient' | 'emulsifier' | 'preservative' | 'fragrance' | 'colorant' | 'thickener' | 'pH_adjuster' | 'antioxidant' | 'botanical_extract'`

### ProcedureType (9 values)
`'facial' | 'peel' | 'microdermabrasion' | 'led_therapy' | 'massage' | 'body_treatment' | 'consultation' | 'laser' | 'injection'`

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 3: Workerd Extension (ext/skintwind/)                     │
│                                                                  │
│ • skintwind.js (Public API)                                     │
│ • skintwind-impl.js (Implementation using SkincareQueries)      │
│ • skintwind-worker.js (HTTP handler)                            │
│ • data/*.json (Actors, formulations, procedures)                │
│                                                                  │
│ Imports from: ../../dist/skincare/                              │
├─────────────────────────────────────────────────────────────────┤
│ LAYER 2: Skincare Domain (src/skincare/ → dist/skincare/)      │
│                                                                  │
│ • types.ts → types.js                                           │
│ • actors.ts → actors.js (Salon, MedicalSpa, FormulationLab)    │
│ • formulations.ts → formulations.js (Formulation, Ingredient)   │
│ • procedures.ts → procedures.js (Procedure)                     │
│ • queries.ts → queries.js (SkincareQueries class)               │
│                                                                  │
│ Extends: ../core/ (Actor, Product, Service)                     │
├─────────────────────────────────────────────────────────────────┤
│ LAYER 1: Generic Supply Chain (src/core/ - wodog)              │
│                                                                  │
│ • actors.ts (Actor, Supplier, Producer, Retailer)               │
│ • products.ts (Product, Service)                                │
│ • relationships.ts (Relationship, graph algorithms)             │
│ • lookup.ts (SupplyChainLookup, BFS/DFS)                        │
│                                                                  │
│ Exports: Generic types, reusable for any supply chain           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Code Examples

### How to Extend Generic Types

```typescript
// Generic (src/core/actors.ts)
export interface Actor {
  id: string;
  name: string;
  type: ActorType;
  capacities: Capacity[];
  pricingRules: PricingRule[];
}

// Skincare Extension (src/skincare/actors.ts)
import { Actor } from '../core/actors';

export interface Salon extends Actor {
  type: 'retailer';              // Specializes generic type
  subtype: 'salon';              // Adds skincare-specific field
  specialties: string[];         // Skincare-specific
  treatmentRooms: number;        // Skincare-specific
  therapists: Therapist[];       // Skincare-specific
  // Inherits: id, name, capacities, pricingRules from Actor
}
```

### How to Use in Workerd Extension

```javascript
// ext/skintwind/skintwind-impl.js

import { SkincareQueries } from "../../dist/skincare/queries.js";
import { SupplyChainLookup } from "../../dist/core/lookup.js";

export class Skintwind {
  constructor(actors, formulations, procedures, relationships) {
    // Initialize generic supply chain
    this.supplyChain = new SupplyChainLookup();
    
    // Initialize skincare layer
    this.skincare = new SkincareQueries(this.supplyChain);
    
    // Load data
    actors.forEach(a => this.supplyChain.addActor(a));
    formulations.forEach(f => this.skincare.addFormulation(f));
    procedures.forEach(p => this.skincare.addProcedure(p));
    relationships.forEach(r => this.supplyChain.addRelationship(r));
  }
  
  // Skincare-specific API
  async findSalonsBySpecialty(specialty) {
    return this.skincare.findSalonsBySpecialty(specialty);
  }
  
  async findFormulationsBySkinType(skinType) {
    return this.skincare.findFormulationsBySkinType(skinType);
  }
  
  // Generic supply chain API
  async findSupplyChainPath(fromId, toId) {
    return this.supplyChain.findSupplyChainPath(fromId, toId);
  }
}
```

---

## Data Schema Example

### Salon Data (JSON)

```json
{
  "id": "salon1",
  "name": "Luxe Day Spa",
  "type": "retailer",
  "subtype": "salon",
  "location": {
    "address": "123 Beauty Lane",
    "city": "Cape Town",
    "country": "South Africa"
  },
  "specialties": ["facials", "peels", "massage", "body_treatments"],
  "treatmentRooms": 8,
  "therapists": [
    {
      "id": "t1",
      "name": "Sarah Johnson",
      "certifications": ["CIDESCO", "ITEC"],
      "specialties": ["facials", "peels"],
      "experienceYears": 10,
      "availableHours": 35
    }
  ],
  "certifications": ["ISO9001", "organic_certified"],
  "dailyCapacity": 40,
  "hours": {
    "monday": { "open": "09:00", "close": "18:00" },
    "tuesday": { "open": "09:00", "close": "18:00" }
  },
  "priceRange": {
    "min": 50,
    "max": 500,
    "currency": "ZAR"
  }
}
```

### Formulation Data (JSON)

```json
{
  "id": "f1",
  "name": "Hydrating Day Cream",
  "sku": "HDC-001",
  "category": "finished_good",
  "formulationType": "moisturizer",
  "ingredients": [
    {
      "id": "i1",
      "inciName": "Aqua",
      "commonName": "Water",
      "category": "base",
      "percentage": 60.0,
      "function": ["vehicle"]
    },
    {
      "id": "i2",
      "inciName": "Sodium Hyaluronate",
      "commonName": "Hyaluronic Acid",
      "category": "humectant",
      "percentage": 2.0,
      "function": ["hydration", "anti-aging"],
      "costPerKg": 3500,
      "safetyRating": 1
    }
  ],
  "skinTypes": ["dry", "normal", "combination"],
  "benefits": ["hydration", "skin barrier repair", "anti-aging"],
  "contraindications": [],
  "costBreakdown": {
    "ingredients": 8.50,
    "packaging": 2.00,
    "labor": 1.50,
    "overhead": 2.00,
    "total": 14.00
  },
  "recommendedRetailPrice": 45.00,
  "marginPercentage": 68.9,
  "batchSize": 100,
  "shelfLife": 24,
  "stability": {
    "temperatureRange": { "min": 5, "max": 25 },
    "phRange": { "min": 5.0, "max": 6.5 },
    "lightSensitive": false,
    "airSensitive": false,
    "packaging": ["airless_pump", "jar"]
  }
}
```

---

## API Endpoints Reference

### Skincare-Specific Endpoints

```
GET  /skintwind/salons?specialty=facials
GET  /skintwind/salons?certification=ISO9001
GET  /skintwind/salons/:id

GET  /skintwind/formulations?skinType=dry
GET  /skintwind/formulations?benefit=anti-aging
GET  /skintwind/formulations?priceMin=0&priceMax=100
GET  /skintwind/formulations/:id

GET  /skintwind/procedures?type=facial
GET  /skintwind/procedures?maxDuration=60
GET  /skintwind/procedures/:id

GET  /skintwind/ingredients?category=active
GET  /skintwind/ingredients/:id

POST /skintwind/formulation/cost
     { "formulationId": "f1" }

POST /skintwind/formulation/validate
     { "formulation": { ... } }
```

### Generic Supply Chain Endpoints

```
GET  /skintwind/actors?type=supplier
GET  /skintwind/actors/:id

POST /skintwind/supply-chain/path
     { "fromId": "supplier1", "toId": "salon1" }

GET  /skintwind/relationships?fromId=supplier1
```

---

## Testing Reference

### Unit Test Structure

```typescript
// test/skincare/queries.test.ts

describe('SkincareQueries', () => {
  describe('findFormulationsBySkinType', () => {
    test('returns formulations for specified skin type');
    test('returns empty array when no matches');
    test('handles "all" skin type');
  });
  
  describe('findSalonsBySpecialty', () => {
    test('finds salons with matching specialty');
    test('case-insensitive matching');
  });
  
  describe('calculateFormulationCost', () => {
    test('sums ingredient costs correctly');
    test('includes packaging and labor');
    test('calculates margin percentage');
  });
});
```

### Integration Test Example

```typescript
// test/integration/skintwind.test.ts

describe('Skintwind Integration', () => {
  test('full supply chain query: supplier → lab → salon', async () => {
    const path = await skintwind.findSupplyChainPath(
      'supplier-botanical',
      'salon-luxe'
    );
    
    expect(path).toHaveLength(3);
    expect(path[0].type).toBe('supplier');
    expect(path[1].type).toBe('producer');
    expect(path[2].type).toBe('retailer');
  });
});
```

---

## Build Commands

```bash
# Development
npm install              # Install dependencies
npm run build            # Build TypeScript (src/ → lib/)
npm test                 # Run tests

# Workerd-specific
npm run build:workerd    # Compile for workerd (src/ → dist/)
npm run clean            # Remove dist/

# Examples
cd ext/skintwind
workerd serve skintwind-config.capnp

# Or with Cloudflare wrangler
wrangler dev
wrangler publish
```

---

## File Size Reference

| File | Lines | Purpose |
|------|-------|---------|
| `src/skincare/types.ts` | ~100 | Enums and basic types |
| `src/skincare/actors.ts` | ~150 | Salon, Lab, Supplier interfaces |
| `src/skincare/formulations.ts` | ~200 | Formulation and Ingredient |
| `src/skincare/procedures.ts` | ~150 | Procedure and TreatmentPackage |
| `src/skincare/queries.ts` | ~300 | SkincareQueries class |
| `src/skincare/index.ts` | ~20 | Barrel exports |
| **Total** | **~920** | **Complete domain layer** |

---

## Migration Impact

### What Changes

- ✅ New directory: `src/skincare/`
- ✅ New directory: `dist/` (generated)
- ✅ Refactor: `ext/skincare-ext/` → `ext/skintwind/`
- ✅ Update: Examples import from unified extension

### What Stays the Same

- ✅ Generic foundation: `src/core/` unchanged
- ✅ Examples: Data schemas mostly unchanged
- ✅ API contracts: Endpoint URLs unchanged
- ✅ Tests: Existing tests still pass

---

## Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Type Coverage | 100% | All skincare types in TypeScript |
| Test Coverage | >80% | `npm test -- --coverage` |
| Build Success | ✅ | `npm run build:workerd` succeeds |
| Examples Working | 5/5 | All examples respond to API calls |
| Documentation | Complete | All types documented |

---

## Resources

### Documentation
- **[Full Implementation Guide](SKINTWIND_IMPLEMENTATION_GUIDE.md)** - Detailed implementation
- **[Implementation Checklist](IMPLEMENTATION_CHECKLIST.md)** - Step-by-step tasks
- **[Architecture Overview](docs/ARCHITECTURE.md)** - System architecture
- **[Quick Start](docs/QUICK_START.md)** - 5-minute tutorial

### Code References
- **[Generic Supply Chain](src/core/)** - Wodog foundation
- **[Example: Supply Chain](ext/skincare-examples/05-supply-chain/)** - Complex example
- **[Existing Extension](ext/skincare-ext/)** - Current implementation

---

## Next Steps

1. **Read**: [SKINTWIND_IMPLEMENTATION_GUIDE.md](SKINTWIND_IMPLEMENTATION_GUIDE.md) for full details
2. **Start**: Create `src/skincare/types.ts` with enums
3. **Build**: Follow Phase 1 checklist
4. **Test**: Write unit tests as you go
5. **Deploy**: Test with simplest example first

---

**Questions?** Refer to [SKINTWIND_IMPLEMENTATION_GUIDE.md](SKINTWIND_IMPLEMENTATION_GUIDE.md) for comprehensive answers!
