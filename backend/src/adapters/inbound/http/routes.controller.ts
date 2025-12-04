import { Request, Response, Router } from "express";
import { GetRoutesUseCase } from "../../../core/application/get-routes.usecase"; 
import { CompareRoutesUseCase } from "../../../core/application/compare-routes.usecase"; 
import { RouteRepository } from "../../../core/ports/route-repository.port"; 
import { BankEntry } from "../../../core/domain/banking.entity"; // <-- CRITICAL MISSING IMPORT ADDED

// This class must accept the repository via its constructor (Dependency Injection)
export class RoutesController {
  public router = Router();
  
  private routeRepo: RouteRepository;
  private getRoutesUseCase: GetRoutesUseCase;
  private compareUseCase: CompareRoutesUseCase;

  // The constructor now receives the shared repository instance
  constructor(routeRepo: RouteRepository) {
    this.routeRepo = routeRepo; // Store the injected shared repository
    this.getRoutesUseCase = new GetRoutesUseCase(this.routeRepo);
    this.compareUseCase = new CompareRoutesUseCase(this.routeRepo); 
    
    this.seedData(); // Seed Routes
    this.seedBankRecords(); // <--- Seed a Banked Surplus
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // 1. GET /routes 
    this.router.get("/", async (req: Request, res: Response) => {
      try {
        const routes = await this.getRoutesUseCase.execute();
        res.status(200).json(routes);
      } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    // 2. GET /routes/comparison 
    this.router.get("/comparison", async (req: Request, res: Response) => {
      try {
        const comparison = await this.compareUseCase.execute();
        res.status(200).json(comparison);
      } catch (error) {
        res.status(500).json({ error: "Comparison Calculation Failed" });
      }
    });

    // 3. POST /routes/:id/baseline 
    this.router.post("/:id/baseline", (req: Request, res: Response) => {
        console.log(`Setting baseline for route ID: ${req.params.id}`);
        res.status(200).json({ message: `Baseline set for ${req.params.id}` });
    });
  }

  // Seeding with the 5 routes from the assignment brief
  private seedData() {
    this.routeRepo.save({ id: "R001", vesselType: "Container", fuelType: "HFO", year: 2024, ghgIntensity: 91.0, fuelConsumption: 5000, distance: 12000, isBaseline: true } as any);
    this.routeRepo.save({ id: "R002", vesselType: "BulkCarrier", fuelType: "LNG", year: 2024, ghgIntensity: 88.0, fuelConsumption: 4800, distance: 11500 } as any);
    this.routeRepo.save({ id: "R003", vesselType: "Tanker", fuelType: "MGO", year: 2024, ghgIntensity: 93.5, fuelConsumption: 5100, distance: 12500 } as any);
    this.routeRepo.save({ id: "R004", vesselType: "RoRo", fuelType: "HFO", year: 2025, ghgIntensity: 89.2, fuelConsumption: 4900, distance: 11800 } as any);
    this.routeRepo.save({ id: "R005", vesselType: "Container", fuelType: "LNG", year: 2025, ghgIntensity: 90.5, fuelConsumption: 4950, distance: 11900 } as any);
  }

  // NEW METHOD: Pre-seed a banked surplus for R002 to enable testing of R001 deficit
  private seedBankRecords() {
    const bankedAmount = 10000000; // Let's use 10 million CB for simple math

    const initialBankEntry = new BankEntry(
        "BANK-SEED-R002-2024", 
        "R002", 
        2024, 
        bankedAmount, 
        null // Not yet applied
    );

    this.routeRepo.saveBankEntry(initialBankEntry);
  }
}