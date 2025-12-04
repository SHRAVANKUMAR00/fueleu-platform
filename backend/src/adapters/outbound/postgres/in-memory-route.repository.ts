import { Route } from "../../../core/domain/route.entity"; 
import { RouteRepository } from "../../../core/ports/route-repository.port"; 
import { BankEntry } from "../../../core/domain/banking.entity"; 
import { Pool } from "../../../core/domain/pooling.entity"; // Import new entity

// Define what a plain JSON Route looks like
interface RouteData {
  id: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number;
  fuelConsumption: number; 
  distance: number; 
  isBaseline: boolean;
}

export class InMemoryRouteRepository implements RouteRepository {
  private routes: RouteData[] = [];
  private bankRecords: BankEntry[] = []; 
  // 👇 New storage array for Pooling data
  private pools: Pool[] = []; 

  private toRouteEntity(data: RouteData): Route {
      return new Route(
          data.id,
          data.vesselType,
          data.fuelType,
          data.year,
          data.ghgIntensity,
          data.fuelConsumption,
          data.distance,
          data.isBaseline
      );
  }

  // --- Route Management (Existing) ---
  async save(route: RouteData): Promise<void> {
    const index = this.routes.findIndex(r => r.id === route.id);
    if (index !== -1) {
      this.routes[index] = route; 
    } else {
      this.routes.push(route); 
    }
  }

  async findById(id: string): Promise<Route | null> {
    const routeData = this.routes.find(r => r.id === id);
    return routeData ? this.toRouteEntity(routeData) : null;
  }

  async findAll(): Promise<Route[]> {
    return this.routes.map(this.toRouteEntity);
  }
  
  // --- Banking Management (Existing) ---
  async getBankRecords(routeId: string, year?: number): Promise<BankEntry[]> {
      let records = this.bankRecords.filter(r => r.routeId === routeId);
      if (year) {
          records = records.filter(r => r.year === year);
      }
      return records.map(r => new BankEntry(r.id, r.routeId, r.year, r.amount, r.appliedYear));
  }

  async saveBankEntry(entry: BankEntry): Promise<void> {
      const index = this.bankRecords.findIndex(r => r.id === entry.id);
      if (index !== -1) {
          this.bankRecords[index] = entry; 
      } else {
          this.bankRecords.push(entry);
      }
  }

  // --- Pooling Management (New Implementations) ---

  async savePool(pool: Pool): Promise<void> {
      const index = this.pools.findIndex(p => p.id === pool.id);
      if (index !== -1) {
          this.pools[index] = pool; 
      } else {
          this.pools.push(pool); 
      }
  }

  async findAllPools(year: number): Promise<Pool[]> {
      return this.pools.filter(p => p.year === year);
  }
}