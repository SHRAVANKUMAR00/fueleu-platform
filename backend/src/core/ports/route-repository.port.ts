import { Route } from "../domain/route.entity";
import { BankEntry } from "../domain/banking.entity"; // Import new entity

export interface RouteRepository {
  // Route Management (Existing)
  save(route: Route): Promise<void>;
  findById(id: string): Promise<Route | null>;
  findAll(): Promise<Route[]>;
  
  // Banking Management (New)
  getBankRecords(routeId: string, year?: number): Promise<BankEntry[]>;
  saveBankEntry(entry: BankEntry): Promise<void>;
}