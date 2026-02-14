// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

/**
 * Skintwind implementation using compiled TypeScript types from dist/skincare
 * 
 * This is the internal implementation that uses the SkincareLookup class
 * from the compiled dist/skincare module, providing type-safe operations.
 */

// Import types from the compiled dist (in a real workerd environment, 
// these would be provided as part of the runtime)
// For now, we'll implement the core functionality using plain JavaScript

export class Skintwind {
  #salons;
  #formulations;
  #procedures;

  constructor(data) {
    this.#salons = new Map();
    this.#formulations = data.formulations || [];
    this.#procedures = data.procedures || [];
    
    // Initialize salons from data
    if (data.salons) {
      for (const salonData of data.salons) {
        this.#salons.set(salonData.id, salonData);
      }
    }
  }

  /**
   * Get a salon by ID
   */
  getSalon(id) {
    const salon = this.#salons.get(id);
    if (!salon) {
      throw new Error(`Salon not found: ${id}`);
    }
    return salon;
  }

  /**
   * Get all salons
   */
  getAllSalons() {
    return Array.from(this.#salons.values()).filter(s => s.type === 'salon');
  }

  /**
   * Get production plants/labs
   */
  getLabs() {
    return Array.from(this.#salons.values()).filter(s => s.type === 'production_plant' || s.type === 'lab');
  }

  /**
   * Find salons by specialty
   */
  findSalonsBySpecialty(specialty) {
    return Array.from(this.#salons.values()).filter(
      salon => salon.type === 'salon' && salon.specialties?.includes(specialty)
    );
  }

  /**
   * Query salons with filters
   */
  querySalons(query) {
    let results = Array.from(this.#salons.values()).filter(s => s.type === 'salon');

    if (query.specialty) {
      results = results.filter(salon => 
        salon.specialties?.includes(query.specialty)
      );
    }

    if (query.city) {
      results = results.filter(salon => 
        salon.location?.city === query.city
      );
    }

    if (query.cooperativeId) {
      results = results.filter(salon =>
        salon.cooperativeMemberships?.some(
          m => m.cooperativeId === query.cooperativeId
        )
      );
    }

    if (query.certification) {
      results = results.filter(salon =>
        salon.certifications?.includes(query.certification)
      );
    }

    return results;
  }

  /**
   * Get procedures for a salon
   */
  getSalonProcedures(salonId) {
    return this.#procedures.filter(p => p.salonId === salonId);
  }

  /**
   * Get a specific procedure
   */
  getProcedure(procedureId) {
    const proc = this.#procedures.find(p => p.id === procedureId);
    if (!proc) {
      throw new Error(`Procedure not found: ${procedureId}`);
    }
    return proc;
  }

  /**
   * Find procedures by skin type
   */
  findProceduresBySkinType(skinType) {
    return this.#procedures.filter(p => 
      p.skinTypes.includes(skinType) || p.skinTypes.includes('all')
    );
  }

  /**
   * Find procedures by duration
   */
  findProceduresByDuration(minDuration, maxDuration) {
    return this.#procedures.filter(p => {
      if (minDuration && p.totalDuration < minDuration) return false;
      if (maxDuration && p.totalDuration > maxDuration) return false;
      return true;
    });
  }

  /**
   * Query procedures with filters
   */
  queryProcedures(query) {
    let results = [...this.#procedures];

    if (query.salonId) {
      results = results.filter(p => p.salonId === query.salonId);
    }

    if (query.skinType) {
      results = results.filter(p => 
        p.skinTypes.includes(query.skinType) || p.skinTypes.includes('all')
      );
    }

    if (query.minDuration) {
      results = results.filter(p => p.totalDuration >= query.minDuration);
    }

    if (query.maxDuration) {
      results = results.filter(p => p.totalDuration <= query.maxDuration);
    }

    if (query.maxPrice) {
      results = results.filter(p => p.basePrice <= query.maxPrice);
    }

    return results;
  }

  /**
   * Calculate procedure cost including products
   */
  calculateProcedureCost(procedureId) {
    const procedure = this.getProcedure(procedureId);
    let totalCost = procedure.basePrice;
    
    // Add cost of products used in procedure
    for (const step of procedure.steps) {
      for (const productId of step.products || []) {
        const formulation = this.#formulations.find(f => f.id === productId);
        if (formulation) {
          // Add a percentage of the product cost (e.g., 10% of base price)
          totalCost += formulation.basePrice * 0.1;
        }
      }
    }
    
    return Math.round(totalCost * 100) / 100;
  }

  /**
   * Get a formulation by ID
   */
  getFormulation(formulationId) {
    const formulation = this.#formulations.find(f => f.id === formulationId);
    if (!formulation) {
      throw new Error(`Formulation not found: ${formulationId}`);
    }
    return formulation;
  }

  /**
   * Get all formulations
   */
  getAllFormulations() {
    return this.#formulations;
  }

  /**
   * Find formulations by type
   */
  findFormulationsByType(type) {
    return this.#formulations.filter(f => f.type === type);
  }

  /**
   * Find formulations by skin type
   */
  findFormulationsBySkinType(skinType) {
    return this.#formulations.filter(f => 
      f.skinTypes.includes(skinType) || f.skinTypes.includes('all')
    );
  }

  /**
   * Query formulations with filters
   */
  queryFormulations(query) {
    let results = [...this.#formulations];

    if (query.type) {
      results = results.filter(f => f.type === query.type);
    }

    if (query.skinType) {
      results = results.filter(f => 
        f.skinTypes.includes(query.skinType) || f.skinTypes.includes('all')
      );
    }

    if (query.benefit) {
      results = results.filter(f =>
        f.benefits?.some(b => b.toLowerCase().includes(query.benefit.toLowerCase()))
      );
    }

    if (query.maxPrice) {
      results = results.filter(f => f.basePrice <= query.maxPrice);
    }

    if (query.certification) {
      results = results.filter(f =>
        f.certifications?.includes(query.certification)
      );
    }

    return results;
  }
}
