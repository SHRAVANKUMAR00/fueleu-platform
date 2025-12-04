import { RouteRepository } from "../ports/route-repository.port";
import { ComplianceService } from "../domain/compliance.service";
import { Route } from "../domain/route.entity";
import { Pool, PoolMember } from "../domain/pooling.entity";

// Interface for the input data, typically a list of route IDs to pool
export interface CreatePoolCommand {
  routeIds: string[];
  poolName: string;
  year: number;
}

// Interface for the output of the calculation (before saving)
export interface PoolAllocationResult {
  poolName: string;
  isCompliant: boolean;
  totalSumCB: number;
  members: PoolMember[];
  errorMessage?: string;
}

export class PoolingUseCases {
  constructor(private routeRepo: RouteRepository) {}

  /**
   * Main function to create and allocate compliance balances within a pool.
   * This implements the greedy allocation algorithm and checks all rules.
   */
  async createPool(command: CreatePoolCommand): Promise<PoolAllocationResult> {
    const { routeIds, poolName, year } = command;

    // 1. Fetch all routes and calculate their initial CBs
    const routes = await Promise.all(
      routeIds.map(id => this.routeRepo.findById(id).then(r => ({
          route: r,
          initialCB: r ? ComplianceService.calculateBalance(r) : 0,
      })))
    );

    // Filter out any non-existent routes
    const validRoutes = routes.filter(r => r.route);
    if (validRoutes.length !== routeIds.length) {
        return { isCompliant: false, totalSumCB: 0, members: [], errorMessage: "One or more route IDs were not found." } as PoolAllocationResult;
    }

    // Initialize members list with initial CBs
    let members: PoolMember[] = validRoutes.map(item => new PoolMember(
        item.route!.id,
        item.initialCB,
        item.initialCB, // Adjusted CB starts as initial CB
        0 // Allocation used starts at zero
    ));

    // 2. Separate into Surplus and Deficit groups
    let surplusMembers = members.filter(m => m.initialCB > 0).sort((a, b) => b.initialCB - a.initialCB); // Descending CB
    let deficitMembers = members.filter(m => m.initialCB < 0).sort((a, b) => a.initialCB - b.initialCB); // Ascending CB (most negative first)

    // Calculate total deficit and total surplus
    const totalDeficit = deficitMembers.reduce((sum, m) => sum + m.initialCB, 0); // Negative number
    const totalSurplus = surplusMembers.reduce((sum, m) => sum + m.initialCB, 0); // Positive number
    
    const initialSumCB = totalDeficit + totalSurplus;

    // 3. Rule Check: Sum(adjustedCB) >= 0 (Initial check)
    if (initialSumCB < 0) {
        return {
            isCompliant: false, 
            totalSumCB: initialSumCB, 
            members: members, 
            errorMessage: `Pool is non-compliant: Total deficit (${totalDeficit.toFixed(2)}) is greater than total surplus (${totalSurplus.toFixed(2)}). Sum CB is ${initialSumCB.toFixed(2)}.` 
        } as PoolAllocationResult;
    }

    // --- 4. Greedy Allocation Algorithm (Transfer) ---
    let remainingSurplus = totalSurplus;
    
    // Sort deficits to address the largest ones first (Greedy approach)
    deficitMembers.sort((a, b) => a.initialCB - b.initialCB); 
    
    const allocatedMembers: PoolMember[] = [];

    for (const deficitM of deficitMembers) {
      let deficitToCover = Math.abs(deficitM.initialCB);
      let amountCovered = 0;

      // Try to cover the deficit using the remaining global surplus
      while (deficitToCover > 0 && remainingSurplus > 0) {
        
        // Find the ship with the largest remaining surplus
        const currentSurplusShip = surplusMembers[0];
        if (!currentSurplusShip) break;

        // Amount that can be transferred in this step
        // Limited by: 1) remaining deficit, 2) remaining surplus of the donor ship
        const transferAmount = Math.min(deficitToCover, currentSurplusShip.initialCB);
        
        // Update states:
        remainingSurplus -= transferAmount;
        deficitToCover -= transferAmount;
        amountCovered += transferAmount;

        // The deficit ship's adjusted CB is improved by the amount covered
        const newDeficitCB = deficitM.initialCB + amountCovered;

        // Rule Check: Deficit ship cannot exit worse (Since amountCovered > 0, this is guaranteed)
        
        // Update the deficit member's adjusted CB and allocation used
        deficitM.adjustedCb = newDeficitCB;
        deficitM.allocationUsed = amountCovered;

        // CRITICAL: Since this is an in-memory mock, we just reduce the top surplus ship's CB directly
        currentSurplusShip.adjustedCb -= transferAmount; 
        currentSurplusShip.allocationUsed -= transferAmount; // Allocation used tracks reduction for surplus

        // Re-sort/Filter surplus list if the top ship ran out of surplus
        if (currentSurplusShip.adjustedCb <= 0) {
            surplusMembers.shift(); // Remove ship if surplus is fully allocated
        }
      }
      allocatedMembers.push(deficitM);
    }
    
    // Add remaining surplus ships back to the allocated list
    allocatedMembers.push(...surplusMembers);

    // 5. Final Rule Checks on ALL members
    let finalSumCB = 0;
    for (const member of allocatedMembers) {
        // Rule Check: Surplus ship cannot exit negative (i.e., Adjusted CB must be >= 0)
        if (member.initialCB > 0 && member.adjustedCb < 0) {
            return { 
                isCompliant: false, 
                totalSumCB: initialSumCB, // Return original sum for reference
                members: members, 
                errorMessage: `Pool Rule Violation: Surplus ship ${member.routeId} exited with a negative CB (${member.adjustedCb.toFixed(2)}).` 
            } as PoolAllocationResult;
        }
        finalSumCB += member.adjustedCb;
    }
    
    // 6. Save the pool and return success
    const poolId = `POOL-${Date.now()}`;
    const finalPool = new Pool(poolId, poolName, year, allocatedMembers);
    await this.routeRepo.savePool(finalPool); // Save the pool record
    
    return {
        isCompliant: true,
        totalSumCB: finalSumCB,
        members: allocatedMembers,
        errorMessage: "Pool creation and allocation successful."
    } as PoolAllocationResult;
  }
}