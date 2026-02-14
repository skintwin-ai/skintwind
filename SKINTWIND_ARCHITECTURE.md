# 🏗️ Skintwind Architecture & Design Decisions

## Visual Architecture

```
┌───────────────────────────────────────────────────────────────────────────┐
│                     SKINTWIND SYSTEM ARCHITECTURE                          │
└───────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────┐
│  LAYER 3: Workerd Extensions (Edge Computing)                             │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌─────────────────────────┐         ┌────────────────────────────────┐  │
│  │  ext/skintwind/         │         │  ext/skincare-examples/        │  │
│  │  (Unified Extension)    │◄────────│  (5 Progressive Examples)      │  │
│  │                         │         │                                │  │
│  │  • skintwind.js         │         │  01-mobile-therapist/          │  │
│  │  • skintwind-impl.js    │         │  02-small-salon/               │  │
│  │  • skintwind-worker.js  │         │  03-mediclinic/                │  │
│  │  • data/*.json          │         │  04-franchise/                 │  │
│  │  • *.capnp              │         │  05-supply-chain/              │  │
│  └─────────────────────────┘         └────────────────────────────────┘  │
│            │                                      │                        │
│            │ imports                              │ imports                │
│            ▼                                      ▼                        │
└───────────────────────────────────────────────────────────────────────────┘
             │
             │ uses compiled JavaScript
             ▼
┌───────────────────────────────────────────────────────────────────────────┐
│  LAYER 2: Skincare Domain (TypeScript → JavaScript)                       │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌──────────────────────────┐         ┌────────────────────────────────┐ │
│  │  src/skincare/           │ build   │  dist/skincare/                │ │
│  │  (TypeScript Source)     │────────>│  (Compiled JavaScript)         │ │
│  │                          │         │                                │ │
│  │  • types.ts              │         │  • types.js                    │ │
│  │  • actors.ts             │         │  • actors.js                   │ │
│  │  • formulations.ts       │         │  • formulations.js             │ │
│  │  • procedures.ts         │         │  • procedures.js               │ │
│  │  • queries.ts            │         │  • queries.js                  │ │
│  │  • index.ts              │         │  • index.js                    │ │
│  └──────────────────────────┘         └────────────────────────────────┘ │
│            │                                                               │
│            │ extends & imports                                            │
│            ▼                                                               │
└───────────────────────────────────────────────────────────────────────────┘
             │
             │ extends base types
             ▼
┌───────────────────────────────────────────────────────────────────────────┐
│  LAYER 1: Generic Supply Chain Foundation (wodog)                         │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌──────────────────────────┐         ┌────────────────────────────────┐ │
│  │  src/core/               │ build   │  dist/core/                    │ │
│  │  (TypeScript Source)     │────────>│  (Compiled JavaScript)         │ │
│  │                          │         │                                │ │
│  │  • actors.ts             │         │  • actors.js                   │ │
│  │  • products.ts           │         │  • products.js                 │ │
│  │  • relationships.ts      │         │  • relationships.js            │ │
│  │  • lookup.ts             │         │  • lookup.js                   │ │
│  │  • config.ts             │         │  • config.js                   │ │
│  │  • index.ts              │         │  • index.js                    │ │
│  └──────────────────────────┘         └────────────────────────────────┘ │
│                                                                            │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## Type Extension Pattern

### How Generic Types Are Extended

```typescript
┌─────────────────────────────────────────────────────────────────────────┐
│  GENERIC TYPE (src/core/actors.ts)                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  export interface Actor {                                               │
│    id: string;                    ◄─── Base properties                 │
│    name: string;                       (identity, location, capacity)  │
│    type: ActorType;                                                     │
│    location: Location;                                                  │
│    capacities: Capacity[];                                              │
│    pricingRules: PricingRule[];                                         │
│  }                                                                       │
│                                                                          │
│  export type ActorType =                                                │
│    | 'supplier'                                                         │
│    | 'producer'                                                         │
│    | 'distributor'                                                      │
│    | 'wholesaler'                                                       │
│    | 'retailer'                                                         │
│    | 'marketplace';                                                     │
└─────────────────────────────────────────────────────────────────────────┘
                             │
                             │ extends
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  SKINCARE EXTENSION (src/skincare/actors.ts)                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  import { Actor } from '../core/actors';                                │
│                                                                          │
│  export interface Salon extends Actor {                                 │
│    type: 'retailer';              ◄─── Specializes generic type         │
│    subtype: 'salon';              ◄─── NEW: Domain-specific             │
│    specialties: string[];         ◄─── NEW: Skincare-specific           │
│    treatmentRooms: number;        ◄─── NEW: Skincare-specific           │
│    therapists: Therapist[];       ◄─── NEW: Skincare-specific           │
│    certifications: string[];      ◄─── NEW: Skincare-specific           │
│    dailyCapacity: number;         ◄─── NEW: Skincare-specific           │
│                                                                          │
│    // Inherits: id, name, location, capacities, pricingRules            │
│  }                                                                       │
│                                                                          │
│  export interface Therapist {     ◄─── NEW: Skincare-specific type     │
│    id: string;                                                          │
│    name: string;                                                        │
│    certifications: string[];                                            │
│    specialties: string[];                                               │
│    experienceYears: number;                                             │
│  }                                                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Architecture

### Request Flow: Client → Skintwind → Database

```
┌──────────┐
│  Client  │  HTTP Request: GET /skintwind/salons?specialty=facials
└────┬─────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Workerd Extension (ext/skintwind/skintwind-worker.js)              │
├─────────────────────────────────────────────────────────────────────┤
│  • Parse HTTP request                                               │
│  • Route to handler method                                          │
│  • Call: skintwind.findSalonsBySpecialty('facials')                 │
└────┬────────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Skintwind Implementation (ext/skintwind/skintwind-impl.js)         │
├─────────────────────────────────────────────────────────────────────┤
│  import { SkincareQueries } from "../../dist/skincare/queries.js"   │
│                                                                      │
│  this.skincare.findSalonsBySpecialty('facials')                     │
└────┬────────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────────┐
│  SkincareQueries (dist/skincare/queries.js)                         │
├─────────────────────────────────────────────────────────────────────┤
│  async findSalonsBySpecialty(specialty) {                           │
│    const result = await this.lookup.findActors({ type: 'retailer' })│
│    return result.items.filter(a =>                                  │
│      a.subtype === 'salon' &&                                       │
│      a.specialties.includes(specialty)                              │
│    );                                                               │
│  }                                                                   │
└────┬────────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────────┐
│  SupplyChainLookup (dist/core/lookup.js)                            │
├─────────────────────────────────────────────────────────────────────┤
│  async findActors(query) {                                          │
│    // Generic actor lookup logic                                    │
│    // Filters by type, location, capacity, etc.                     │
│    return { items: [...], pagination: {...} };                      │
│  }                                                                   │
└────┬────────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Data Storage (JSON files or KV namespace)                          │
├─────────────────────────────────────────────────────────────────────┤
│  • data/actors.json                                                 │
│  • data/formulations.json                                           │
│  • data/procedures.json                                             │
│  • data/relationships.json                                          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Design Decisions

### Decision 1: Why 3-Layer Architecture?

**Rationale**:
- ✅ **Separation of concerns**: Each layer has single responsibility
- ✅ **Reusability**: Core layer works for any supply chain domain
- ✅ **Type safety**: TypeScript ensures correct extensions
- ✅ **Maintainability**: Changes isolated to relevant layer
- ✅ **Testability**: Unit test each layer independently

**Alternatives Considered**:
- ❌ **Flat structure**: All types in one directory → Hard to maintain
- ❌ **Domain-first**: No generic layer → Code duplication
- ❌ **Microservices**: Separate services → Unnecessary complexity

### Decision 2: Why TypeScript → JavaScript Compilation?

**Rationale**:
- ✅ **Type safety**: Catch errors at compile time
- ✅ **Developer experience**: IDE autocomplete, refactoring
- ✅ **Documentation**: Types serve as documentation
- ✅ **Compatibility**: Workerd requires JavaScript (ES modules)

**Build Process**:
```
src/skincare/*.ts  →  [tsc]  →  dist/skincare/*.js  →  [workerd]
      ↑                              ↓
  Development                   Production
   (TypeScript)                 (JavaScript)
```

### Decision 3: Why Unified Extension vs Multiple Extensions?

**Rationale**:
- ✅ **Single source of truth**: One extension to maintain
- ✅ **Shared logic**: All examples use same code
- ✅ **Consistency**: Same API across all examples
- ✅ **Efficiency**: Load once, use everywhere

**Pattern**:
```
❌ OLD: Each example has own implementation
ext/skincare-examples/01-mobile-therapist/
  ├── therapist.js         ← Duplicate logic
  ├── therapist-impl.js    ← Duplicate logic
  └── ...

✅ NEW: Examples share unified extension
ext/skintwind/
  ├── skintwind.js         ← Single implementation
  ├── skintwind-impl.js    ← Shared logic
  └── ...

ext/skincare-examples/01-mobile-therapist/
  ├── config.capnp         ← Uses skintwind extension
  └── data/                ← Data only
```

### Decision 4: Why SkincareQueries Class?

**Rationale**:
- ✅ **Encapsulation**: Business logic in one place
- ✅ **Composability**: Uses SupplyChainLookup internally
- ✅ **Extensibility**: Easy to add new queries
- ✅ **Testability**: Mock dependencies for unit tests

**Pattern**:
```typescript
// Composition over inheritance
class SkincareQueries {
  private lookup: SupplyChainLookup;  // Compose generic lookup
  
  constructor(lookup: SupplyChainLookup) {
    this.lookup = lookup;
  }
  
  // Skincare-specific queries use generic lookup
  async findSalonsBySpecialty(specialty: string) {
    const actors = await this.lookup.findActors({ type: 'retailer' });
    return actors.items.filter(a => 
      a.subtype === 'salon' && 
      a.specialties.includes(specialty)
    );
  }
}
```

### Decision 5: Why JSON Data Files vs Database?

**Rationale**:
- ✅ **Simplicity**: No database setup required
- ✅ **Version control**: Data changes tracked in git
- ✅ **Portability**: Easy to deploy anywhere
- ✅ **Edge computing**: Data embedded in worker
- ✅ **Fast**: No network calls, loaded at startup

**Future Migration Path**:
```javascript
// Current: JSON files
const actors = JSON.parse(await env.actors.text());

// Future: KV namespace (drop-in replacement)
const actors = JSON.parse(await env.KV.get('actors'));

// Future: D1 database
const actors = await env.DB.prepare('SELECT * FROM actors').all();
```

---

## Type System Design

### Enum Design Principles

**Why Specific Enums?**
- ✅ **Type safety**: Prevent invalid values
- ✅ **Autocomplete**: IDE suggests valid options
- ✅ **Documentation**: Self-documenting code
- ✅ **Validation**: Compile-time checking

**Example**:
```typescript
// ✅ GOOD: Specific enum
export type SkinType = 
  | 'normal' 
  | 'dry' 
  | 'oily' 
  | 'combination' 
  | 'sensitive' 
  | 'acne_prone'
  | 'mature'
  | 'all';

// Usage
const formulation: Formulation = {
  skinTypes: ['dry', 'sensitive'],  // ✅ Type-safe
  // skinTypes: ['invalid'],        // ❌ Compile error
};

// ❌ BAD: Generic string
interface Formulation {
  skinTypes: string[];  // Any string allowed!
}
```

### Interface Design Principles

**Required vs Optional Fields**:
```typescript
export interface Formulation {
  // Required (core identity)
  id: string;
  name: string;
  formulationType: FormulationType;
  ingredients: Ingredient[];
  
  // Required (business critical)
  skinTypes: SkinType[];
  costBreakdown: CostBreakdown;
  recommendedRetailPrice: number;
  
  // Optional (nice-to-have)
  contraindications?: string[];
  certifications?: string[];
}
```

**Rationale**:
- ✅ **Fail fast**: Required fields caught at compile time
- ✅ **Documentation**: Clear what's essential vs optional
- ✅ **Backwards compatibility**: Optional fields can be added later

---

## Query Design Patterns

### Pattern 1: Filter-Based Queries

**Use Case**: Find items matching criteria

```typescript
// Simple filter
findFormulationsBySkinType(skinType: SkinType): Formulation[] {
  return Array.from(this.formulations.values())
    .filter(f => f.skinTypes.includes(skinType));
}

// Multiple filters
findFormulationsByFilters(filters: {
  skinType?: SkinType;
  benefit?: string;
  maxPrice?: number;
}): Formulation[] {
  return Array.from(this.formulations.values())
    .filter(f => {
      if (filters.skinType && !f.skinTypes.includes(filters.skinType)) return false;
      if (filters.benefit && !f.benefits.includes(filters.benefit)) return false;
      if (filters.maxPrice && f.recommendedRetailPrice > filters.maxPrice) return false;
      return true;
    });
}
```

### Pattern 2: Graph-Based Queries

**Use Case**: Find paths through supply chain

```typescript
// Delegate to generic graph algorithms
async findSupplyChainPath(fromId: string, toId: string) {
  return this.lookup.findSupplyChainPath(fromId, toId);
}

// Skincare-specific path
async findIngredientSupplyChain(formulationId: string) {
  const formulation = this.formulations.get(formulationId);
  const paths = [];
  
  for (const ingredient of formulation.ingredients) {
    const suppliers = await this.findSuppliersByIngredient(ingredient.id);
    for (const supplier of suppliers) {
      const path = await this.findSupplyChainPath(supplier.id, formulationId);
      paths.push(path);
    }
  }
  
  return paths;
}
```

### Pattern 3: Aggregation Queries

**Use Case**: Calculate derived values

```typescript
calculateFormulationCost(formulationId: string): CostBreakdown {
  const formulation = this.formulations.get(formulationId);
  
  const ingredientCost = formulation.ingredients.reduce(
    (sum, ing) => sum + (ing.costPerKg * ing.percentage / 100),
    0
  );
  
  const packagingCost = 2.00;  // Fixed for now
  const laborCost = 1.50;
  const overheadCost = ingredientCost * 0.25;  // 25% of ingredients
  
  return {
    ingredients: ingredientCost,
    packaging: packagingCost,
    labor: laborCost,
    overhead: overheadCost,
    total: ingredientCost + packagingCost + laborCost + overheadCost
  };
}
```

---

## Extension Security Model

### Capability-Based Security

**Principle**: Access controlled by bindings, not globals

```capnp
# ✅ GOOD: Explicit bindings
const config :Workerd.Config = (
  services = [
    ( name = "skintwind",
      worker = (
        bindings = [
          # Must explicitly declare each resource
          ( name = "actors", json = embed "data/actors.json" ),
          ( name = "formulations", json = embed "data/formulations.json" ),
          # No access to other files or network
        ],
        compatibilityDate = "2024-02-01"
      ))
  ]
);

# ❌ BAD: Global access (not possible in workerd)
# No fs.readFile()
# No fetch() without explicit binding
# No process.env without explicit binding
```

### Module Visibility

**Pattern**: Public vs internal modules

```capnp
const extension :Workerd.Extension = (
  modules = [
    # Public API (importable by users)
    ( name = "skintwind:api", esModule = embed "skintwind.js" ),
    
    # Internal implementation (hidden from users)
    ( name = "skintwind-internal:impl", 
      esModule = embed "skintwind-impl.js", 
      internal = true ),  # ← Cannot import directly
    
    ( name = "skintwind-internal:queries",
      esModule = embed "queries.js",
      internal = true ),
  ]
);
```

**Rationale**:
- ✅ **Encapsulation**: Hide implementation details
- ✅ **API stability**: Change internals without breaking users
- ✅ **Security**: Prevent access to sensitive code

---

## Performance Considerations

### Data Loading Strategy

**At Startup (Initialization)**:
```javascript
class Skintwind {
  constructor(actors, formulations, procedures, relationships) {
    // Load all data into memory at startup
    actors.forEach(a => this.supplyChain.addActor(a));
    formulations.forEach(f => this.skincare.addFormulation(f));
    // ...
  }
}
```

**Rationale**:
- ✅ **Fast queries**: Data in memory, no I/O
- ✅ **Predictable latency**: <10ms response times
- ✅ **Edge computing**: Data replicated to all edge locations
- ⚠️ **Memory usage**: Limited by worker memory (128 MB default)

**Optimization for Large Datasets**:
```javascript
// Option 1: Lazy loading
async getFormulation(id) {
  if (!this.formulations.has(id)) {
    const data = await this.env.KV.get(`formulation:${id}`);
    this.formulations.set(id, JSON.parse(data));
  }
  return this.formulations.get(id);
}

// Option 2: LRU cache
import { LRUCache } from 'lru-cache';

this.formulationCache = new LRUCache({ max: 1000 });
```

---

## Testing Strategy

### Unit Test Structure

```
test/
├── core/                   # Generic supply chain tests
│   ├── actors.test.ts
│   ├── products.test.ts
│   ├── relationships.test.ts
│   └── lookup.test.ts
│
├── skincare/               # Skincare domain tests
│   ├── actors.test.ts
│   ├── formulations.test.ts
│   ├── procedures.test.ts
│   └── queries.test.ts
│
└── integration/            # End-to-end tests
    ├── skintwind.test.ts
    └── supply-chain.test.ts
```

### Test Coverage Goals

| Layer | Target Coverage | Priority |
|-------|----------------|----------|
| Core (wodog) | >90% | HIGH |
| Skincare domain | >80% | HIGH |
| Extension (JS) | >70% | MEDIUM |
| Integration | Key flows | MEDIUM |

---

## Documentation Standards

### TypeScript Documentation

```typescript
/**
 * Find formulations suitable for a specific skin type.
 * 
 * @param skinType - The skin type to filter by (e.g., 'dry', 'sensitive')
 * @returns Array of formulations suitable for the specified skin type
 * 
 * @example
 * ```typescript
 * const formulations = queries.findFormulationsBySkinType('dry');
 * console.log(`Found ${formulations.length} formulations for dry skin`);
 * ```
 */
findFormulationsBySkinType(skinType: SkinType): Formulation[] {
  return Array.from(this.formulations.values())
    .filter(f => f.skinTypes.includes(skinType));
}
```

### README Standards

Each module should have:
- ✅ **Purpose**: What problem it solves
- ✅ **Usage**: Code examples
- ✅ **API**: Method signatures
- ✅ **Examples**: Real-world scenarios
- ✅ **Testing**: How to run tests

---

## Future Enhancements

### Phase 5: Authentication & Authorization (Future)

```typescript
interface UserContext {
  userId: string;
  role: 'admin' | 'salon_owner' | 'therapist' | 'customer';
  permissions: string[];
}

class Skintwind {
  async findSalonsBySpecialty(specialty: string, context: UserContext) {
    // Check permissions
    if (!context.permissions.includes('view_salons')) {
      throw new Error('Unauthorized');
    }
    
    // Filter based on role
    const salons = await this.skincare.findSalonsBySpecialty(specialty);
    
    if (context.role === 'salon_owner') {
      // Only show own salons
      return salons.filter(s => s.ownerId === context.userId);
    }
    
    return salons;
  }
}
```

### Phase 6: Real-time Updates (Future)

```typescript
// WebSocket support for live updates
class Skintwind {
  async subscribeToFormulationUpdates(formulationId: string, callback: (f: Formulation) => void) {
    // Listen to KV namespace changes
    await this.env.KV.watch(`formulation:${formulationId}`, callback);
  }
}
```

### Phase 7: Advanced Analytics (Future)

```typescript
class SkincareAnalytics {
  calculatePopularIngredients(): Map<string, number>;
  calculateAverageCosts(formulationType: FormulationType): number;
  calculateMarginDistribution(): Distribution;
  identifyFormulationTrends(): Trend[];
}
```

---

## Conclusion

This architecture provides:
- ✅ **Scalability**: From 1 actor to 1000s
- ✅ **Maintainability**: Clear separation of concerns
- ✅ **Type Safety**: TypeScript catches errors early
- ✅ **Performance**: Edge computing, <50ms latency
- ✅ **Security**: Capability-based model
- ✅ **Extensibility**: Easy to add new domains

**Ready to implement? Start with**:
1. Create `src/skincare/types.ts`
2. Define enums (SkinType, FormulationType, etc.)
3. Build from there!

Refer to:
- **[Implementation Guide](SKINTWIND_IMPLEMENTATION_GUIDE.md)** for detailed steps
- **[Quick Reference](SKINTWIND_QUICK_REFERENCE.md)** for quick lookups
