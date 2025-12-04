import type { FuelApiPort, ComparisonResult } from "../../core/ports/fuel-api.port";
import type { Route } from "../../core/domain/route.model";

export class FuelApiAdapter implements FuelApiPort {
  private baseUrl = "http://localhost:3000";

  // Existing method: Get all routes for the 'Routes' tab
  async getRoutes(): Promise<Route[]> {
    try {
      const response = await fetch(`${this.baseUrl}/routes`);
      if (!response.ok) {
        throw new Error(`Failed to fetch routes: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error connecting to backend for routes:", error);
      return [];
    }
  }

  // New method: Get comparison data for the 'Compare' tab
  async getRouteComparisons(): Promise<ComparisonResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}/routes/comparison`);
      if (!response.ok) {
        throw new Error(`Failed to fetch comparison data: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error connecting to backend for comparison:", error);
      return [];
    }
  }
}