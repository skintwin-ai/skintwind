# Skintwind - Skincare Supply Chain on Cloudflare Workers

> **A specialized application of workerd to the skincare supply chain**

Skintwind combines a generic supply chain foundation (**wodog**) with skincare-specific domain models, deployed to edge computing via workerd extensions.

## Three-Layer Architecture

```
┌──────────────────────────────────────────────────────────┐
│ Layer 3: Workerd Extension (ext/skintwind/)              │
│ • Unified skintwind application                          │
│ • REST API for salons, formulations, procedures          │
│ • Cap'n Proto configuration                              │
│ • Progressive examples (mobile therapist → supply chain) │
├──────────────────────────────────────────────────────────┤
│ Layer 2: Skincare Domain (src/skincare/ → dist/skincare/)│
│ • TypeScript types: Salon, MedSpa, Lab, Formulation     │
│ • SkincareLookup extending SupplyChainLookup            │
│ • Procedures with steps, ingredients, skin types         │
├──────────────────────────────────────────────────────────┤
│ Layer 1: Generic Supply Chain Foundation (src/ - wodog)  │
│ • Actor types, relationships, products                   │
│ • Graph algorithms (BFS/DFS)                             │
│ • Query engine with pagination                           │
└──────────────────────────────────────────────────────────┘
```

## Quick Start

### Run the Unified Skintwind Application

```bash
# Build TypeScript types
npm install
npm run build

# Run skintwind extension (requires workerd)
bazel run //src/workerd/server:workerd -- serve $(pwd)/ext/skintwind/skintwind-config.capnp

# Query the API
curl http://localhost:8080/                           # API documentation
curl http://localhost:8080/salons                     # Get all salons
curl http://localhost:8080/salon/salon1               # Get specific salon
curl http://localhost:8080/salon/salon1/procedures    # Get salon procedures
curl http://localhost:8080/procedure/proc1            # Get procedure with cost
curl http://localhost:8080/formulations?skinType=dry  # Query formulations
curl http://localhost:8080/query/salons?city=New%20York  # Query salons
```

### 5-Minute Tutorial: Mobile Therapist Example

```bash
# Clone and navigate
git clone https://github.com/your-org/skintwind.git
cd skintwind

# View simplest example
cd ext/skincare-examples/01-mobile-therapist
cat README.md

# Run with workerd (if installed)
bazel run //src/workerd/server:workerd -- serve $(pwd)/config.capnp

# Query the API
curl http://localhost:8080/therapist/therapist-sarah
```

### 15-Minute Tutorial: Full Supply Chain

```bash
# Navigate to complex example
cd ext/skincare-examples/05-supply-chain

# View 12-actor network (3 suppliers → 3 producers → 3 distributors → 3 salons)
cat README.md

# Run with workerd
bazel run //src/workerd/server:workerd -- serve $(pwd)/supply-chain-config.capnp

# Find path from supplier to salon
curl -X POST http://localhost:8080/supply-chain/path \
  -d '{"fromId": "supplier-botanical", "toId": "salon-luxe"}'
```

**See [Quick Start Guide](docs/QUICK_START.md) for complete tutorials**

## Skintwind Extension

The **`ext/skintwind/`** directory contains the unified skintwind application - a complete workerd extension that combines:
- Generic supply chain patterns (wodog)
- Skincare-specific types (src/skincare/)
- REST API for salons, procedures, and formulations

### Features
- **3 Salons**: Serenity Spa (NYC), Radiance Beauty (LA), Eternal Youth Med Spa (Miami)
- **1 Lab**: Pure Formulations Lab (production facility)
- **4 Formulations**: Moisturizer, Serum, Cleanser, Night Cream
- **6 Procedures**: Facials, chemical peels, massages, LED treatments
- **Complete REST API**: Query by specialty, city, skin type, duration, price

### API Endpoints
```
GET /                              # API documentation
GET /salons                        # All salons
GET /salon/{id}                    # Specific salon
GET /salon/{id}/procedures         # Salon procedures
GET /labs                          # Production labs
GET /procedure/{id}                # Procedure with calculated cost
GET /procedures?skinType=...       # Query procedures
GET /formulation/{id}              # Formulation details
GET /formulations?type=...         # Query formulations
GET /query/salons?specialty=...    # Query salons
```

See **[ext/skintwind/README.md](ext/skintwind/README.md)** for complete documentation.

## Overview

Skintwind provides a **complete system** for modeling skincare supply chains, from a single mobile therapist to complex multi-tier networks with dozens of actors.

### The Wodog Foundation

The core library (`src/`) provides a generic supply-chain system for Cloudflare Workers (workerd):

## Features

### Actors and Roles

The system defines sets of entities representing different supply chain actors:

- **𝑆 = {s₁,…,sₙ}** - Suppliers: Entities that provide raw materials
- **𝑃 = {p₁,…,pₘ}** - Producers: Entities that manufacture products
- **𝐷** - Distributors: Entities that distribute goods
- **𝑊** - Wholesalers: Entities that sell in bulk
- **𝑅** - Retailers: Entities that sell to end consumers
- **𝑀** - Marketplaces: Platforms for multi-vendor sales

Each actor has:
- **Attributes**: name, type, capacities, pricing rules
- **Cooperative memberships**: primary, secondary, or tertiary level memberships

### Relationships

The system models relationships between actors with:
- Relationship types (supplies, produces_for, distributes_to, sells_to, partners_with, competes_with)
- Status tracking (active, inactive, pending, terminated)
- Contract terms and metadata
- Graph-based path finding

### Services and Products

- **Products**: Raw materials, intermediate goods, finished goods, and services
- **Product attributes**: Weight, dimensions, perishability, certifications
- **Services**: Transportation, warehousing, processing, packaging, consulting, marketing
- **Service Level Agreements**: Response time, availability, quality metrics
- **Inventory tracking**: Location-based inventory management

### Config and Bindings

Designed for workerd with:
- KV namespace bindings for persistence
- Durable Object support for state management
- Feature flags and validation rules
- API configuration and rate limiting

### Dynamic Lookups

Powerful query system supporting:
- Actor lookup by type, name, cooperative membership, capacity
- Product search by category, producer, tags
- Relationship queries with filtering
- Supply chain path finding between actors
- Paginated results

## Progressive Examples

Learn by exploring 5 real-world scenarios of increasing complexity:

| Example | Complexity | Actors | Features | Time |
|---------|-----------|---------|----------|------|
| [01-mobile-therapist](ext/skincare-examples/01-mobile-therapist/) | ⭐ | 1 | Basic services | 5 min |
| [02-small-salon](ext/skincare-examples/02-small-salon/) | ⭐⭐ | 1 | Products, formulations | 10 min |
| [03-mediclinic](ext/skincare-examples/03-mediclinic/) | ⭐⭐⭐ | 1 | Medical workflows | 15 min |
| [04-franchise](ext/skincare-examples/04-franchise/) | ⭐⭐⭐⭐ | 5 | Multi-location network | 20 min |
| [05-supply-chain](ext/skincare-examples/05-supply-chain/) | ⭐⭐⭐⭐⭐ | 12 | Full supply chain, BFS | 30 min |

Each example includes:
- Complete workerd configuration
- Sample data (JSON)
- Comprehensive documentation
- API endpoints

## Installation

### Use as NPM Package

```bash
npm install wodog
```

### Clone and Build from Source

```bash
git clone https://github.com/your-org/skintwind.git
cd skintwind
npm install
npm run build
npm test
```

## Usage

### TypeScript Library (Wodog)

```typescript
import { SupplyChainLookup, Supplier, Producer, Retailer } from 'wodog';

const lookup = new SupplyChainLookup();

// Create a supplier
const supplier: Supplier = {
  id: 's1',
  name: 'Raw Materials Inc',
  type: 'supplier',
  capacities: [
    { type: 'storage', value: 10000, unit: 'kg' }
  ],
  pricingRules: [
    {
      id: 'pr1',
      name: 'Bulk Pricing',
      type: 'tiered',
      tiers: [
        { minQuantity: 0, maxQuantity: 100, price: 10 },
        { minQuantity: 100, price: 9 }
      ]
    }
  ],
  cooperativeMemberships: [],
  rawMaterialTypes: ['steel', 'aluminum']
};

lookup.addActor(supplier);

// Query actors
const suppliers = await lookup.findActors({ type: 'supplier' });
console.log('Found suppliers:', suppliers.items);
```

### Finding Supply Chain Paths

```typescript
// Find path from supplier to retailer
const path = await lookup.findSupplyChainPath('s1', 'r1');
console.log('Supply chain path:', path);
```

### Querying by Cooperative Membership

```typescript
const coopMembers = await lookup.findActors({ 
  cooperativeId: 'coop1' 
});
```

### Skincare-Specific Usage (Coming Soon)

```typescript
import { Salon, Formulation, Procedure } from 'wodog/skincare';

const salon: Salon = {
  id: 'salon1',
  name: 'Luxe Spa',
  type: 'salon',
  specialties: ['facials', 'peels', 'massage'],
  treatmentRooms: 12,
  therapists: 18,
  dailyCapacity: 50
};

const formulation: Formulation = {
  id: 'form1',
  name: 'Hydrating Serum',
  type: 'serum',
  ingredients: [
    { name: 'Hyaluronic Acid', percentage: 2 },
    { name: 'Aloe Vera', percentage: 10 }
  ],
  skinTypes: ['dry', 'normal'],
  cost: 12.50
};
```

## Repository Structure

```
skintwind/
├── src/                    # Generic supply chain library (wodog)
│   ├── actors.ts           # Actor types (Supplier, Producer, etc.)
│   ├── relationships.ts    # Graph algorithms
│   ├── products.ts         # Products and services
│   ├── lookup.ts           # Query engine
│   └── index.ts            # Main exports
│
├── ext/
│   ├── skintwind/         # Unified skincare extension
│   │   └── (coming soon)
│   │
│   ├── skincare-examples/ # Progressive complexity examples
│   │   ├── 01-mobile-therapist/
│   │   ├── 02-small-salon/
│   │   ├── 03-mediclinic/
│   │   ├── 04-franchise/
│   │   └── 05-supply-chain/
│   │
│   └── workerd-ext/       # Generic workerd examples
│       ├── burrito-shop/  # Simple example
│       └── supply-chain/  # Complex example
│
├── docs/
│   ├── ARCHITECTURE.md    # Architecture overview
│   ├── QUICK_START.md     # Getting started tutorials
│   └── (more coming)
│
└── test/                  # Tests
```

## API Reference

### Core Types

- `Actor` - Base interface for all supply chain actors
- `Supplier`, `Producer`, `Distributor`, `Wholesaler`, `Retailer`, `Marketplace` - Specific actor types
- `Relationship` - Connection between actors
- `Product` - Goods in the supply chain
- `Service` - Services provided by actors

### SupplyChainLookup

Main class for querying supply chain entities:

- `findActors(query, page, pageSize)` - Search for actors
- `findProducts(query, page, pageSize)` - Search for products
- `findRelationships(query, page, pageSize)` - Search for relationships
- `findSupplyChainPath(fromId, toId)` - Find path between actors
- `getActorById(id)` - Get actor by ID
- `getProductById(id)` - Get product by ID

## Key Features

### Generic Supply Chain (Wodog)
- ✅ 6 actor types (Supplier, Producer, Distributor, Wholesaler, Retailer, Marketplace)
- ✅ Relationship modeling with graph algorithms
- ✅ BFS/DFS path-finding through supply chains
- ✅ Product and service management
- ✅ Query engine with pagination
- ✅ Cooperative membership tracking
- ✅ TypeScript types for safety

### Skincare Domain
- ✅ Salons, MedSpas, Labs, Franchises
- ✅ Product formulations and ingredients
- ✅ Treatment procedures and workflows
- ✅ Cost calculation with product integration
- ✅ Specialty and certification tracking
- ✅ Multi-location coordination

### Workerd Extensions
- ✅ Capability-based security
- ✅ Public/internal module separation
- ✅ Environment bindings for configuration
- ✅ Edge computing deployment
- ✅ Ultra-low latency (<50ms)
- ✅ Infinite scale

## Use Cases

### Business Owners
- **Mobile Therapist**: Track procedures and capacity
- **Small Salon**: Manage products, formulations, staff
- **Medical Spa**: Handle medical workflows and compliance
- **Franchise Network**: Coordinate multiple locations
- **Supply Chain**: Optimize multi-tier logistics

### Developers
- **Learn Workerd**: Progressive examples teach patterns
- **Build Extensions**: Template for other domains
- **Deploy to Edge**: Cloudflare Workers integration
- **Type Safety**: TypeScript for development

### Architects
- **Reference Implementation**: Real-world supply chain modeling
- **Graph Algorithms**: BFS/DFS path-finding
- **Security Patterns**: Capability-based design
- **Scalability**: Edge computing architecture

## Development

### Build

```bash
npm run build           # Compile TypeScript
npm test                # Run tests
npm run lint            # Lint code
```

### Run Examples Locally

```bash
# Simple example
cd ext/skincare-examples/01-mobile-therapist
bazel run //src/workerd/server:workerd -- serve $(pwd)/config.capnp

# Complex example
cd ext/skincare-examples/05-supply-chain
bazel run //src/workerd/server:workerd -- serve $(pwd)/supply-chain-config.capnp
```

### Deploy to Cloudflare Workers

```bash
npm install -g wrangler
wrangler login
wrangler publish
```

## Documentation

- **[Architecture Overview](docs/ARCHITECTURE.md)** - Three-layer design, diagrams, patterns
- **[Quick Start Guide](docs/QUICK_START.md)** - 5-min and 15-min tutorials
- **[Implementation Plan](SKINTWIND_IMPLEMENTATION_PLAN.md)** - Detailed roadmap
- **[Analysis Summary](ANALYSIS_SUMMARY.md)** - Current state and next steps
- **[Example READMEs](ext/skincare-examples/)** - Detailed docs for each example

## Roadmap

### Current Status (v0.1)
- ✅ Generic supply chain foundation (wodog)
- ✅ 5 progressive skincare examples
- ✅ Complete documentation
- ✅ Basic tests passing

### Next Steps (v0.2)
- [ ] Create `src/skincare/` TypeScript types
- [ ] Build system for workerd compilation
- [ ] Unified `ext/skintwind/` extension
- [ ] Refactor examples to use unified extension

### Future (v1.0)
- [ ] Complete API documentation
- [ ] Integration and E2E tests
- [ ] Authentication and authorization
- [ ] WebSocket support
- [ ] Durable Objects integration

## Contributing

Contributions are welcome! Please:
1. Read [ARCHITECTURE.md](docs/ARCHITECTURE.md) to understand the design
2. Check [SKINTWIND_IMPLEMENTATION_PLAN.md](SKINTWIND_IMPLEMENTATION_PLAN.md) for roadmap
3. Submit issues or pull requests
4. Follow the existing code style

## Resources

### Documentation
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [workerd GitHub](https://github.com/cloudflare/workerd)
- [Cap'n Proto](https://capnproto.org/)

### Examples
- [Generalized Supply Chain Theory](ext/workerd-generalized-scm.md)
- [Workerd Extensions Guide](ext/workerd-extensions-skintwin.md)
- [Burrito Shop Example](ext/workerd-ext/burrito-shop.capnp)

## License

ISC

## Acknowledgments

Built on the excellent workerd runtime by Cloudflare. Inspired by real-world skincare supply chain challenges.