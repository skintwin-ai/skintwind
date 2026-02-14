# Skintwind - Skincare Supply Chain Application

Skintwind is a specific application of workerd to the skincare supply chain, combining the generic supply chain implementation (wodog) with skincare-specific functionality.

## Overview

Skintwind demonstrates the three-layer architecture:
1. **Generic Supply Chain** (src/) - Type-safe TypeScript foundation
2. **Skincare Domain** (src/skincare/) - Skincare-specific types and queries
3. **Workerd Extension** (ext/skintwind/) - Runtime implementation

## Architecture

```
┌─────────────────────────────────────────────┐
│ ext/skintwind/ (Workerd Extension Layer)   │
│ - skintwind.js (Public API)                │
│ - skintwind-impl.js (Implementation)       │
│ - skintwind-worker.js (REST API)           │
│ - skintwind.capnp (Extension definition)   │
└──────────────┬──────────────────────────────┘
               │ uses types from
┌──────────────▼──────────────────────────────┐
│ dist/skincare/ (Compiled Types)            │
│ - actors.js (Salon, MedSpa, Lab types)     │
│ - formulations.js (Formulation types)      │
│ - procedures.js (Procedure types)          │
│ - queries.js (SkincareLookup class)        │
└──────────────┬──────────────────────────────┘
               │ extends
┌──────────────▼──────────────────────────────┐
│ src/ (Generic Supply Chain - TypeScript)   │
│ - actors.ts (Generic Actor types)          │
│ - products.ts (Generic Product types)      │
│ - lookup.ts (SupplyChainLookup class)      │
└─────────────────────────────────────────────┘
```

## Features

### Actors
- **Salons**: Treatment facilities with specialties (facials, massages, etc.)
- **Medical Spas**: Medical-grade treatment facilities
- **Labs**: Production facilities for skincare formulations
- **Suppliers**: Raw material providers

### Products (Formulations)
- Moisturizers, serums, cleansers, night creams
- Ingredient tracking with percentages and functions
- Skin type targeting (dry, oily, sensitive, etc.)
- Benefit tracking (hydrating, anti-aging, brightening, etc.)

### Services (Procedures)
- Step-by-step treatment workflows
- Duration and pricing
- Product usage tracking
- Skin type compatibility

## Data Files

- **salons.json**: 3 salons and 1 production lab
  - Serenity Spa Downtown (New York)
  - Radiance Beauty Center (Los Angeles)
  - Eternal Youth Med Spa (Miami)
  - Pure Formulations Lab (production)

- **formulations.json**: 4 product formulations
  - Hydrating Moisturizer
  - Vitamin C Serum
  - Gentle Cleanser
  - Anti-Aging Night Cream

- **procedures.json**: 6 treatment procedures
  - Signature Facial ($120, 80 min)
  - Chemical Peel ($180, 60 min)
  - Deluxe Facial ($150, 80 min)
  - Relaxation Massage ($110, 70 min)
  - Anti-Aging Treatment ($200, 85 min)
  - Hydration Boost ($95, 60 min)

## API Endpoints

### Salons
- `GET /salons` - Get all salons
- `GET /salon/{id}` - Get specific salon
- `GET /salon/{id}/procedures` - Get procedures for salon
- `GET /labs` - Get production labs
- `GET /query/salons?specialty={specialty}&city={city}` - Query salons

### Procedures
- `GET /procedure/{id}` - Get procedure with calculated cost
- `GET /procedures?skinType={type}&minDuration={min}&maxDuration={max}` - Query procedures

### Formulations
- `GET /formulation/{id}` - Get formulation details
- `GET /formulations?type={type}&skinType={skinType}&benefit={benefit}` - Query formulations

## Running Skintwind

### With workerd (if installed)

```bash
# From repository root
bazel run //src/workerd/server:workerd -- serve $(pwd)/ext/skintwind/skintwind-config.capnp

# Query the API
curl localhost:8080/
curl localhost:8080/salons
curl localhost:8080/salon/salon1
curl localhost:8080/salon/salon1/procedures
curl localhost:8080/procedure/proc1
curl localhost:8080/formulations?skinType=dry
curl localhost:8080/query/salons?specialty=facials
curl localhost:8080/procedures?minDuration=60&maxDuration=90
```

### Development

```bash
# Build TypeScript types
npm run build

# Run tests
npm test
```

## Usage Example

### Direct API Usage (in worker code)

```javascript
import { Skintwind } from "skintwind:skintwind";

const skintwind = new Skintwind({
  salons: [...],
  formulations: [...],
  procedures: [...]
});

// Query salons by specialty
const facialSalons = skintwind.findSalonsBySpecialty('facials');

// Get procedures for a salon
const procedures = skintwind.getSalonProcedures('salon1');

// Calculate procedure cost including products
const cost = skintwind.calculateProcedureCost('proc1');

// Query formulations by skin type
const dryFormulations = skintwind.findFormulationsBySkinType('dry');
```

### Environment Binding (recommended)

```javascript
export default {
  async fetch(request, env) {
    // Access pre-configured skintwind instance
    const salons = env.skintwind.getAllSalons();
    const procedures = env.skintwind.queryProcedures({ skinType: 'dry' });
    const cost = env.skintwind.calculateProcedureCost('proc1');
    
    return new Response(JSON.stringify({ salons, procedures, cost }));
  }
};
```

## Benefits

### Type Safety
- TypeScript types in src/skincare/ provide compile-time safety
- Compiled to dist/skincare/ for runtime use
- JSDoc comments for IDE support in JavaScript

### Modularity
- Clear separation between generic and skincare-specific logic
- Easy to extend with new skincare features
- Reusable generic supply chain foundation

### Security
- Capability-based design via workerd bindings
- Internal modules hidden from user code
- No global access to unconfigured resources

### Extensibility
- Add new actor types (spas, clinics, etc.)
- Add new procedure types (lasers, injectables, etc.)
- Add new formulation types (serums, masks, etc.)
- Extend generic supply chain for other domains

## Comparison with Generic Supply Chain

| Feature | Generic (wodog) | Skintwind |
|---------|----------------|-----------|
| Actors | Supplier, Producer, Distributor, Wholesaler, Retailer, Marketplace | Salon, MedSpa, Lab, Supplier |
| Products | Generic Product with attributes | Formulation with ingredients, skin types, benefits |
| Services | Generic Service with SLA | Procedure with steps, duration, skin type compatibility |
| Queries | Type, name, cooperative, capacity | + Specialty, city, certification, skin type, duration |

## Related Examples

- **ext/skincare-examples/01-mobile-therapist** - Single therapist (simplest)
- **ext/skincare-examples/02-small-salon** - Small business with products
- **ext/skincare-examples/03-mediclinic** - Medical facility
- **ext/skincare-examples/04-franchise** - Multi-location network
- **ext/skincare-examples/05-supply-chain** - Full multi-tier supply chain

## Documentation

- **IMPLEMENTATION_SUMMARY.md** - Generic supply chain implementation details
- **ext/workerd-generalized-scm.md** - Generalized supply chain theory
- **ext/workerd-extensions-skintwin.md** - Workerd extension pattern explained

## License

Copyright (c) 2024 Cloudflare, Inc.
Licensed under the Apache 2.0 license found in the LICENSE file or at:
    https://opensource.org/licenses/Apache-2.0
