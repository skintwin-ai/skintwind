# Skintwind Implementation Plan

## Executive Summary

**Skintwind** is a specialized application of the workerd runtime to the skincare supply chain domain. It combines:
1. **Generic supply chain foundation** (`wodog` library in `src/`) - TypeScript-based actor/relationship system
2. **Skincare-specific workerd extensions** (in `ext/`) - JavaScript modules for workerd runtime
3. **Progressive complexity examples** - 5 real-world scenarios from mobile therapist to full supply chain

## Current Repository Structure

```
skintwind/
├── src/                           # Generic "wodog" library (TypeScript)
│   ├── actors.ts                  # Generic actor types (Supplier, Producer, etc.)
│   ├── relationships.ts           # Relationship management
│   ├── products.ts                # Product and service types
│   ├── config.ts                  # Configuration and bindings
│   ├── lookup.ts                  # Query and path-finding
│   ├── worker.ts                  # Example worker implementation
│   ├── example.ts                 # Usage examples
│   └── index.ts                   # Main exports
│
├── ext/                           # Workerd extensions (JavaScript)
│   ├── workerd-ext/              # Generic workerd examples
│   │   ├── burrito-shop.*        # Simple example (1 service)
│   │   ├── supply-chain.*        # Complex example (multi-actor)
│   │   ├── actors.json
│   │   └── relationships.json
│   │
│   ├── skincare-ext/             # Skincare workerd extension
│   │   ├── skincare.capnp        # Extension definition
│   │   ├── skincare-config.capnp # Worker configuration
│   │   ├── skincare.js           # Public API
│   │   ├── skincare-impl.js      # Internal implementation
│   │   ├── salon.js              # Salon actor module
│   │   ├── formulations.js       # Product formulations
│   │   ├── procedures.js         # Treatment procedures
│   │   ├── skincare-binding.js   # Binding module
│   │   ├── skincare-worker.js    # Worker implementation
│   │   ├── salons.json           # Salon data
│   │   ├── formulations.json     # Product data
│   │   └── procedures.json       # Treatment data
│   │
│   └── skincare-examples/        # Progressive complexity examples
│       ├── 01-mobile-therapist/  # Level 1: Single operator
│       ├── 02-small-salon/       # Level 2: Small business
│       ├── 03-mediclinic/        # Level 3: Medical facility
│       ├── 04-franchise/         # Level 4: Multi-location
│       └── 05-supply-chain/      # Level 5: Full network (12 actors)
│
├── test/                          # Tests
├── docs/                          # Documentation
├── package.json                   # NPM package config
├── tsconfig.json                  # TypeScript config
└── wrangler.toml                  # Cloudflare Workers config
```

## What is Skintwind?

Skintwind is **NOT** just a library or just a workerd extension. It is:

1. **A Reusable Foundation**: The `wodog` library (`src/`) provides TypeScript types and logic for any supply chain
2. **A Runtime Pattern**: Workerd extensions (`ext/`) show how to deploy supply chains to edge computing
3. **A Domain Application**: Specialized to skincare supply chains with real-world examples
4. **A Learning Path**: Progressive examples from simple (1 actor) to complex (12 actors)

### The Three Layers

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: Skincare Domain Application (skintwind)            │
│ - Salons, formulations, procedures, treatments              │
│ - Skincare-specific queries and workflows                   │
│ - Example implementations at 5 complexity levels            │
├─────────────────────────────────────────────────────────────┤
│ Layer 2: Workerd Extension Pattern (ext/)                   │
│ - Cap'n Proto configurations                                │
│ - Public/internal module separation                         │
│ - Binding modules for environment initialization            │
│ - Worker request handlers                                   │
├─────────────────────────────────────────────────────────────┤
│ Layer 1: Generic Supply Chain Foundation (wodog/src/)       │
│ - Actor types (Supplier, Producer, Distributor, etc.)       │
│ - Relationship modeling and graph algorithms                │
│ - Product/service management                                │
│ - Query/lookup with pagination                              │
└─────────────────────────────────────────────────────────────┘
```

## Analysis of Current State

### ✅ What Exists

1. **Generic Supply Chain Library** (`src/`)
   - Complete TypeScript implementation
   - All 6 actor types defined
   - Relationship graph with path-finding
   - Product and service management
   - Configuration system
   - Ready to use as NPM package

2. **Workerd Extension Examples** (`ext/workerd-ext/`)
   - Burrito shop (simple example)
   - Supply chain (complex example with 5 actors)
   - Demonstrates module patterns
   - Shows binding configuration

3. **Skincare Extension** (`ext/skincare-ext/`)
   - 3 salons + 1 production plant
   - Product formulations
   - Treatment procedures
   - Complete workerd implementation
   - Working example

4. **Progressive Examples** (`ext/skincare-examples/`)
   - 5 examples from simple to complex
   - Mobile therapist → Mediclinic → Franchise → Supply chain
   - Each with full documentation
   - Real-world scenarios

### ❌ What's Missing for Complete Skintwind

1. **Integration Layer**
   - No bridge between `src/` (TypeScript) and `ext/` (JavaScript)
   - TypeScript types not used in workerd extensions
   - Extensions reimplement logic instead of importing from `wodog`

2. **Unified Skincare Implementation**
   - `skincare-ext` is standalone
   - `skincare-examples/05-supply-chain` duplicates logic
   - No shared skincare-specific types/models

3. **Build System**
   - No compilation from TypeScript to JavaScript for workerd
   - No bundling for extension modules
   - Extensions are hand-written JavaScript

4. **Documentation**
   - No unified guide showing how layers connect
   - No API documentation for skincare-specific features
   - Examples are documented separately

5. **Testing**
   - Basic tests for `wodog` library
   - No tests for workerd extensions
   - No integration tests

## Implementation Plan

### Phase 1: Create Skincare-Specific Foundation

**Goal**: Build skincare domain models on top of `wodog`

**Tasks**:
1. Create `src/skincare/` directory with skincare-specific types
2. Define skincare actor types (Salon, MedSpa, Lab, Supplier, etc.)
3. Define skincare products (Formulation, Ingredient, Product)
4. Define skincare services (Procedure, Treatment, Step)
5. Extend generic `Actor` with skincare-specific fields
6. Create skincare-specific queries

**Files to Create**:
```
src/skincare/
├── actors.ts          # Salon, MedSpa, Lab, etc.
├── formulations.ts    # Product formulations and ingredients
├── procedures.ts      # Treatment procedures and workflows
├── queries.ts         # Skincare-specific query helpers
└── index.ts           # Exports
```

**Example**:
```typescript
// src/skincare/actors.ts
import { Actor } from '../actors.js';

export interface Salon extends Actor {
  type: 'salon';
  specialties: string[];
  treatmentRooms: number;
  therapists: number;
  certifications: string[];
  dailyCapacity: number;
}

export interface Formulation {
  id: string;
  name: string;
  type: 'cleanser' | 'moisturizer' | 'serum' | 'mask';
  ingredients: Ingredient[];
  skinTypes: string[];
  cost: number;
}
```

### Phase 2: Build System for Workerd Integration

**Goal**: Compile TypeScript to JavaScript modules for workerd

**Tasks**:
1. Configure TypeScript to output ES modules
2. Create build script to compile for workerd
3. Bundle shared code for extension modules
4. Generate JavaScript from TypeScript types

**Files to Create/Modify**:
```
build/
├── tsconfig.workerd.json    # Workerd-specific TypeScript config
├── bundle-extensions.js     # Script to bundle for workerd
└── compile.sh               # Build script

package.json                 # Add build scripts
```

**Build Script**:
```json
{
  "scripts": {
    "build": "tsc",
    "build:workerd": "tsc --project build/tsconfig.workerd.json",
    "build:extensions": "node build/bundle-extensions.js"
  }
}
```

### Phase 3: Unified Skincare Extension

**Goal**: Create single authoritative skincare workerd extension

**Tasks**:
1. Move `ext/skincare-ext/` to `ext/skintwind/`
2. Refactor to import from compiled `src/skincare/`
3. Create shared skincare binding module
4. Standardize data schema across examples
5. Add versioning to data files

**New Structure**:
```
ext/skintwind/
├── skintwind.capnp              # Main extension definition
├── skintwind-config.capnp       # Worker configuration
├── skintwind.js                 # Public API (imports from dist/)
├── skintwind-impl.js            # Implementation (uses wodog)
├── skintwind-binding.js         # Binding module
├── skintwind-worker.js          # Worker handler
├── data/
│   ├── schema.json              # Data schema definition
│   ├── actors.json              # All actors
│   ├── relationships.json       # All relationships
│   ├── formulations.json        # Product formulations
│   └── procedures.json          # Treatment procedures
└── README.md
```

### Phase 4: Refactor Examples to Use Unified Extension

**Goal**: Make examples import from unified skintwind extension

**Tasks**:
1. Refactor each example to import from `skintwind` extension
2. Examples provide only data files, not implementation
3. Create example-specific data subsets
4. Add configuration to select features per example

**Updated Example Structure**:
```
ext/skincare-examples/01-mobile-therapist/
├── config.capnp                 # Uses skintwind extension
├── data/
│   ├── therapist.json           # Just the data
│   └── procedures.json
└── README.md

ext/skincare-examples/05-supply-chain/
├── config.capnp                 # Uses skintwind extension
├── data/
│   ├── actors.json              # 12 actors
│   ├── relationships.json       # Multi-tier relationships
│   ├── formulations.json        # Products
│   └── procedures.json          # Treatments
└── README.md
```

### Phase 5: Documentation and Testing

**Goal**: Complete documentation and test coverage

**Tasks**:
1. Write unified API documentation
2. Create architecture guide
3. Write tutorial for each complexity level
4. Add unit tests for skincare modules
5. Add integration tests for extensions
6. Add end-to-end tests for examples

**Documentation Structure**:
```
docs/
├── architecture/
│   ├── overview.md              # Three-layer architecture
│   ├── wodog-foundation.md      # Generic supply chain
│   ├── workerd-pattern.md       # Extension pattern
│   └── skincare-domain.md       # Skincare specifics
├── tutorials/
│   ├── 01-getting-started.md
│   ├── 02-mobile-therapist.md
│   ├── 03-small-salon.md
│   ├── 04-mediclinic.md
│   ├── 05-franchise.md
│   └── 06-supply-chain.md
├── api/
│   ├── wodog-api.md             # Generic library API
│   └── skintwind-api.md         # Skincare extension API
└── guides/
    ├── deployment.md
    ├── customization.md
    └── data-modeling.md
```

### Phase 6: Advanced Features

**Goal**: Add enterprise features

**Tasks**:
1. Add authentication/authorization
2. Add rate limiting
3. Add metrics and logging
4. Add WebSocket support for real-time updates
5. Add Durable Objects for state management
6. Add KV storage integration
7. Add R2 storage for images/documents

## Recommended Structure

Based on this analysis, here's the recommended final structure:

```
skintwind/
├── src/                           # TypeScript source
│   ├── core/                      # Generic wodog library
│   │   ├── actors.ts
│   │   ├── relationships.ts
│   │   ├── products.ts
│   │   ├── config.ts
│   │   ├── lookup.ts
│   │   └── index.ts
│   │
│   └── skincare/                  # Skincare-specific types
│       ├── actors.ts
│       ├── formulations.ts
│       ├── procedures.ts
│       ├── queries.ts
│       └── index.ts
│
├── dist/                          # Compiled JavaScript (ES modules)
│   ├── core/
│   └── skincare/
│
├── ext/
│   ├── skintwind/                # Main skincare extension
│   │   ├── skintwind.capnp
│   │   ├── skintwind-config.capnp
│   │   ├── skintwind.js         # Imports from dist/
│   │   ├── skintwind-impl.js
│   │   ├── skintwind-binding.js
│   │   ├── skintwind-worker.js
│   │   └── data/
│   │
│   └── examples/                 # Example configurations
│       ├── 01-mobile-therapist/
│       ├── 02-small-salon/
│       ├── 03-mediclinic/
│       ├── 04-franchise/
│       └── 05-supply-chain/
│
├── test/
│   ├── unit/                     # Unit tests
│   │   ├── core/
│   │   └── skincare/
│   ├── integration/              # Extension tests
│   └── e2e/                      # End-to-end tests
│
├── docs/                         # Documentation
│   ├── architecture/
│   ├── tutorials/
│   ├── api/
│   └── guides/
│
├── build/                        # Build scripts
│   ├── tsconfig.workerd.json
│   ├── bundle-extensions.js
│   └── compile.sh
│
├── package.json
├── tsconfig.json
├── wrangler.toml
└── README.md
```

## What Needs to Be Created New?

### 1. Skincare Domain Layer (`src/skincare/`)
- **NEW**: Skincare-specific actor types extending generic actors
- **NEW**: Formulation and ingredient models
- **NEW**: Procedure and treatment workflow models
- **NEW**: Skincare-specific query helpers

### 2. Build Integration
- **NEW**: Build system to compile TypeScript → JavaScript for workerd
- **NEW**: Bundler for extension modules
- **NEW**: Type generation for JavaScript consumers

### 3. Unified Extension (`ext/skintwind/`)
- **REFACTOR**: Consolidate `skincare-ext` into unified extension
- **NEW**: Import compiled code from `dist/` instead of reimplementing
- **NEW**: Shared data schema and validation

### 4. Example Refactoring
- **REFACTOR**: Make examples use shared extension
- **SIMPLIFY**: Examples provide only data, not code
- **NEW**: Configuration system to enable/disable features per example

### 5. Testing Infrastructure
- **NEW**: Unit tests for skincare modules
- **NEW**: Integration tests for workerd extensions
- **NEW**: E2E tests for full workflows

### 6. Documentation
- **NEW**: Architecture documentation
- **NEW**: Tutorial series
- **NEW**: API reference
- **NEW**: Deployment guides

## Components to Leverage

### From Existing Codebase

1. **Generic Supply Chain (`src/`)** ✅
   - Actor types and interfaces
   - Relationship graph algorithms
   - Product/service models
   - Configuration system
   - Lookup and query logic
   - **Action**: Keep as foundation, organize into `src/core/`

2. **Workerd Extension Pattern (`ext/workerd-ext/`)** ✅
   - Module structure (public/internal/binding)
   - Cap'n Proto configuration patterns
   - Worker request handling patterns
   - **Action**: Use as reference, apply to skintwind

3. **Skincare Data Models (`ext/skincare-ext/`)** ✅
   - Salon data structure
   - Formulation schema
   - Procedure schema
   - **Action**: Migrate to TypeScript in `src/skincare/`

4. **Progressive Examples (`ext/skincare-examples/`)** ✅
   - Real-world scenarios
   - Documentation structure
   - API design patterns
   - **Action**: Refactor to use unified extension

## Implementation Priorities

### Must Have (MVP)
1. ✅ Generic supply chain foundation (already exists)
2. 🔨 Skincare domain models in TypeScript
3. 🔨 Build system for workerd compilation
4. 🔨 Unified skintwind extension
5. 🔨 At least 2 working examples (simple + complex)

### Should Have (v1.0)
6. 📝 All 5 examples refactored
7. 📝 Complete API documentation
8. 📝 Tutorial series
9. 📝 Unit test coverage

### Nice to Have (v2.0)
10. 🎯 Integration tests
11. 🎯 E2E tests
12. 🎯 Advanced features (auth, metrics, etc.)
13. 🎯 WebSocket support
14. 🎯 Durable Objects integration

## Next Steps

### Immediate Actions

1. **Create skincare domain layer**
   ```bash
   mkdir -p src/skincare
   # Create actors.ts, formulations.ts, procedures.ts, queries.ts, index.ts
   ```

2. **Set up build system**
   ```bash
   mkdir -p build dist
   # Create tsconfig.workerd.json
   # Create bundle script
   # Update package.json scripts
   ```

3. **Refactor skincare extension**
   ```bash
   mv ext/skincare-ext ext/skintwind
   # Refactor to import from compiled dist/
   # Create unified data schema
   ```

4. **Update documentation**
   ```bash
   # Update README.md with three-layer architecture
   # Create ARCHITECTURE.md
   # Update example READMEs
   ```

### Questions to Resolve

1. **Naming**: Should the main extension be `skintwind` or keep `skincare-brand`?
   - Recommendation: `skintwind` for consistency with repo name

2. **TypeScript in Workerd**: Can workerd import compiled JavaScript from `dist/`?
   - Need to test embedding generated .js files in .capnp

3. **Data Schema**: Should we enforce a strict JSON schema?
   - Recommendation: Yes, with validation in binding module

4. **Versioning**: How to version data files independently from code?
   - Recommendation: Add version field to JSON files

## Success Criteria

Skintwind is successfully implemented when:

1. ✅ **Reusable Foundation**: `wodog` library works for any supply chain
2. ✅ **Skincare Specialization**: Skincare types extend generic foundation
3. ✅ **Workerd Ready**: Extensions deploy to Cloudflare Workers
4. ✅ **Progressive Examples**: 5 working examples from simple to complex
5. ✅ **Well Documented**: Clear architecture and tutorial docs
6. ✅ **Tested**: Good test coverage for core and skincare modules
7. ✅ **Maintainable**: Clear separation of concerns, easy to extend

## Conclusion

**Skintwind** is best implemented as a **three-layer architecture**:

1. **Generic foundation** (`src/core/`) - Reusable supply chain logic
2. **Skincare domain** (`src/skincare/`) - Skincare-specific models
3. **Workerd extensions** (`ext/skintwind/`) - Edge runtime deployment

The current codebase has excellent foundations but needs:
- TypeScript skincare models
- Build system for workerd integration
- Unified extension consolidation
- Example refactoring
- Comprehensive documentation

This approach maximizes code reuse, maintains clear boundaries, and provides a learning path from simple to complex implementations.
