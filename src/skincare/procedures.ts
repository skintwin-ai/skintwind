import { SkinType } from './formulations';

/**
 * Procedure/Treatment types
 */
export type ProcedureType =
  | 'facial'
  | 'chemical_peel'
  | 'microdermabrasion'
  | 'massage'
  | 'LED_treatment'
  | 'laser_therapy'
  | 'body_treatment'
  | 'consultation';

/**
 * Individual step in a procedure
 */
export interface ProcedureStep {
  order: number;
  name: string;
  duration: number; // minutes
  products: string[]; // formulation IDs
  equipment?: string[];
}

/**
 * Complete procedure/treatment definition
 */
export interface Procedure {
  id: string;
  salonId: string;
  name: string;
  type?: ProcedureType;
  steps: ProcedureStep[];
  totalDuration: number; // minutes
  basePrice: number;
  skinTypes: SkinType[];
  description?: string;
  contraindications?: string[];
  requirements?: {
    medicalClearance?: boolean;
    downtime?: number;
  };
}

/**
 * Query parameters for finding procedures
 */
export interface ProcedureQuery {
  salonId?: string;
  type?: ProcedureType;
  skinType?: SkinType;
  minDuration?: number;
  maxDuration?: number;
  maxPrice?: number;
}
