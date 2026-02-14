/**
 * Skintwind - Skincare Domain Types
 * 
 * Core type definitions for the skincare supply chain domain.
 * These types extend the generic wodog supply chain foundation.
 * 
 * @module skincare/types
 */

// ============================================================================
// ENUMS - Domain Classifications
// ============================================================================

/**
 * Skin type classifications used in skincare formulation
 * 
 * @remarks
 * Based on dermatological skin type classification systems.
 * 'all' indicates product suitable for all skin types.
 */
export type SkinType = 
  | 'normal'       // Balanced, neither too dry nor too oily
  | 'dry'          // Lacks moisture, may be flaky or tight
  | 'oily'         // Excess sebum production, shiny appearance
  | 'combination'  // Mixed characteristics (e.g., oily T-zone, dry cheeks)
  | 'sensitive'    // Prone to irritation and reactions
  | 'acne_prone'   // Tendency toward breakouts and blemishes
  | 'mature'       // Aging skin with reduced elasticity
  | 'all';         // Suitable for all skin types

/**
 * Formulation type classifications
 * 
 * @remarks
 * Common skincare product categories based on texture and application.
 */
export type FormulationType = 
  | 'cleanser'      // Face wash, cleansing gel, cleansing oil
  | 'toner'         // Astringent, refreshing lotion
  | 'serum'         // Concentrated treatment, lightweight
  | 'moisturizer'   // Face cream, lotion, day/night cream
  | 'mask'          // Clay mask, sheet mask, peel-off mask
  | 'sunscreen'     // SPF protection product
  | 'eye_cream'     // Specialized eye area treatment
  | 'body_lotion';  // Body moisturizer, body butter

/**
 * Ingredient functional categories
 * 
 * @remarks
 * Based on cosmetic ingredient function classification.
 * Ingredients can belong to multiple categories.
 */
export type IngredientCategory =
  | 'active'              // Functional actives (retinol, vitamin C, niacinamide)
  | 'humectant'           // Water-binding (hyaluronic acid, glycerin)
  | 'emollient'           // Skin-softening (oils, butters, squalane)
  | 'emulsifier'          // Blend oil and water (lecithin, cetearyl alcohol)
  | 'preservative'        // Antimicrobial (phenoxyethanol, parabens)
  | 'fragrance'           // Scent (essential oils, synthetic fragrance)
  | 'colorant'            // Pigments and dyes
  | 'thickener'           // Viscosity modifier (xanthan gum, carbomer)
  | 'pH_adjuster'         // pH control (citric acid, sodium hydroxide)
  | 'antioxidant'         // Oxidation prevention (vitamin E, BHT)
  | 'botanical_extract';  // Plant-derived extracts (aloe, chamomile)

/**
 * Skincare procedure/treatment types
 * 
 * @remarks
 * Common skincare services offered by salons and medical spas.
 */
export type ProcedureType =
  | 'facial'              // Classic facial treatment
  | 'peel'                // Chemical exfoliation (AHA, BHA, TCA)
  | 'microdermabrasion'   // Mechanical exfoliation
  | 'led_therapy'         // Light therapy (red, blue, near-infrared)
  | 'massage'             // Face or body massage
  | 'body_treatment'      // Body wrap, scrub, polish
  | 'consultation'        // Skin analysis, treatment planning
  | 'laser'               // Laser treatments (requires medical supervision)
  | 'injection';          // Injectables (requires medical license)

// ============================================================================
// BASIC STRUCTURES - Supporting Types
// ============================================================================

/**
 * Business operating hours for a salon or spa
 */
export interface BusinessHours {
  monday: TimeRange;
  tuesday: TimeRange;
  wednesday: TimeRange;
  thursday: TimeRange;
  friday: TimeRange;
  saturday: TimeRange;
  sunday: TimeRange;
}

/**
 * Time range for business hours or appointment slots
 */
export interface TimeRange {
  /** Opening time in 24-hour format (e.g., "09:00") */
  open: string;
  
  /** Closing time in 24-hour format (e.g., "18:00") */
  close: string;
  
  /** Whether the business is closed on this day */
  closed?: boolean;
}

/**
 * Price range for services or products
 */
export interface PriceRange {
  /** Minimum price */
  min: number;
  
  /** Maximum price */
  max: number;
  
  /** Currency code (ISO 4217) */
  currency: string;
}

/**
 * Geographic coordinates for location-based queries
 */
export interface GeoLocation {
  /** Latitude in decimal degrees */
  latitude: number;
  
  /** Longitude in decimal degrees */
  longitude: number;
  
  /** Optional radius for proximity searches (in kilometers) */
  radius?: number;
}

/**
 * Contact information
 */
export interface ContactInfo {
  /** Phone number */
  phone?: string;
  
  /** Email address */
  email?: string;
  
  /** Website URL */
  website?: string;
  
  /** Social media handles */
  social?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
}

// ============================================================================
// CERTIFICATION & COMPLIANCE
// ============================================================================

/**
 * Industry certifications and standards
 */
export type CertificationType =
  | 'ISO9001'              // Quality management
  | 'ISO22716'             // Cosmetic GMP (Good Manufacturing Practice)
  | 'ECOCERT'              // Organic certification
  | 'COSMOS'               // Cosmetic organic standard
  | 'NATRUE'               // Natural cosmetics certification
  | 'vegan'                // No animal-derived ingredients
  | 'cruelty_free'         // No animal testing
  | 'organic_certified'    // Organic ingredients
  | 'pharmaceutical_grade' // Pharma-grade ingredients
  | 'FDA_registered'       // FDA facility registration
  | 'GMP_certified'        // Good Manufacturing Practice
  | 'CIDESCO'              // Therapist qualification
  | 'ITEC'                 // Therapist qualification
  | 'SAAHSP'               // South African Allied Health Service Professions Board
  | string;                // Allow custom certifications

/**
 * Regulatory compliance status by region
 */
export interface RegulatoryCompliance {
  /** EU Cosmetics Regulation (EC) No 1223/2009 */
  eu: ComplianceStatus;
  
  /** USA FDA cosmetic regulations */
  usa: ComplianceStatus;
  
  /** Additional regional compliance (e.g., ASEAN, China) */
  other?: Record<string, ComplianceStatus>;
}

/**
 * Compliance status for a regulatory region
 */
export type ComplianceStatus =
  | 'compliant'    // Approved for use
  | 'restricted'   // Allowed with restrictions (concentration limits, warnings)
  | 'banned'       // Not permitted
  | 'pending';     // Under review

// ============================================================================
// COST & PRICING
// ============================================================================

/**
 * Detailed cost breakdown for formulations or procedures
 */
export interface CostBreakdown {
  /** Raw ingredient costs */
  ingredients: number;
  
  /** Packaging costs (bottles, jars, labels) */
  packaging: number;
  
  /** Labor costs for formulation/manufacturing */
  labor: number;
  
  /** Overhead costs (facility, utilities, equipment) */
  overhead: number;
  
  /** Total cost (sum of all components) */
  total: number;
  
  /** Currency code */
  currency?: string;
}

/**
 * Margin analysis for products
 */
export interface MarginAnalysis {
  /** Cost of goods sold (COGS) */
  cogs: number;
  
  /** Recommended retail price */
  retailPrice: number;
  
  /** Gross profit (retailPrice - cogs) */
  grossProfit: number;
  
  /** Gross margin percentage */
  marginPercentage: number;
  
  /** Markup percentage ((retailPrice / cogs) - 1) * 100 */
  markupPercentage: number;
}

// ============================================================================
// QUERY FILTERS
// ============================================================================

/**
 * Filter options for formulation queries
 */
export interface FormulationFilters {
  /** Filter by skin type */
  skinType?: SkinType;
  
  /** Filter by formulation type */
  formulationType?: FormulationType;
  
  /** Filter by benefit keyword */
  benefit?: string;
  
  /** Filter by ingredient ID or INCI name */
  ingredient?: string;
  
  /** Minimum price */
  minPrice?: number;
  
  /** Maximum price */
  maxPrice?: number;
  
  /** Must have certifications */
  certifications?: CertificationType[];
  
  /** Exclude contraindications */
  excludeContraindications?: string[];
}

/**
 * Filter options for salon queries
 */
export interface SalonFilters {
  /** Filter by specialty */
  specialty?: string;
  
  /** Filter by certification */
  certification?: CertificationType;
  
  /** Filter by location (with radius) */
  location?: GeoLocation;
  
  /** Minimum daily capacity */
  minCapacity?: number;
  
  /** Must have minimum number of therapists */
  minTherapists?: number;
  
  /** Price range filter */
  priceRange?: {
    min: number;
    max: number;
  };
}

/**
 * Filter options for procedure queries
 */
export interface ProcedureFilters {
  /** Filter by procedure type */
  procedureType?: ProcedureType;
  
  /** Maximum duration in minutes */
  maxDuration?: number;
  
  /** Suitable for skin type */
  skinType?: SkinType;
  
  /** Maximum price */
  maxPrice?: number;
  
  /** Required therapist certifications */
  requiredCertifications?: CertificationType[];
}

// ============================================================================
// PAGINATION & RESULTS
// ============================================================================

/**
 * Pagination metadata for query results
 */
export interface PaginationInfo {
  /** Current page number (1-indexed) */
  page: number;
  
  /** Number of items per page */
  pageSize: number;
  
  /** Total number of items across all pages */
  totalItems: number;
  
  /** Total number of pages */
  totalPages: number;
  
  /** Whether there is a next page */
  hasNextPage: boolean;
  
  /** Whether there is a previous page */
  hasPreviousPage: boolean;
}

/**
 * Generic paginated query result
 */
export interface PaginatedResult<T> {
  /** Result items for current page */
  items: T[];
  
  /** Pagination metadata */
  pagination: PaginationInfo;
  
  /** Optional metadata about the query */
  metadata?: Record<string, any>;
}

// ============================================================================
// VALIDATION RESULTS
// ============================================================================

/**
 * Validation result for formulations or procedures
 */
export interface ValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  
  /** List of validation errors */
  errors: ValidationError[];
  
  /** List of validation warnings (non-blocking) */
  warnings: ValidationWarning[];
}

/**
 * Validation error (blocks action)
 */
export interface ValidationError {
  /** Error code for programmatic handling */
  code: string;
  
  /** Human-readable error message */
  message: string;
  
  /** Field or property that caused the error */
  field?: string;
  
  /** Severity level */
  severity: 'error';
}

/**
 * Validation warning (informational)
 */
export interface ValidationWarning {
  /** Warning code */
  code: string;
  
  /** Human-readable warning message */
  message: string;
  
  /** Field or property related to warning */
  field?: string;
  
  /** Severity level */
  severity: 'warning';
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Type guard: Check if value is a valid SkinType
 */
export function isSkinType(value: any): value is SkinType {
  return [
    'normal', 'dry', 'oily', 'combination', 
    'sensitive', 'acne_prone', 'mature', 'all'
  ].includes(value);
}

/**
 * Type guard: Check if value is a valid FormulationType
 */
export function isFormulationType(value: any): value is FormulationType {
  return [
    'cleanser', 'toner', 'serum', 'moisturizer',
    'mask', 'sunscreen', 'eye_cream', 'body_lotion'
  ].includes(value);
}

/**
 * Type guard: Check if value is a valid IngredientCategory
 */
export function isIngredientCategory(value: any): value is IngredientCategory {
  return [
    'active', 'humectant', 'emollient', 'emulsifier',
    'preservative', 'fragrance', 'colorant', 'thickener',
    'pH_adjuster', 'antioxidant', 'botanical_extract'
  ].includes(value);
}

/**
 * Type guard: Check if value is a valid ProcedureType
 */
export function isProcedureType(value: any): value is ProcedureType {
  return [
    'facial', 'peel', 'microdermabrasion', 'led_therapy',
    'massage', 'body_treatment', 'consultation', 'laser', 'injection'
  ].includes(value);
}
