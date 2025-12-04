FuelEU Maritime Compliance Platform

Overview

This project implements a minimal, yet architecturally rigorous, full-stack application prototype for managing FuelEU Maritime compliance data, including calculation of Compliance Balances (CB), and the simulation of two key regulatory mechanisms: Banking (Article 20) and Pooling (Article 21).

The core objective was to demonstrate strict adherence to the Hexagonal Architecture (Ports & Adapters) paradigm on both the backend (Node.js) and the frontend (React).

Architecture Summary: Hexagonal (Ports & Adapters)

The application is split into core (pure business logic) and adapters (framework code/infrastructure). 

 This ensures the core business rules are independent of the web framework (Express) or the mock database implementation (In-Memory).

Backend (/backend)

Core: Contains domain (Entities: Route, BankEntry, Pool), ports (Interfaces: RouteRepository), and application (Use Cases: CalculateCB, BankingUseCases, PoolingUseCases). This layer is Express-free and database-free.

Adapters: Contains inbound/http (Controllers/Registration) and outbound/postgres (The in-memory mock repository implementing the RouteRepository interface).

Database: Currently uses an In-Memory Mock Array to simulate PostgreSQL behavior, allowing for rapid testing of core logic.

Frontend (/frontend)

Core: Contains data models (route.model.ts) and ports (fuel-api.port.ts).

Adapters: Contains infrastructure (The Axios/Fetch implementation of the FuelApiPort) and ui (The React components and dashboard structure).

Setup & Run Instructions

This repository contains two independent Node.js projects (backend and frontend). Both must be run simultaneously.

Clone the Repository:

git clone [YOUR_REPOSITORY_URL] fueleu-platform
cd fueleu-platform



Setup Backend:

cd backend
npm install
# Note: TypeScript compiler is initialized with 'strict: true'



Setup Frontend:

cd ../frontend
npm install
npm install recharts # For chart visualization



Run Servers (Use two separate terminal tabs/windows):

Terminal 1 (Backend):

cd backend
npm run dev
# Expected Output: ✅ FuelEU Backend is running on http://localhost:3000



Terminal 2 (Frontend):

cd frontend
npm run dev
# Expected Output: VITE ready on http://localhost:5173/



Access: Open your browser to http://localhost:5173.

Feature Status & Sample Usage

Tab

Status

Key Endpoints

Sample Usage / Logic

Routes

✅ Complete

GET /routes

Displays all 5 seeded ships and their metrics.

Compare

✅ Complete

GET /routes/comparison

Displays GHG Intensity vs. Target (89.3368 gCO₂e/MJ) in chart and table format.

Banking

✅ Logically Complete

GET /compliance/cb, POST /banking/bank, POST /banking/apply

Uses R001 (Deficit) for demonstration. The system is seeded with a surplus under R002 to facilitate testing of the "Apply" logic.

Pooling

✅ Logically Complete

POST /pools

Implements the Greedy Allocation Algorithm. Select Deficit ships (R001, R003, R005) and Surplus ships (R002, R004) where Sum(CB) >= 0 to see a successful allocation.

How to Execute Tests

Due to the time constraint, full unit testing was postponed in favor of architectural completeness. The core logic is tested via interactive API calls:

Routes/Compare: Verify data load on the respective tabs (http://localhost:3000/routes/comparison works).

Banking: Manually test POST requests using R002 (Surplus) to bank funds, and R001 (Deficit) to apply funds.

Pooling: Manually test the POST /pools endpoint via the UI by selecting valid/invalid ship combinations.