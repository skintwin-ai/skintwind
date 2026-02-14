/**
 * Formulation types for skincare products
 */
export type FormulationType =
  | 'moisturizer'
  | 'serum'
  | 'cleanser'
  | 'toner'
  | 'mask'
  | 'night_cream'
  | 'eye_cream'
  | 'sunscreen';

/**
 * Skin types that formulations target
 */
export type SkinType =
  | 'all'
  | 'dry'
  | 'oily'
  | 'combination'
  | 'sensitive'
  | 'normal'
  | 'mature'
  | 'acne_prone';

/**
 * Ingredient function categories
 */
export type IngredientFunction =
  | 'base'
  | 'active'
  | 'humectant'
  | 'emollient'
  | 'preservative'
  | 'fragrance'
  | 'soothing'
  | 'hydrating'
  | 'cleansing'
  | 'firming'
  | 'brightening'
  | 'moisturizing';

/**
 * Individual ingredient in a formulation
 */
export interface Ingredient {
  name: string;
  percentage: number;
  function: IngredientFunction;
  cost?: number;
}

/**
 * Product formulation with ingredients and properties
 */
export interface Formulation {
  id: string;
  name: string;
  type: FormulationType;
  ingredients: Ingredient[];
  benefits: string[];
  skinTypes: SkinType[];
  basePrice: number;
  description?: string;
  certifications?: string[];
}

/**
 * Query parameters for finding formulations
 */
export interface FormulationQuery {
  type?: FormulationType;
  skinType?: SkinType;
  benefit?: string;
  maxPrice?: number;
  certification?: string;
}
