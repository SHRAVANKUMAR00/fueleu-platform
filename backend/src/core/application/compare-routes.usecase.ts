import { Route } from "../domain/route.entity";
import { ComplianceService } from "../domain/compliance.service";
import { RouteRepository } from "../ports/route-repository.port";

export interface ComparisonResult {
  routeId: string;
  ghgIntensity: number;
  complianceBalance: number;
  isCompliant: boolean; // Based on Compliance Balance >= 0
}

/**
 * CompareRoutesUseCase fetches all routes and calculates their Compliance Balance (CB).
 * This service directly uses the pure domain service (ComplianceService) to perform the math.
 */
export class CompareRoutesUseCase {
  // Dependency Injection: Requires the repository interface (Port)
  constructor(private routeRepo: RouteRepository) {}

  async execute(): Promise<ComparisonResult[]> {
    const routes = await this.routeRepo.findAll();

    return routes.map((route) => {
      const balance = ComplianceService.calculateBalance(route);
      return {
        routeId: route.id,
        ghgIntensity: route.ghgIntensity,
        complianceBalance: balance, // Positive = Surplus, Negative = Deficit
        isCompliant: balance >= 0,
      };
    });
  }
}