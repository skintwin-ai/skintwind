import { SupplyChainLookup, LookupResult, ActorQuery } from '../lookup';
import { SkincareActorUnion, SkincareActorType, Salon, MedSpa, Lab, SkincareActor } from './actors';
import { Formulation, FormulationQuery, SkinType } from './formulations';
import { Procedure, ProcedureQuery } from './procedures';

/**
 * Paginated result alias for convenience
 */
export type PaginatedResult<T> = LookupResult<T>;

/**
 * Extended query for skincare actors
 */
export interface SkincareActorQuery extends ActorQuery {
  skincareType?: SkincareActorType;
  specialty?: string;
  city?: string;
  certification?: string;
}

/**
 * Skincare-specific lookup service extending the generic supply chain lookup
 */
export class SkincareLookup extends SupplyChainLookup {
  private formulations: Formulation[] = [];
  private procedures: Procedure[] = [];

  /**
   * Initialize with formulations and procedures
   */
  initializeSkincareData(data: {
    formulations?: Formulation[];
    procedures?: Procedure[];
  }) {
    if (data.formulations) {
      this.formulations = data.formulations;
    }
    if (data.procedures) {
      this.procedures = data.procedures;
    }
  }

  /**
   * Find salons with optional filtering
   */
  async findSalons(
    query?: Partial<SkincareActorQuery>,
    page: number = 1,
    pageSize: number = 30
  ): Promise<PaginatedResult<Salon>> {
    const actorQuery = { ...query, skincareType: 'salon' as SkincareActorType };
    const result = await this.findSkincareActors(actorQuery, page, pageSize);
    return result as PaginatedResult<Salon>;
  }

  /**
   * Find medical spas with optional filtering
   */
  async findMedSpas(
    query?: Partial<SkincareActorQuery>,
    page: number = 1,
    pageSize: number = 30
  ): Promise<PaginatedResult<MedSpa>> {
    const actorQuery = { ...query, skincareType: 'medspa' as SkincareActorType };
    const result = await this.findSkincareActors(actorQuery, page, pageSize);
    return result as PaginatedResult<MedSpa>;
  }

  /**
   * Find labs with optional filtering
   */
  async findLabs(
    query?: Partial<SkincareActorQuery>,
    page: number = 1,
    pageSize: number = 30
  ): Promise<PaginatedResult<Lab>> {
    const actorQuery = { ...query, skincareType: 'lab' as SkincareActorType };
    const result = await this.findSkincareActors(actorQuery, page, pageSize);
    return result as PaginatedResult<Lab>;
  }

  /**
   * Generic skincare actor search
   */
  async findSkincareActors(
    query: Partial<SkincareActorQuery>,
    page: number = 1,
    pageSize: number = 30
  ): Promise<PaginatedResult<SkincareActor>> {
    // Use the parent class method to get actors, then filter by skincare-specific criteria
    const baseQuery: ActorQuery = {
      type: query.skincareType as any,
      name: query.name,
      cooperativeId: query.cooperativeId
    };
    
    const result = await this.findActors(baseQuery, page, pageSize);
    
    // Additional skincare-specific filtering
    let filteredItems = result.items as SkincareActor[];
    
    if (query.specialty) {
      filteredItems = filteredItems.filter(actor => {
        const skincareActor = actor as SkincareActor;
        if ('specialties' in skincareActor && Array.isArray(skincareActor.specialties)) {
          return skincareActor.specialties.includes(query.specialty!);
        }
        return false;
      });
    }
    
    if (query.city) {
      filteredItems = filteredItems.filter(actor => 
        actor.location?.city.toLowerCase() === query.city!.toLowerCase()
      );
    }
    
    if (query.certification) {
      filteredItems = filteredItems.filter(actor =>
        actor.certifications?.includes(query.certification!)
      );
    }
    
    return {
      items: filteredItems,
      total: filteredItems.length,
      page,
      pageSize,
      hasMore: false
    };
  }

  /**
   * Find formulations by query parameters
   */
  async findFormulations(
    query?: FormulationQuery,
    page: number = 1,
    pageSize: number = 30
  ): Promise<PaginatedResult<Formulation>> {
    let filtered = [...this.formulations];
    
    if (query) {
      if (query.type) {
        filtered = filtered.filter(f => f.type === query.type);
      }
      if (query.skinType) {
        filtered = filtered.filter(f => 
          f.skinTypes.includes(query.skinType!) || f.skinTypes.includes('all')
        );
      }
      if (query.benefit) {
        filtered = filtered.filter(f =>
          f.benefits.some(b => b.toLowerCase().includes(query.benefit!.toLowerCase()))
        );
      }
      if (query.maxPrice) {
        filtered = filtered.filter(f => f.basePrice <= query.maxPrice!);
      }
      if (query.certification) {
        filtered = filtered.filter(f =>
          f.certifications?.includes(query.certification!)
        );
      }
    }
    
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedItems = filtered.slice(start, end);
    
    return {
      items: paginatedItems,
      total: filtered.length,
      page,
      pageSize,
      hasMore: end < filtered.length
    };
  }

  /**
   * Get formulation by ID
   */
  getFormulationById(id: string): Formulation | undefined {
    return this.formulations.find(f => f.id === id);
  }

  /**
   * Find procedures by query parameters
   */
  async findProcedures(
    query?: ProcedureQuery,
    page: number = 1,
    pageSize: number = 30
  ): Promise<PaginatedResult<Procedure>> {
    let filtered = [...this.procedures];
    
    if (query) {
      if (query.salonId) {
        filtered = filtered.filter(p => p.salonId === query.salonId);
      }
      if (query.type) {
        filtered = filtered.filter(p => p.type === query.type);
      }
      if (query.skinType) {
        filtered = filtered.filter(p =>
          p.skinTypes.includes(query.skinType!) || p.skinTypes.includes('all')
        );
      }
      if (query.minDuration) {
        filtered = filtered.filter(p => p.totalDuration >= query.minDuration!);
      }
      if (query.maxDuration) {
        filtered = filtered.filter(p => p.totalDuration <= query.maxDuration!);
      }
      if (query.maxPrice) {
        filtered = filtered.filter(p => p.basePrice <= query.maxPrice!);
      }
    }
    
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedItems = filtered.slice(start, end);
    
    return {
      items: paginatedItems,
      total: filtered.length,
      page,
      pageSize,
      hasMore: end < filtered.length
    };
  }

  /**
   * Get procedure by ID
   */
  getProcedureById(id: string): Procedure | undefined {
    return this.procedures.find(p => p.id === id);
  }

  /**
   * Get procedures for a specific salon
   */
  async getProceduresForSalon(salonId: string): Promise<Procedure[]> {
    const result = await this.findProcedures({ salonId });
    return result.items;
  }

  /**
   * Calculate total cost for a procedure including products
   */
  calculateProcedureCost(procedureId: string): number {
    const procedure = this.getProcedureById(procedureId);
    if (!procedure) {
      throw new Error(`Procedure not found: ${procedureId}`);
    }
    
    let totalCost = procedure.basePrice;
    
    // Add cost of products used in procedure
    for (const step of procedure.steps) {
      for (const productId of step.products) {
        const formulation = this.getFormulationById(productId);
        if (formulation) {
          // Add a percentage of the product cost (e.g., 10% of base price)
          totalCost += formulation.basePrice * 0.1;
        }
      }
    }
    
    return Math.round(totalCost * 100) / 100;
  }
}
