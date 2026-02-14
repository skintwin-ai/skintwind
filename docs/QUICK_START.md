# Skintwind Quick Start Guide

Get up and running with Skintwind in 15 minutes.

## What is Skintwind?

Skintwind is a **skincare supply chain application** built on Cloudflare Workers (workerd). It demonstrates how to model complex supply chains from simple single-operator businesses to multi-tier networks with 12+ actors.

**Three layers working together:**
1. **Generic supply chain** (`wodog` library) - Works for any supply chain
2. **Skincare domain models** - Salons, formulations, procedures
3. **Workerd extensions** - Deploy to edge computing

## Prerequisites

- Node.js 18+ 
- NPM or Yarn
- (Optional) Cloudflare account for deployment
- (Optional) workerd runtime for local testing

## Installation

### Option 1: Use as NPM Package (Coming Soon)

```bash
npm install wodog
```

### Option 2: Clone and Build from Source

```bash
# Clone repository
git clone https://github.com/your-org/skintwind.git
cd skintwind

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests
npm test
```

## Five-Minute Tutorial: Mobile Therapist

The simplest example - a single mobile therapist offering basic treatments.

### 1. View the Example

```bash
cd ext/skincare-examples/01-mobile-therapist
cat README.md
```

### 2. Understand the Data

```json
// therapist.json
{
  "id": "therapist-sarah",
  "name": "Sarah's Mobile Beauty",
  "type": "mobile_therapist",
  "specialties": ["facials", "massage", "waxing"],
  "dailyCapacity": 4,
  "location": {
    "city": "Portland",
    "serviceArea": "Portland Metro"
  }
}
```

### 3. View Available Procedures

```json
// procedures.json
[
  {
    "id": "basic-facial",
    "name": "Basic Facial",
    "duration": 60,
    "steps": ["cleanse", "exfoliate", "massage", "mask", "moisturize"]
  }
]
```

### 4. Run Locally (if you have workerd)

```bash
# From skintwind root directory
bazel run //src/workerd/server:workerd -- serve \
  $(pwd)/ext/skincare-examples/01-mobile-therapist/config.capnp
```

### 5. Query the API

```bash
# Get therapist info
curl http://localhost:8080/therapist/therapist-sarah

# List procedures
curl http://localhost:8080/procedures

# Get specific procedure
curl http://localhost:8080/procedure/basic-facial
```

**Expected response:**
```json
{
  "id": "therapist-sarah",
  "name": "Sarah's Mobile Beauty",
  "specialties": ["facials", "massage", "waxing"],
  "dailyCapacity": 4
}
```

## Fifteen-Minute Tutorial: Supply Chain

The most complex example - 12 actors across 4 tiers with path-finding.

### 1. Navigate to Example

```bash
cd ext/skincare-examples/05-supply-chain
cat README.md
```

### 2. Understand the Network

```
Suppliers (3)
  └→ Producers (3)
      └→ Distributors (3)
          └→ Salons (3)

Example path:
Botanical Extracts → PureSkin Labs → BeautyChain → Luxe Spa
```

### 3. View the Actors

```bash
cat actors.json | jq '.actors | length'
# Output: 12

cat actors.json | jq '.actors[] | select(.type=="supplier") | .name'
# Output: 
# "Botanical Extracts International"
# "Active Ingredients Corp"
# "Essential Oils & Aromatics"
```

### 4. View Relationships

```bash
cat relationships.json | jq '.relationships | length'
# Output: ~20-30 relationships

cat relationships.json | jq '.relationships[] | select(.type=="supplies")'
# Shows all supplier → producer relationships
```

### 5. Run the Supply Chain

```bash
# From skintwind root
bazel run //src/workerd/server:workerd -- serve \
  $(pwd)/ext/skincare-examples/05-supply-chain/supply-chain-config.capnp
```

### 6. Query the Network

```bash
# List all actors
curl http://localhost:8080/actors

# Find suppliers
curl http://localhost:8080/actors?type=supplier

# Find path from supplier to salon
curl -X POST http://localhost:8080/supply-chain/path \
  -H "Content-Type: application/json" \
  -d '{
    "fromId": "supplier-botanical",
    "toId": "salon-luxe"
  }'
```

**Expected response:**
```json
{
  "path": [
    "supplier-botanical",
    "producer-pureskin",
    "distributor-beautychain",
    "salon-luxe"
  ],
  "length": 4,
  "relationships": [
    { "from": "supplier-botanical", "to": "producer-pureskin", "type": "supplies" },
    { "from": "producer-pureskin", "to": "distributor-beautychain", "type": "produces_for" },
    { "from": "distributor-beautychain", "to": "salon-luxe", "type": "distributes_to" }
  ]
}
```

## Using the TypeScript Library

### Import and Use wodog

```typescript
import { SupplyChainLookup, Supplier, Producer } from 'wodog';

// Create lookup service
const lookup = new SupplyChainLookup();

// Add a supplier
const supplier: Supplier = {
  id: 's1',
  name: 'Botanical Extracts',
  type: 'supplier',
  capacities: [
    { type: 'storage', value: 10000, unit: 'kg' }
  ],
  pricingRules: [
    {
      id: 'pr1',
      name: 'Bulk Discount',
      type: 'tiered',
      tiers: [
        { minQuantity: 0, maxQuantity: 100, price: 50 },
        { minQuantity: 100, price: 45 }
      ]
    }
  ],
  cooperativeMemberships: [],
  rawMaterialTypes: ['aloe', 'chamomile']
};

lookup.addActor(supplier);

// Query suppliers
const suppliers = await lookup.findActors({ type: 'supplier' });
console.log('Suppliers:', suppliers.items);

// Add a producer
const producer: Producer = {
  id: 'p1',
  name: 'PureSkin Labs',
  type: 'producer',
  capacities: [
    { type: 'production', value: 100000, unit: 'units/month' }
  ],
  pricingRules: [],
  cooperativeMemberships: [],
  productionCapacity: { value: 100000, unit: 'units/month' },
  certifications: ['GMP', 'ISO9001']
};

lookup.addActor(producer);

// Add relationship
lookup.addRelationship({
  id: 'r1',
  type: 'supplies',
  fromActorId: 's1',
  toActorId: 'p1',
  status: 'active',
  contractTerms: {
    startDate: '2024-01-01',
    paymentTerms: 'Net 30',
    deliveryTerms: '2-5 business days'
  }
});

// Find path
const path = await lookup.findSupplyChainPath('s1', 'p1');
console.log('Path:', path);
// Output: ['s1', 'p1']
```

### Skincare-Specific Types (Coming Soon)

```typescript
import { Salon, Formulation, Procedure } from 'wodog/skincare';

const salon: Salon = {
  id: 'salon1',
  name: 'Luxe Spa',
  type: 'salon',
  specialties: ['facials', 'peels', 'massage'],
  treatmentRooms: 12,
  therapists: 18,
  certifications: ['CIDESCO', 'CIBTAC'],
  dailyCapacity: 50,
  capacities: [],
  pricingRules: [],
  cooperativeMemberships: []
};

const formulation: Formulation = {
  id: 'form1',
  name: 'Hydrating Serum',
  type: 'serum',
  ingredients: [
    { name: 'Hyaluronic Acid', percentage: 2, supplier: 's1' },
    { name: 'Aloe Vera', percentage: 10, supplier: 's1' },
    { name: 'Water', percentage: 88 }
  ],
  skinTypes: ['dry', 'normal', 'combination'],
  cost: 12.50
};

const procedure: Procedure = {
  id: 'proc1',
  name: 'Hydration Facial',
  salonId: 'salon1',
  duration: 60,
  steps: [
    { action: 'cleanse', duration: 10 },
    { action: 'exfoliate', duration: 10 },
    { action: 'apply serum', duration: 5, productId: 'form1' },
    { action: 'massage', duration: 20 },
    { action: 'mask', duration: 10 },
    { action: 'moisturize', duration: 5 }
  ],
  cost: 85.00
};
```

## Progressive Learning Path

Work through examples in order:

### Level 1: Mobile Therapist ⭐
- **Complexity**: Simplest
- **Concepts**: Basic actor, procedures
- **Time**: 5 minutes
- **Location**: `ext/skincare-examples/01-mobile-therapist/`

### Level 2: Small Salon ⭐⭐
- **Complexity**: Small business
- **Concepts**: Products, formulations, cost calculation
- **Time**: 10 minutes
- **Location**: `ext/skincare-examples/02-small-salon/`

### Level 3: Mediclinic ⭐⭐⭐
- **Complexity**: Medical facility
- **Concepts**: Medical workflows, compliance
- **Time**: 15 minutes
- **Location**: `ext/skincare-examples/03-mediclinic/`

### Level 4: Franchise ⭐⭐⭐⭐
- **Complexity**: Multi-location
- **Concepts**: Relationships, aggregation
- **Time**: 20 minutes
- **Location**: `ext/skincare-examples/04-franchise/`

### Level 5: Supply Chain ⭐⭐⭐⭐⭐
- **Complexity**: Full network
- **Concepts**: Graph algorithms, path-finding
- **Time**: 30 minutes
- **Location**: `ext/skincare-examples/05-supply-chain/`

## Common Use Cases

### 1. Single Business Owner

**Scenario**: You own a small salon and want to track procedures and products.

**Use**: Level 2 example (Small Salon)

```bash
cd ext/skincare-examples/02-small-salon
# Customize salon.json with your business details
# Customize formulations.json with your products
# Customize procedures.json with your services
```

### 2. Medical Spa Network

**Scenario**: You operate multiple medical spas with shared product lines.

**Use**: Level 4 example (Franchise)

```bash
cd ext/skincare-examples/04-franchise
# Add your locations to actors.json
# Define relationships between locations
# Share product catalog
```

### 3. Skincare Brand with Production

**Scenario**: You manufacture skincare products and distribute to salons.

**Use**: Level 5 example (Supply Chain)

```bash
cd ext/skincare-examples/05-supply-chain
# Model your supply chain actors
# Define relationships
# Track product flow
```

### 4. Custom Supply Chain

**Scenario**: You have a unique supply chain not covered by examples.

**Use**: wodog library directly

```typescript
import { SupplyChainLookup } from 'wodog';

// Build your custom supply chain
const lookup = new SupplyChainLookup();
// ... add your actors and relationships
```

## Key Concepts

### Actors

Entities in the supply chain:
- **Supplier**: Provides raw materials
- **Producer**: Manufactures products
- **Distributor**: Handles logistics
- **Wholesaler**: Sells in bulk
- **Retailer**: Sells to consumers
- **Marketplace**: Multi-vendor platform
- **Salon**: End-point service provider (skincare-specific)
- **MedSpa**: Medical aesthetic facility (skincare-specific)

### Relationships

Connections between actors:
- **supplies**: Supplier → Producer
- **produces_for**: Producer → Distributor
- **distributes_to**: Distributor → Retailer
- **sells_to**: Wholesaler → Retailer
- **partners_with**: Any ↔ Any
- **competes_with**: Any ↔ Any

### Queries

Find entities by criteria:
```typescript
// Find by type
lookup.findActors({ type: 'supplier' })

// Find by name
lookup.findActors({ name: 'PureSkin' })

// Find by cooperative
lookup.findActors({ cooperativeId: 'coop1' })

// Find path between actors
lookup.findSupplyChainPath('s1', 'r1')
```

### Capabilities

What the system can do:
- ✅ Model any supply chain topology
- ✅ Find shortest paths (BFS algorithm)
- ✅ Find all paths (DFS algorithm)
- ✅ Query actors by multiple criteria
- ✅ Track products and services
- ✅ Calculate costs and capacities
- ✅ Manage cooperative memberships
- ✅ Paginate large result sets

## API Endpoints (Workers)

When running as a Cloudflare Worker, common endpoints:

```bash
# Get all actors
GET /actors
GET /actors?type=supplier
GET /actors?cooperativeId=coop1

# Get specific actor
GET /actor/{id}

# Find supply chain path
POST /supply-chain/path
Body: { "fromId": "s1", "toId": "r1" }

# Get products
GET /products
GET /products?category=finished_good

# Get formulations (skincare)
GET /formulations
GET /formulations?skinType=dry

# Get procedures (skincare)
GET /procedures
GET /procedures?salonId=salon1
```

## Configuration

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "node",
    "outDir": "./dist",
    "declaration": true,
    "strict": true
  }
}
```

### Workerd Configuration

```capnp
# config.capnp
using Workerd = import "/workerd/workerd.capnp";
using Skintwind = import "skintwind.capnp";

const config :Workerd.Config = (
  services = [ (name = "main", worker = .worker) ],
  sockets = [ ( name = "http", address = "*:8080", http = (), service = "main" ) ],
  extensions = [ Skintwind.extension ],
);
```

## Deployment

### Deploy to Cloudflare Workers

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login
wrangler login

# Deploy
wrangler publish
```

### Environment Configuration

```toml
# wrangler.toml
name = "skintwind-app"
main = "dist/worker.js"
compatibility_date = "2024-01-01"

[env.production]
name = "skintwind-prod"

[env.staging]
name = "skintwind-staging"
```

## Troubleshooting

### Issue: TypeScript compilation errors

```bash
# Clear build cache
rm -rf dist/
npm run build
```

### Issue: Module not found in workerd

**Problem**: workerd can't find internal modules

**Solution**: Check that internal modules are marked `internal = true` in `.capnp` file:

```capnp
( name = "skintwind-internal:impl", esModule = embed "impl.js", internal = true )
```

### Issue: Binding not found in worker

**Problem**: `env.skintwind` is undefined

**Solution**: Check binding configuration in config.capnp:

```capnp
bindings = [
  ( name = "skintwind",
    wrapped = (
      moduleName = "skintwind:binding",
      innerBindings = [ ... ]
    )
  )
]
```

### Issue: Path not found between actors

**Problem**: `findSupplyChainPath` returns null

**Solution**: Ensure relationships exist connecting the actors:

```typescript
// Check if relationship exists
const rel = lookup.findRelationships({ 
  fromActorId: 's1', 
  toActorId: 'p1' 
});
console.log('Relationships:', rel);
```

## Next Steps

### Learn More
- Read [Architecture Documentation](./ARCHITECTURE.md)
- Read [Implementation Plan](../SKINTWIND_IMPLEMENTATION_PLAN.md)
- Explore [Example READMEs](../ext/skincare-examples/)

### Customize
- Modify data files (JSON) to match your business
- Add new actor types
- Create custom relationships
- Build new query functions

### Deploy
- Deploy to Cloudflare Workers
- Set up CI/CD pipeline
- Configure monitoring
- Add authentication

### Contribute
- Report issues on GitHub
- Submit pull requests
- Share your examples
- Write documentation

## Resources

### Documentation
- [Architecture Overview](./ARCHITECTURE.md)
- [API Reference](./api/) (coming soon)
- [Tutorial Series](./tutorials/) (coming soon)

### Examples
- [Mobile Therapist](../ext/skincare-examples/01-mobile-therapist/)
- [Small Salon](../ext/skincare-examples/02-small-salon/)
- [Mediclinic](../ext/skincare-examples/03-mediclinic/)
- [Franchise](../ext/skincare-examples/04-franchise/)
- [Supply Chain](../ext/skincare-examples/05-supply-chain/)

### External Resources
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [workerd GitHub](https://github.com/cloudflare/workerd)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Getting Help

- **GitHub Issues**: Report bugs or request features
- **Discussions**: Ask questions and share ideas
- **Stack Overflow**: Tag questions with `skintwind` or `wodog`

## Summary

You now know how to:
- ✅ Run simple examples (mobile therapist)
- ✅ Run complex examples (supply chain)
- ✅ Use the wodog library
- ✅ Query actors and relationships
- ✅ Find paths through supply chains
- ✅ Deploy to Cloudflare Workers
- ✅ Customize for your business

**Ready to build?** Start with the mobile therapist example and work your way up!

```bash
cd ext/skincare-examples/01-mobile-therapist
cat README.md
```

Happy coding! 🚀
