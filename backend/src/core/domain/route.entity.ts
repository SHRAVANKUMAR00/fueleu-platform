// backend/src/core/domain/route.entity.ts

export class Route {
  constructor(
    public readonly id: string,           // Unique ID (like "R001")
    public readonly vesselType: string,
    public readonly fuelType: string,
    public readonly year: number,
    public readonly ghgIntensity: number, // gCO2e/MJ
    public readonly fuelConsumption: number, // Metric Tonnes
    public readonly distance: number,     // km
    public readonly isBaseline: boolean = false
  ) {}

  // Domain Logic: Calculate Energy in Scope (MJ)
  // Formula: Fuel Consumption (t) * 41000 (MJ/t)
  // This is a "getter" - in C++ it's like a const method: getEnergyInScope()
  public get energyInScope(): number {
    return this.fuelConsumption * 41000;
  }

  // Domain Logic: Calculate Total Emissions (Tonnes)
  // Formula: (GHG Intensity * Energy in Scope) / 1,000,000
  public get totalEmissions(): number {
    return (this.ghgIntensity * this.energyInScope) / 1000000;
  }
}