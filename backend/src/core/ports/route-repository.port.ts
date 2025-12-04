// backend/src/core/ports/route-repository.port.ts

import { Route } from "../domain/route.entity";

export interface RouteRepository {
  // Save a new route or update an existing one
  save(route: Route): Promise<void>;

  // Find a route by its ID (e.g., "R001")
  findById(id: string): Promise<Route | null>;

  // Get all routes (for the dashboard list)
  findAll(): Promise<Route[]>;
}