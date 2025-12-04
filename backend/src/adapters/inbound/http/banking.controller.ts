import { Request, Response, Router } from "express";
import { BankingUseCases } from "../../../core/application/banking.usecase";
import { ComplianceService } from "../../../core/domain/compliance.service";
// 👇 Import the Port (Interface) type
import { RouteRepository } from "../../../core/ports/route-repository.port"; 

export class BankingController {
  public router = Router();
  private bankingUseCases: BankingUseCases;
  private routeRepo: RouteRepository;

  // The constructor now receives the shared repository instance
  constructor(routeRepo: RouteRepository) {
    this.routeRepo = routeRepo;
    this.bankingUseCases = new BankingUseCases(routeRepo);
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // --- Endpoints for Compliance Balance (CB) ---
    // GET /compliance/cb?routeId=R002
    this.router.get("/compliance/cb", async (req: Request, res: Response) => {
      const { routeId } = req.query;

      if (!routeId || typeof routeId !== 'string') {
        return res.status(400).json({ error: "Missing required query parameter: routeId" });
      }

      try {
        // Use injected repository to find the route
        const route = await this.routeRepo.findById(routeId); 
        if (!route) {
          // If route not found, return 404 with JSON (not HTML)
          return res.status(404).json({ error: `Route ID ${routeId} not found.` }); 
        }

        const actualCB = ComplianceService.calculateBalance(route);

        return res.status(200).json({
          routeId,
          year: route.year,
          actualCB: actualCB,
          status: actualCB >= 0 ? 'Surplus' : 'Deficit'
        });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to calculate CB." });
      }
    });

    // --- Endpoints for Banking ---
    
    // POST /banking/bank
    this.router.post("/banking/bank", async (req: Request, res: Response) => {
      const { routeId, amount } = req.body;

      if (!routeId || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ error: "Invalid routeId or positive amount required." });
      }

      try {
        await this.bankingUseCases.bankSurplus(routeId, amount);
        return res.status(200).json({ message: `Successfully banked ${amount} CB for ${routeId}.` });
      } catch (error) {
        if (error instanceof Error) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: "Failed to process banking request." });
      }
    });

    // POST /banking/apply
    this.router.post("/banking/apply", async (req: Request, res: Response) => {
      const { routeId, applyYear, amount } = req.body;

      if (!routeId || typeof applyYear !== 'number' || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ error: "Invalid parameters for applying banked surplus." });
      }

      try {
        await this.bankingUseCases.applyBankedSurplus(routeId, applyYear, amount);
        
        const available = await this.bankingUseCases.getAvailableBankedSurplus(routeId);
        
        return res.status(200).json({ 
            message: `Successfully applied ${amount} CB to deficit for ${routeId}.`,
            cb_after: available
        });
      } catch (error) {
        if (error instanceof Error) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: "Failed to process application request." });
      }
    });
  }
}