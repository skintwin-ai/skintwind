import { Actor, Capacity, CooperativeMembership, PricingRule } from '../actors';

/**
 * Skincare-specific actor types
 */
export type SkincareActorType = 
  | 'salon'
  | 'medspa' 
  | 'lab'
  | 'supplier';

/**
 * Location information for skincare actors
 */
export interface Location {
  address: string;
  city: string;
  state: string;
  country: string;
}

/**
 * Operating hours
 */
export interface OperatingHours {
  weekdays: string;
  weekends: string;
}

/**
 * Base skincare actor extending generic Actor
 */
export interface SkincareActor extends Omit<Actor, 'type'> {
  type: SkincareActorType;
  location?: Location;
  operatingHours?: OperatingHours;
  certifications?: string[];
}

/**
 * Salon actor - treatment facility
 */
export interface Salon extends SkincareActor {
  type: 'salon';
  specialties: string[];
}

/**
 * Medical Spa actor - medical-grade treatments
 */
export interface MedSpa extends SkincareActor {
  type: 'medspa';
  specialties: string[];
  medicalStaff?: {
    doctors?: number;
    nurses?: number;
  };
}

/**
 * Production Lab actor - product manufacturing
 */
export interface Lab extends SkincareActor {
  type: 'lab';
  productionTypes: string[];
  gmpCertified?: boolean;
}

/**
 * Skincare Supplier - raw materials
 */
export interface SkincareSupplier extends SkincareActor {
  type: 'supplier';
  ingredientTypes: string[];
}

/**
 * Union type for all skincare actors
 */
export type SkincareActorUnion = Salon | MedSpa | Lab | SkincareSupplier;
