import { Request, Response, Router, Express } from "express"; // Import Express for typing
import { RouteRepository } from "../../../core/ports/route-repository.port"; 
import { PoolingUseCases, CreatePoolCommand } from "../../../core/application/pooling.usecase";

/**
 * Registers Pooling routes directly onto the Express application.
 */
export function registerPoolingRoutes(app: Express, routeRepo: RouteRepository): void {
  const poolingUseCases = new PoolingUseCases(routeRepo);

  // POST /pools - Create a new Pool and calculate allocation
  app.post("/pools", async (req: Request, res: Response) => {
    const { routeIds, poolName, year } = req.body as CreatePoolCommand;

    if (!routeIds || routeIds.length < 2 || !poolName || !year) {
      return res.status(400).json({ error: "Invalid input: Requires poolName, year, and at least two routeIds." });
    }

    try {
      const result = await poolingUseCases.createPool({ routeIds, poolName, year });

      if (!result.isCompliant) {
        // Handle 400 Bad Request (Rule violation: total deficit > total surplus)
        return res.status(400).json({ 
            error: result.errorMessage, 
            totalSumCB: result.totalSumCB,
            members: result.members 
        });
      }

      return res.status(200).json({
        message: result.errorMessage,
        poolName: result.poolName,
        totalAdjustedCB: result.totalSumCB,
        members: result.members
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Internal pooling error.";
      console.error("Pooling Error:", error);
      return res.status(500).json({ error: errorMessage });
    }
  });
  
  // GET /pools?year=2024 - Fetch all pools for a given year (for display/history)
  app.get("/pools", async (req: Request, res: Response) => {
      const year = parseInt(req.query.year as string);
      if (isNaN(year)) {
          return res.status(400).json({ error: "Invalid or missing 'year' parameter." });
      }
      
      try {
          const pools = await routeRepo.findAllPools(year);
          return res.status(200).json(pools);
      } catch (error) {
          console.error(error);
          return res.status(500).json({ error: "Failed to retrieve pool history." });
      }
  });
}