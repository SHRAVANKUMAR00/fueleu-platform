// backend/src/adapters/outbound/in-memory-route.repository.ts

import { Route } from "../../core/domain/route.entity";
import { RouteRepository } from "../../core/ports/route-repository.port";

export class InMemoryRouteRepository implements RouteRepository {
  // This array acts as our temporary database
  private routes: Route[] = [];

  async save(route: Route): Promise<void> {
    // Check if route already exists
    const index = this.routes.findIndex(r => r.id === route.id);
    if (index !== -1) {
      this.routes[index] = route; // Update
    } else {
      this.routes.push(route); // Insert (push_back)
    }
  }

  async findById(id: string): Promise<Route | null> {
    const route = this.routes.find(r => r.id === id);
    return route || null;
  }

  async findAll(): Promise<Route[]> {
    return this.routes;
  }
}