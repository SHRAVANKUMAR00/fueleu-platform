// frontend/src/core/domain/route.model.ts

// The word "export" is REQUIRED here
export interface Route {
  id: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number;
  fuelConsumption: number;
  distance: number;
  totalEmissions?: number;
}