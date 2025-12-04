import express, { Express } from "express";
import cors from "cors";
import { RoutesController } from "../adapters/inbound/http/routes.controller";
import { registerBankingRoutes } from "../adapters/inbound/http/banking.controller"; 
import { registerPoolingRoutes } from "../adapters/inbound/http/pooling.controller"; 
import { PostgresRouteRepository } from "../adapters/outbound/postgres/postgres-route.repository"; // 👈 Import POSTGRES Adapter
// Note: We no longer import InMemoryRouteRepository

const PORT = 3000;

// --- Mock PostgreSQL Client ---
// In a real application, this would be a real connection/pool object.
const mockPostgresClient = {
    query: async (sql: string, params?: any[]) => {
        // This simulates connecting to an empty database
        console.log(`[DB MOCK] Executed query: ${sql}`);
        return { rows: [] };
    }
};

// --- Centralized Dependency Initialization (Adapter Swap) ---
// 1. Instantiate the Postgres Adapter (Hexagonal Goal Achieved!)
const sharedRouteRepository = new PostgresRouteRepository(mockPostgresClient); 
// Note: Seeding functionality is lost here as PostgresRepo doesn't have it.

// 2. Initialize Controllers and Routers
const routesController = new RoutesController(sharedRouteRepository); 

// --- Initialize and Configure Express ---
const app: Express = express();

// Middleware
app.use(cors()); 
app.use(express.json()); 

// --- Mount Routers ---
app.use("/routes", routesController.router);

registerBankingRoutes(app, sharedRouteRepository);
registerPoolingRoutes(app, sharedRouteRepository);


// Fallback for 404 errors 
app.use((req, res, next) => {
    res.status(404).json({ error: `Endpoint not found: ${req.url}` });
});


// Start the Server
app.listen(PORT, () => {
  console.log(`✅ FuelEU Backend is running on http://localhost:${PORT}`);
  console.log(`✅ ADAPTER SWAP COMPLETE: Now using PostgresRouteRepository (MOCK).`);
});