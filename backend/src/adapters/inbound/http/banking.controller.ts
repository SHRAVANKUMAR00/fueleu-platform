import { Request, Response, Router, Express } from "express"; // Import Express for typing
import { BankingUseCases } from "../../../core/application/banking.usecase";
import { ComplianceService } from "../../../core/domain/compliance.service";
import { RouteRepository } from "../../../core/ports/route-repository.port"; 

/**
 * Registers Banking and Compliance routes directly onto the Express application.
 */
export function registerBankingRoutes(app: Express, routeRepo: RouteRepository): void {
  const bankingUseCases = new BankingUseCases(routeRepo);

  // --- Endpoints for Compliance Balance (CB) ---
  // GET /compliance/cb?routeId=R002
  app.get("/compliance/cb", async (req: Request, res: Response) => {
    const { routeId } = req.query;

    if (!routeId || typeof routeId !== 'string') {
      return res.status(400).json({ error: "Missing required query parameter: routeId" });
    }

    try {
      const route = await routeRepo.findById(routeId); 
      if (!route) {
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
  app.post("/banking/bank", async (req: Request, res: Response) => {
    const { routeId, amount } = req.body;

    if (!routeId || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: "Invalid routeId or positive amount required." });
    }

    try {
      await bankingUseCases.bankSurplus(routeId, amount);
      return res.status(200).json({ message: `Successfully banked ${amount} CB for ${routeId}.` });
    } catch (error) {
      if (error instanceof Error) {
          return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: "Failed to process banking request." });
    }
  });

  // POST /banking/apply
  app.post("/banking/apply", async (req: Request, res: Response) => {
    const { routeId, applyYear, amount } = req.body;

    if (!routeId || typeof applyYear !== 'number' || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: "Invalid parameters for applying banked surplus." });
    }

    try {
      await bankingUseCases.applyBankedSurplus(routeId, applyYear, amount);
      
      const available = await bankingUseCases.getAvailableBankedSurplus(routeId);
      
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