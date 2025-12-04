import { Router } from "express";
import { RouteRepository } from "../../../core/ports/route-repository.port"; 
import { BankingController } from "./banking.controller";
import { PoolingController } from "./pooling.controller";

/**
 * Creates a single router that aggregates all non-route-specific endpoints
 * (/compliance, /banking, /pools).
 * This ensures they are mounted correctly at the server root.
 */
export function createComplianceRouter(routeRepo: RouteRepository): Router {
    const router = Router();
    
    // Initialize controllers with the injected repository
    const bankingController = new BankingController(routeRepo);
    const poolingController = new PoolingController(routeRepo);

    // Use .use() to include the routes from the individual controllers
    router.use(bankingController.router);
    router.use(poolingController.router);
    
    return router;
}