# 🧴 Skintwind Implementation Guide: Skincare-Specific Application

## Executive Summary

**Objective**: Implement `skintwind` as a specialized application of workerd for the skincare supply chain by creating a unified skincare-specific layer that extends the generic `wodog` supply chain foundation.

**Current State**:
- ✅ Generic supply chain (wodog) in `src/` - **production ready**
- ✅ 5 progressive skincare examples in `ext/skincare-examples/` - **complete**
- ✅ Standalone skincare extension in `ext/skincare-ext/` - **working prototype**
- ⚠️ **Gap**: No unified TypeScript skincare domain layer
- ⚠️ **Gap**: Examples duplicate logic instead of sharing code

**Target State**:
- ✅ Generic foundation (`src/core/` - wodog)
- ✅ Skincare domain layer (`src/skincare/` - **NEW**)
- ✅ Compiled JavaScript (`dist/` - **NEW**)
- ✅ Unified extension (`ext/skintwind/` - **REFACTORED**)
- ✅ Data-driven examples (`ext/skincare-examples/` - **REFACTORED**)

---

## Architecture: 3-Layer Design

```
┌─────────────────────────────────────────────────────────────────┐
│ Layer 3: Skintwind Application (ext/skintwind/)                 │
│ • Unified skincare extension for workerd                        │
│ • Public API: Salons, Formulations, Procedures, Ingredients    │
│ • REST endpoints for skincare-specific queries                  │
│ • Imports from dist/skincare/ (compiled JS)                     │
├─────────────────────────────────────────────────────────────────┤
│ Layer 2: Skincare Domain (src/skincare/ → dist/skincare/)      │
│ • TypeScript types: Salon, Formulation, Procedure, Ingredient  │
│ • Extends generic Actor, Product, Service from wodog           │
│ • Business logic: cost calculation, compatibility, inventory   │
│ • Queries: find by skin type, specialty, ingredient, price     │
├─────────────────────────────────────────────────────────────────┤
│ Layer 1: Generic Supply Chain (src/core/ - wodog)              │
│ • Actor types: Supplier, Producer, Distributor, Retailer       │
│ • Relationships: Graph algorithms (BFS/DFS), path-finding      │
│ • Products: Raw materials, intermediate, finished goods        │
│ • Lookup: Query engine with pagination                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Answer to Your Questions

### 1. Should skintwind be a unified implementation that wraps/extends generic supply chain?

**YES - Absolutely!** This is the correct architecture pattern:

**Rationale**:
- ✅ **Separation of concerns**: Generic supply chain logic remains reusable
- ✅ **Type safety**: TypeScript skincare types extend generic types
- ✅ **Code reuse**: Examples share skincare logic instead of duplicating
- ✅ **Maintainability**: Changes to skincare domain don't affect generic layer
- ✅ **Scalability**: Easy to add other domains (food, pharma, retail)

**Pattern**:
```typescript
// Generic foundation (wodog)
export interface Actor { id, name, type, ... }
export interface Product { id, name, category, ... }

// Skincare specialization (extends)
export interface Salon extends Actor {
  specialties: string[];
  treatmentRooms: number;
  therapists: Therapist[];
  certifications: string[];
}

export interface Formulation extends Product {
  ingredients: Ingredient[];
  skinTypes: SkinType[];
  benefits: string[];
  stability: StabilityProfile;
}
```

### 2. What skincare-specific types, actors, products, and services should be added?

Based on analysis of the existing examples and the SKIN-TWIN agent persona, here are the **essential skincare-specific components**:

#### **A. Skincare Actors** (extend generic Actor)

```typescript
// Skincare-specific actor types
export interface Salon extends Actor {
  type: 'salon';
  specialties: string[];          // 'facials', 'peels', 'massage', 'body_treatments'
  treatmentRooms: number;
  therapists: Therapist[];
  certifications: string[];        // ISO, medical, organic
  dailyCapacity: number;
  hours: BusinessHours;
  priceRange: PriceRange;
}

export interface MedicalSpa extends Salon {
  type: 'medspa';
  medicalDirector: string;
  medicalLicense: string;
  insuranceAccepted: boolean;
  medicalProcedures: string[];     // 'laser', 'injections', 'peels'
}

export interface FormulationLab extends Actor {
  type: 'producer';
  subtype: 'formulation_lab';
  capabilities: string[];           // 'emulsions', 'serums', 'anhydrous'
  certifications: string[];         // 'GMP', 'ISO22716', 'organic_certified'
  minBatchSize: number;
  maxBatchSize: number;
  productionCapacity: number;       // units per month
}

export interface IngredientSupplier extends Actor {
  type: 'supplier';
  subtype: 'ingredient_supplier';
  ingredientTypes: IngredientCategory[];
  certifications: string[];         // 'organic', 'ecocert', 'cosmos'
  regions: string[];                // geographic coverage
  moq: number;                      // minimum order quantity
}

export interface Therapist {
  id: string;
  name: string;
  certifications: string[];
  specialties: string[];
  experienceYears: number;
  availableHours: number;           // hours per week
}
```

#### **B. Skincare Products & Formulations**

```typescript
export type FormulationType = 
  | 'cleanser' 
  | 'toner' 
  | 'serum' 
  | 'moisturizer' 
  | 'mask' 
  | 'sunscreen'
  | 'eye_cream'
  | 'body_lotion';

export type SkinType = 
  | 'normal' 
  | 'dry' 
  | 'oily' 
  | 'combination' 
  | 'sensitive' 
  | 'acne_prone'
  | 'mature'
  | 'all';

export type IngredientCategory =
  | 'active'              // retinol, vitamin C, niacinamide
  | 'humectant'           // hyaluronic acid, glycerin
  | 'emollient'           // oils, butters, squalane
  | 'emulsifier'          // lecithin, cetearyl alcohol
  | 'preservative'        // phenoxyethanol, parabens
  | 'fragrance'           // essential oils, synthetic
  | 'colorant'
  | 'thickener'
  | 'pH_adjuster'
  | 'antioxidant'
  | 'botanical_extract';

export interface Ingredient {
  id: string;
  inciName: string;             // International Nomenclature Cosmetic Ingredient
  commonName: string;
  category: IngredientCategory;
  function: string[];            // ['hydrating', 'anti-aging', 'soothing']
  percentage: number;            // % in formulation
  supplier?: string;             // supplier actor ID
  costPerKg: number;
  safetyRating: number;          // 1-10 (EWG scale)
  restrictions?: string[];       // EU banned, pregnancy warning, etc.
  compatibility: {
    goodWith: string[];          // ingredient IDs
    avoidWith: string[];         // ingredient IDs
  };
}

export interface Formulation extends Product {
  category: 'finished_good';
  formulationType: FormulationType;
  ingredients: Ingredient[];
  skinTypes: SkinType[];
  benefits: string[];            // 'hydration', 'anti-aging', 'brightening'
  contraindications: string[];   // 'pregnancy', 'sensitive_skin'
  
  // Cost & Pricing
  costBreakdown: {
    ingredients: number;
    packaging: number;
    labor: number;
    overhead: number;
    total: number;
  };
  recommendedRetailPrice: number;
  marginPercentage: number;
  
  // Manufacturing
  batchSize: number;             // units
  shelfLife: number;             // months
  stability: StabilityProfile;
  manufacturingSteps: string[];
  
  // Regulatory
  regulatoryStatus: {
    eu: 'compliant' | 'restricted' | 'banned';
    usa: 'compliant' | 'restricted' | 'banned';
    certifications: string[];    // 'organic', 'vegan', 'cruelty_free'
  };
}

export interface StabilityProfile {
  temperatureRange: { min: number; max: number };
  phRange: { min: number; max: number };
  lightSensitive: boolean;
  airSensitive: boolean;
  packaging: string[];           // 'airless', 'amber_glass', 'opaque'
}
```

#### **C. Skincare Services & Procedures**

```typescript
export type ProcedureType =
  | 'facial'
  | 'peel'
  | 'microdermabrasion'
  | 'led_therapy'
  | 'massage'
  | 'body_treatment'
  | 'consultation'
  | 'laser'
  | 'injection';

export interface Procedure extends Service {
  type: 'treatment';
  procedureType: ProcedureType;
  duration: number;              // minutes
  steps: ProcedureStep[];
  requiredProducts: string[];    // formulation IDs
  requiredEquipment: string[];
  therapistRequirements: {
    certifications: string[];
    experienceYears?: number;
  };
  
  // Contraindications & Safety
  contraindications: string[];
  preCareSafety: string[];
  postCareSafety: string[];
  
  // Pricing
  pricing: {
    basePrice: number;
    memberPrice?: number;
    seriesPrice?: number;         // price for package
    seriesSize?: number;          // number of sessions
  };
  
  // Scheduling
  bookingWindow: number;         // days in advance
  frequency: {                   // recommended frequency
    min: number;                 // weeks between sessions
    max: number;
  };
}

export interface ProcedureStep {
  order: number;
  name: string;
  duration: number;              // minutes
  products?: string[];           // formulation IDs
  equipment?: string[];
  instructions: string;
}

export interface TreatmentPackage extends Service {
  type: 'package';
  procedures: string[];          // procedure IDs
  totalSessions: number;
  validityPeriod: number;        // months
  packagePrice: number;
  savings: number;               // vs individual prices
}
```

#### **D. Skincare-Specific Queries**

```typescript
export interface SkincareQueries {
  // Formulation queries
  findFormulationsBySkinType(skinType: SkinType): Formulation[];
  findFormulationsByIngredient(ingredientId: string): Formulation[];
  findFormulationsByBenefit(benefit: string): Formulation[];
  findFormulationsByPriceRange(min: number, max: number): Formulation[];
  calculateFormulationCost(formulationId: string): CostBreakdown;
  checkIngredientCompatibility(ingredientIds: string[]): CompatibilityReport;
  
  // Salon queries
  findSalonsBySpecialty(specialty: string): Salon[];
  findSalonsByLocation(lat: number, lon: number, radius: number): Salon[];
  findSalonsByCertification(cert: string): Salon[];
  calculateSalonCapacity(salonId: string, date: Date): CapacityReport;
  
  // Procedure queries
  findProceduresByType(type: ProcedureType): Procedure[];
  findProceduresByDuration(maxMinutes: number): Procedure[];
  findProceduresBySkinType(skinType: SkinType): Procedure[];
  calculateProcedureCost(procedureId: string): CostBreakdown;
  
  // Supply chain queries
  findSuppliersByIngredient(ingredientId: string): IngredientSupplier[];
  findFormulationLabsByCapability(capability: string): FormulationLab[];
  optimizeSupplyChain(formulationId: string): SupplyChainOptimization;
}
```

#### **E. Skincare Business Logic**

```typescript
export class SkincareBusinessLogic {
  // Cost calculations
  calculateFormulationCost(formulation: Formulation): number;
  calculateProcedureCost(procedure: Procedure): number;
  calculateMargins(formulation: Formulation): MarginAnalysis;
  
  // Inventory management
  checkIngredientStock(salonId: string): InventoryReport;
  calculateReorderPoint(ingredientId: string): number;
  optimizeInventory(salonId: string): InventoryRecommendations;
  
  // Scheduling
  calculateAvailability(salonId: string, date: Date): TimeSlot[];
  optimizeSchedule(salonId: string, appointments: Appointment[]): Schedule;
  
  // Formulation validation
  validateFormulation(formulation: Formulation): ValidationResult;
  checkRegulatoryCompliance(formulation: Formulation, region: string): ComplianceReport;
  suggestIngredientSubstitutions(ingredientId: string): Ingredient[];
}
```

### 3. Should I create a skincare-specific module like "src/skincare/" that extends the generic wodog?

**YES - This is the recommended approach!**

**Directory Structure**:
```
src/
├── core/                      # Generic supply chain (rename from src/)
│   ├── actors.ts              # Actor, Supplier, Producer, etc.
│   ├── products.ts            # Product, Service
│   ├── relationships.ts       # Relationship, graph algorithms
│   ├── lookup.ts              # SupplyChainLookup
│   ├── config.ts              # Configuration
│   └── index.ts               # Exports
│
└── skincare/                  # NEW: Skincare domain layer
    ├── actors.ts              # Salon, MedicalSpa, FormulationLab, Therapist
    ├── formulations.ts        # Formulation, Ingredient, StabilityProfile
    ├── procedures.ts          # Procedure, ProcedureStep, TreatmentPackage
    ├── queries.ts             # SkincareQueries class
    ├── business-logic.ts      # Cost calculations, validation, optimization
    ├── types.ts               # SkinType, FormulationType, enums
    └── index.ts               # Exports all skincare types
```

**Why this structure?**
- ✅ **Clear separation**: Core vs domain logic
- ✅ **Type safety**: TypeScript ensures correct extensions
- ✅ **Reusability**: Core can be used for other domains
- ✅ **Maintainability**: Changes isolated to relevant layer
- ✅ **Testability**: Unit test each layer independently

### 4. What would be the minimal changes to implement skintwind properly?

**Minimal Implementation Path** (3 phases):

---

## Phase 1: Create Skincare Domain Layer

**Goal**: Add TypeScript types for skincare domain

**Files to Create**:
```
src/skincare/
├── types.ts              # Enums, basic types
├── actors.ts             # Salon, MedicalSpa, FormulationLab
├── formulations.ts       # Formulation, Ingredient
├── procedures.ts         # Procedure, TreatmentPackage
├── queries.ts            # SkincareQueries class
└── index.ts              # Barrel exports
```

**Estimated Time**: 1 week

**Key Tasks**:
1. Define enums (SkinType, FormulationType, IngredientCategory)
2. Create Salon interface extending Actor
3. Create Formulation interface extending Product
4. Create Procedure interface extending Service
5. Add cost calculation methods
6. Add query methods for skincare-specific searches

---

## Phase 2: Build System & Compilation

**Goal**: Compile TypeScript → JavaScript for workerd

**Files to Create**:
```
build/
├── tsconfig.workerd.json      # Workerd-specific TS config
└── compile.sh                 # Build script

dist/                          # Generated JavaScript
├── core/
│   ├── actors.js
│   ├── products.js
│   └── ...
└── skincare/
    ├── actors.js
    ├── formulations.js
    └── ...
```

**package.json scripts**:
```json
{
  "scripts": {
    "build": "tsc",
    "build:workerd": "tsc --project build/tsconfig.workerd.json",
    "clean": "rm -rf dist/",
    "test": "npm run build && jest"
  }
}
```

**Estimated Time**: 3-4 days

---

## Phase 3: Unified Skintwind Extension

**Goal**: Create single authoritative skincare workerd extension

**Refactor**:
- Move `ext/skincare-ext/` → `ext/skintwind/`
- Update imports to use `dist/skincare/`
- Standardize data schema

**New Structure**:
```
ext/skintwind/
├── skintwind.capnp              # Extension definition
├── skintwind-config.capnp       # Worker configuration
├── skintwind.js                 # Public API (imports from dist/)
├── skintwind-impl.js            # Implementation
├── skintwind-binding.js         # Binding module
├── skintwind-worker.js          # Worker handler
└── data/
    ├── schema.json              # Data schema
    ├── actors.json              # All actors (salons, labs, suppliers)
    ├── formulations.json        # All formulations
    └── procedures.json          # All procedures
```

**Key Change**:
```javascript
// OLD (ext/skincare-ext/skincare-impl.js)
class SkincareBrand {
  constructor(salons, formulations, procedures) {
    this.salons = salons;
    this.formulations = formulations;
    this.procedures = procedures;
  }
}

// NEW (ext/skintwind/skintwind-impl.js)
import { SkincareQueries } from "../../dist/skincare/queries.js";
import { SupplyChainLookup } from "../../dist/core/lookup.js";

class Skintwind {
  constructor(actors, formulations, procedures, relationships) {
    this.supplyChain = new SupplyChainLookup();
    this.skincare = new SkincareQueries(this.supplyChain);
    
    // Load data
    actors.forEach(a => this.supplyChain.addActor(a));
    formulations.forEach(f => this.skincare.addFormulation(f));
    procedures.forEach(p => this.skincare.addProcedure(p));
    relationships.forEach(r => this.supplyChain.addRelationship(r));
  }
  
  // Unified API
  async findSalonsBySpecialty(specialty) {
    return this.skincare.findSalonsBySpecialty(specialty);
  }
  
  async findFormulationsBySkinType(skinType) {
    return this.skincare.findFormulationsBySkinType(skinType);
  }
  
  async findSupplyChainPath(fromId, toId) {
    return this.supplyChain.findSupplyChainPath(fromId, toId);
  }
}

export { Skintwind };
```

**Estimated Time**: 1 week

---

## Phase 4: Refactor Examples (Data-Only)

**Goal**: Remove duplicate logic, use shared skintwind extension

**Pattern**:
```
ext/skincare-examples/02-small-salon/
├── config.capnp              # Workerd config (uses skintwind extension)
├── data/
│   ├── salon.json            # Single salon data
│   ├── formulations.json     # Formulations used by this salon
│   └── procedures.json       # Procedures offered by this salon
└── README.md
```

**Key Change**:
```capnp
# OLD: Each example has own implementation
const extension :Workerd.Extension = (
  modules = [
    ( name = "salon:api", esModule = embed "salon.js" ),
    ( name = "salon-internal:impl", esModule = embed "salon-impl.js", internal = true ),
    ...
  ]
);

# NEW: Each example imports shared skintwind extension
const config :Workerd.Config = (
  extensions = [ import "../../skintwind/skintwind.capnp" ],
  services = [
    ( name = "small-salon",
      worker = (
        modules = [
          ( name = "worker", esModule = embed "worker.js" )
        ],
        bindings = [
          ( name = "skintwind",
            wrapped = (
              moduleName = "skintwind:binding",
              innerBindings = [
                ( name = "actors", json = embed "data/salon.json" ),
                ( name = "formulations", json = embed "data/formulations.json" ),
                ( name = "procedures", json = embed "data/procedures.json" )
              ]
            ))
        ],
        compatibilityDate = "2024-02-01"
      ))
  ]
);
```

**Estimated Time**: 1 week

---

## Implementation Priority Matrix

| Phase | Priority | Impact | Effort | Dependencies |
|-------|----------|--------|--------|--------------|
| Phase 1: Skincare Domain | **HIGH** | ⭐⭐⭐⭐⭐ | Medium | None |
| Phase 2: Build System | **HIGH** | ⭐⭐⭐⭐ | Low | Phase 1 |
| Phase 3: Unified Extension | **MEDIUM** | ⭐⭐⭐⭐ | Medium | Phase 2 |
| Phase 4: Refactor Examples | **LOW** | ⭐⭐⭐ | High | Phase 3 |

---

## Detailed Implementation Steps

### Step 1.1: Create `src/skincare/types.ts`

```typescript
// src/skincare/types.ts

export type SkinType = 
  | 'normal' 
  | 'dry' 
  | 'oily' 
  | 'combination' 
  | 'sensitive' 
  | 'acne_prone'
  | 'mature'
  | 'all';

export type FormulationType = 
  | 'cleanser' 
  | 'toner' 
  | 'serum' 
  | 'moisturizer' 
  | 'mask' 
  | 'sunscreen'
  | 'eye_cream'
  | 'body_lotion';

export type IngredientCategory =
  | 'active'
  | 'humectant'
  | 'emollient'
  | 'emulsifier'
  | 'preservative'
  | 'fragrance'
  | 'colorant'
  | 'thickener'
  | 'pH_adjuster'
  | 'antioxidant'
  | 'botanical_extract';

export type ProcedureType =
  | 'facial'
  | 'peel'
  | 'microdermabrasion'
  | 'led_therapy'
  | 'massage'
  | 'body_treatment'
  | 'consultation'
  | 'laser'
  | 'injection';

export interface BusinessHours {
  monday: TimeRange;
  tuesday: TimeRange;
  wednesday: TimeRange;
  thursday: TimeRange;
  friday: TimeRange;
  saturday: TimeRange;
  sunday: TimeRange;
}

export interface TimeRange {
  open: string;   // "09:00"
  close: string;  // "18:00"
}

export interface PriceRange {
  min: number;
  max: number;
  currency: string;
}
```

### Step 1.2: Create `src/skincare/actors.ts`

```typescript
// src/skincare/actors.ts

import { Actor } from '../core/actors';
import { BusinessHours, PriceRange } from './types';

export interface Therapist {
  id: string;
  name: string;
  certifications: string[];
  specialties: string[];
  experienceYears: number;
  availableHours: number;
}

export interface Salon extends Actor {
  type: 'retailer';
  subtype: 'salon';
  specialties: string[];
  treatmentRooms: number;
  therapists: Therapist[];
  certifications: string[];
  dailyCapacity: number;
  hours: BusinessHours;
  priceRange: PriceRange;
}

export interface MedicalSpa extends Salon {
  subtype: 'medspa';
  medicalDirector: string;
  medicalLicense: string;
  insuranceAccepted: boolean;
  medicalProcedures: string[];
}

export interface FormulationLab extends Actor {
  type: 'producer';
  subtype: 'formulation_lab';
  capabilities: string[];
  certifications: string[];
  minBatchSize: number;
  maxBatchSize: number;
  productionCapacity: number;
}

export interface IngredientSupplier extends Actor {
  type: 'supplier';
  subtype: 'ingredient_supplier';
  ingredientTypes: string[];
  certifications: string[];
  regions: string[];
  moq: number;
}
```

### Step 1.3: Create `src/skincare/formulations.ts`

```typescript
// src/skincare/formulations.ts

import { Product } from '../core/products';
import { SkinType, FormulationType, IngredientCategory } from './types';

export interface Ingredient {
  id: string;
  inciName: string;
  commonName: string;
  category: IngredientCategory;
  function: string[];
  percentage: number;
  supplier?: string;
  costPerKg: number;
  safetyRating: number;
  restrictions?: string[];
  compatibility: {
    goodWith: string[];
    avoidWith: string[];
  };
}

export interface StabilityProfile {
  temperatureRange: { min: number; max: number };
  phRange: { min: number; max: number };
  lightSensitive: boolean;
  airSensitive: boolean;
  packaging: string[];
}

export interface CostBreakdown {
  ingredients: number;
  packaging: number;
  labor: number;
  overhead: number;
  total: number;
}

export interface RegulatoryStatus {
  eu: 'compliant' | 'restricted' | 'banned';
  usa: 'compliant' | 'restricted' | 'banned';
  certifications: string[];
}

export interface Formulation extends Product {
  category: 'finished_good';
  formulationType: FormulationType;
  ingredients: Ingredient[];
  skinTypes: SkinType[];
  benefits: string[];
  contraindications: string[];
  
  costBreakdown: CostBreakdown;
  recommendedRetailPrice: number;
  marginPercentage: number;
  
  batchSize: number;
  shelfLife: number;
  stability: StabilityProfile;
  manufacturingSteps: string[];
  
  regulatoryStatus: RegulatoryStatus;
}
```

### Step 1.4: Create `src/skincare/procedures.ts`

```typescript
// src/skincare/procedures.ts

import { Service } from '../core/products';
import { ProcedureType } from './types';

export interface ProcedureStep {
  order: number;
  name: string;
  duration: number;
  products?: string[];
  equipment?: string[];
  instructions: string;
}

export interface Procedure extends Service {
  type: 'treatment';
  procedureType: ProcedureType;
  duration: number;
  steps: ProcedureStep[];
  requiredProducts: string[];
  requiredEquipment: string[];
  therapistRequirements: {
    certifications: string[];
    experienceYears?: number;
  };
  
  contraindications: string[];
  preCareSafety: string[];
  postCareSafety: string[];
  
  pricing: {
    basePrice: number;
    memberPrice?: number;
    seriesPrice?: number;
    seriesSize?: number;
  };
  
  bookingWindow: number;
  frequency: {
    min: number;
    max: number;
  };
}

export interface TreatmentPackage extends Service {
  type: 'package';
  procedures: string[];
  totalSessions: number;
  validityPeriod: number;
  packagePrice: number;
  savings: number;
}
```

### Step 1.5: Create `src/skincare/queries.ts`

```typescript
// src/skincare/queries.ts

import { SupplyChainLookup } from '../core/lookup';
import { Salon, FormulationLab, IngredientSupplier } from './actors';
import { Formulation, Ingredient } from './formulations';
import { Procedure } from './procedures';
import { SkinType, FormulationType, ProcedureType } from './types';

export class SkincareQueries {
  private lookup: SupplyChainLookup;
  private formulations: Map<string, Formulation>;
  private procedures: Map<string, Procedure>;
  
  constructor(lookup: SupplyChainLookup) {
    this.lookup = lookup;
    this.formulations = new Map();
    this.procedures = new Map();
  }
  
  // Formulation queries
  findFormulationsBySkinType(skinType: SkinType): Formulation[] {
    return Array.from(this.formulations.values())
      .filter(f => f.skinTypes.includes(skinType));
  }
  
  findFormulationsByIngredient(ingredientId: string): Formulation[] {
    return Array.from(this.formulations.values())
      .filter(f => f.ingredients.some(i => i.id === ingredientId));
  }
  
  findFormulationsByBenefit(benefit: string): Formulation[] {
    return Array.from(this.formulations.values())
      .filter(f => f.benefits.includes(benefit));
  }
  
  findFormulationsByPriceRange(min: number, max: number): Formulation[] {
    return Array.from(this.formulations.values())
      .filter(f => f.recommendedRetailPrice >= min && f.recommendedRetailPrice <= max);
  }
  
  // Salon queries
  async findSalonsBySpecialty(specialty: string): Promise<Salon[]> {
    const result = await this.lookup.findActors({ 
      type: 'retailer' 
    });
    
    return result.items
      .filter((actor): actor is Salon => 
        'subtype' in actor && 
        actor.subtype === 'salon' &&
        'specialties' in actor &&
        actor.specialties.includes(specialty)
      );
  }
  
  // Procedure queries
  findProceduresByType(type: ProcedureType): Procedure[] {
    return Array.from(this.procedures.values())
      .filter(p => p.procedureType === type);
  }
  
  findProceduresByDuration(maxMinutes: number): Procedure[] {
    return Array.from(this.procedures.values())
      .filter(p => p.duration <= maxMinutes);
  }
  
  // Add methods
  addFormulation(formulation: Formulation): void {
    this.formulations.set(formulation.id, formulation);
  }
  
  addProcedure(procedure: Procedure): void {
    this.procedures.set(procedure.id, procedure);
  }
}
```

### Step 1.6: Create `src/skincare/index.ts`

```typescript
// src/skincare/index.ts

export * from './types';
export * from './actors';
export * from './formulations';
export * from './procedures';
export * from './queries';
```

---

## Testing Strategy

### Unit Tests for Skincare Domain

```typescript
// test/skincare/queries.test.ts

import { SkincareQueries } from '../../src/skincare/queries';
import { SupplyChainLookup } from '../../src/core/lookup';
import { Formulation } from '../../src/skincare/formulations';

describe('SkincareQueries', () => {
  let queries: SkincareQueries;
  let lookup: SupplyChainLookup;
  
  beforeEach(() => {
    lookup = new SupplyChainLookup();
    queries = new SkincareQueries(lookup);
  });
  
  test('findFormulationsBySkinType filters correctly', () => {
    const formulation: Formulation = {
      id: 'f1',
      name: 'Hydrating Serum',
      sku: 'HS001',
      category: 'finished_good',
      formulationType: 'serum',
      skinTypes: ['dry', 'normal'],
      // ... other required fields
    };
    
    queries.addFormulation(formulation);
    
    const results = queries.findFormulationsBySkinType('dry');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('f1');
  });
  
  test('findFormulationsByBenefit returns matching formulations', () => {
    const formulation: Formulation = {
      id: 'f2',
      name: 'Anti-Aging Cream',
      benefits: ['anti-aging', 'firming', 'hydration'],
      // ... other required fields
    };
    
    queries.addFormulation(formulation);
    
    const results = queries.findFormulationsByBenefit('anti-aging');
    expect(results).toHaveLength(1);
  });
});
```

---

## Success Criteria

✅ **Phase 1 Complete When**:
- All TypeScript types defined in `src/skincare/`
- Types compile without errors
- Unit tests pass (>80% coverage)
- Documentation complete

✅ **Phase 2 Complete When**:
- Build system generates `dist/` directory
- JavaScript modules importable by workerd
- Source maps available for debugging

✅ **Phase 3 Complete When**:
- Unified `ext/skintwind/` extension works
- All queries functional
- API endpoints respond correctly

✅ **Phase 4 Complete When**:
- All 5 examples refactored
- Examples use shared extension
- No duplicate logic across examples

---

## Migration Path for Existing Code

### From `ext/skincare-ext/` to `ext/skintwind/`

**Current**: Each example has own implementation
**Target**: Shared implementation, data-driven examples

**Migration Steps**:
1. Create unified extension in `ext/skintwind/`
2. Test with simplest example (01-mobile-therapist)
3. Migrate each example one by one
4. Validate functionality at each step
5. Update documentation

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Build system complexity | Medium | Use simple tsc, avoid bundlers initially |
| Breaking examples during refactor | High | Migrate incrementally, test each example |
| TypeScript/JavaScript impedance mismatch | Medium | Use ESM, follow workerd patterns |
| Data schema incompatibility | Low | Define strict JSON schema, validate |

---

## Timeline Estimate

**Total: 3-4 weeks**

- Week 1: Phase 1 (Skincare Domain Layer)
- Week 2: Phase 2 (Build System) + Start Phase 3
- Week 3: Phase 3 (Unified Extension) + Testing
- Week 4: Phase 4 (Refactor Examples) + Documentation

---

## Conclusion

**Skintwind should be implemented as**:
1. ✅ **Unified skincare-specific layer** (`src/skincare/`) extending generic wodog
2. ✅ **Single authoritative extension** (`ext/skintwind/`) using compiled TypeScript
3. ✅ **Data-driven examples** that share the unified extension
4. ✅ **Minimal changes**: Focus on domain types, build system, unified extension

This architecture provides:
- 🎯 **Clear separation** of concerns (generic vs domain)
- 🎯 **Type safety** through TypeScript
- 🎯 **Code reuse** across examples
- 🎯 **Maintainability** through modularity
- 🎯 **Scalability** to other domains (food, pharma, retail)

**Next Action**: Start with Phase 1 - create `src/skincare/types.ts` and build from there!
