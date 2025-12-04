import express from "express";
import cors from "cors";
import { RoutesController } from "../adapters/inbound/http/routes.controller";
import { BankingController } from "../adapters/inbound/http/banking.controller";
// 👇 Import the Repository implementation to create a single instance
import { InMemoryRouteRepository } from "../adapters/outbound/postgres/in-memory-route.repository"; 

const app = express();
const PORT = 3000;

// --- Centralized Dependency Initialization (DI) ---
// Create a SINGLE instance of the Mock Database to be shared
const sharedRouteRepository = new InMemoryRouteRepository(); 

// Initialize Controllers and INJECT the shared repository
const routesController = new RoutesController(sharedRouteRepository);
const bankingController = new BankingController(sharedRouteRepository);

// Middleware (Tools)
app.use(cors()); 
app.use(express.json()); 

// Mount Routers
// Use /routes/ for the RoutesController
app.use("/routes", routesController.router);
// Use the root path (/) for the BankingController so its paths (/compliance/cb, /banking/bank) work directly
app.use("/", bankingController.router); 

// Start the Server
app.listen(PORT, () => {
  console.log(`✅ FuelEU Backend is running on http://localhost:${PORT}`);
});