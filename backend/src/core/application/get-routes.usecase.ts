// backend/src/core/application/get-routes.usecase.ts

import { Route } from "../domain/route.entity";
import { RouteRepository } from "../ports/route-repository.port";

export class GetRoutesUseCase {
  // Constructor Injection:
  // We pass the Repository Interface here.
  // In C++ terms: GetRoutesUseCase(RouteRepository* repo)
  constructor(private routeRepo: RouteRepository) {}

  async execute(): Promise<Route[]> {
    // We simply ask the repository for all routes.
    // The repository implementation (which we write later) will handle the SQL.
    return this.routeRepo.findAll();
  }
}