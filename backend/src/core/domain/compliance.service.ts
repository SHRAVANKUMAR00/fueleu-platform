// backend/src/core/domain/compliance.service.ts

import { Route } from "./route.entity";

// The Regulation Target for 2025 (from assignment brief)
export const TARGET_INTENSITY_2025 = 89.3368;

export class ComplianceService {
  /**
   * Calculates the FuelEU Compliance Balance (CB).
   * Formula: (Target Intensity - Actual Intensity) * Energy In Scope
   * * Positive Result = Surplus (Good)
   * Negative Result = Deficit (Bad, needs penalty or banking)
   */
  static calculateBalance(route: Route): number {
    const diff = TARGET_INTENSITY_2025 - route.ghgIntensity;
    
    // We use the getter we defined in the Route entity
    return diff * route.energyInScope;
  }

  // Helper to check if a ship is compliant (Balance >= 0)
  static isCompliant(route: Route): boolean {
    return this.calculateBalance(route) >= 0;
  }
}