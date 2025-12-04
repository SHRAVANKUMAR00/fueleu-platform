import type { Route } from "../domain/route.model";

// Define the structure of the data the Comparison API sends back
export interface ComparisonResult {
    routeId: string;
    ghgIntensity: number;
    complianceBalance: number;
    isCompliant: boolean;
}

export interface FuelApiPort {
  getRoutes(): Promise<Route[]>;
  // 👇 New method to fetch comparison data
  getRouteComparisons(): Promise<ComparisonResult[]>; 
}