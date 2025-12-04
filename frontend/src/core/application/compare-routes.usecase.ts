import { Route } from "../domain/route.entity";
import { ComplianceService } from "../domain/compliance.service";
import { RouteRepository } from "../ports/route-repository.port";

export interface ComparisonResult {
  routeId: string;
  ghgIntensity: number;
  complianceBalance: number;
  isCompliant: boolean;
}

export class CompareRoutesUseCase {
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