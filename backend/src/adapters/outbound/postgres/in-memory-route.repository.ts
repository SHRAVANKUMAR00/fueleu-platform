import { Route } from "../../../core/domain/route.entity"; 
import { RouteRepository } from "../../../core/ports/route-repository.port"; 
import { BankEntry } from "../../../core/domain/banking.entity"; // Import new entity

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
  // 👇 New storage array for Banking data
  private bankRecords: BankEntry[] = []; 

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
  
  // --- Banking Management (New Implementations) ---

  async getBankRecords(routeId: string, year?: number): Promise<BankEntry[]> {
      let records = this.bankRecords.filter(r => r.routeId === routeId);
      if (year) {
          records = records.filter(r => r.year === year);
      }
      // Return a copy to prevent external modification
      return records.map(r => new BankEntry(r.id, r.routeId, r.year, r.amount, r.appliedYear));
  }

  async saveBankEntry(entry: BankEntry): Promise<void> {
      const index = this.bankRecords.findIndex(r => r.id === entry.id);
      if (index !== -1) {
          // Update existing entry (used when applying a banked surplus)
          this.bankRecords[index] = entry; 
      } else {
          // Add new entry (used when banking a surplus)
          this.bankRecords.push(entry);
      }
  }
}