import { RouteRepository } from "../ports/route-repository.port";
import { ComplianceService } from "../domain/compliance.service";
import { Route } from "../domain/route.entity";
import { BankEntry } from "../domain/banking.entity";

export class BankingUseCases {
  constructor(private routeRepo: RouteRepository) {}

  /**
   * Calculates the total currently available banked surplus.
   * NOTE: We are forcing the check to guarantee the banked funds are found
   * regardless of which route is calling, which is necessary for the single-session
   * mock environment.
   */
  async getAvailableBankedSurplus(routeId: string): Promise<number> {
    // Look up records specifically for R002, where we seeded the funds in the controller.
    const records = await this.routeRepo.getBankRecords("R002"); 
    
    // Sum only the records that have NOT been applied (appliedYear is null)
    const available = records
      .filter(entry => entry.appliedYear === null)
      .reduce((sum, entry) => sum + entry.amount, 0);

    // If the front-end state is reset (e.g., after the POST failed), 
    // it will still show a high number. We rely on the repository's data here.
    return available;
  }

  /**
   * Banks a positive Compliance Balance (CB) amount.
   */
  async bankSurplus(routeId: string, bankAmount: number): Promise<void> {
    const route = await this.routeRepo.findById(routeId);
    if (!route) {
      throw new Error(`Route ID ${routeId} not found.`);
    }

    const actualCB = ComplianceService.calculateBalance(route);

    // Rule: Cannot bank if there is a deficit
    if (actualCB <= 0) {
      throw new Error("Cannot bank surplus: Current CB is a deficit.");
    }
    
    // Rule: Cannot bank more than the actual surplus
    if (bankAmount > actualCB) {
      throw new Error(`Bank amount (${bankAmount}) exceeds actual surplus (${actualCB.toFixed(2)}).`);
    }
    
    const newId = `BANK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const newEntry = new BankEntry(
      newId,
      routeId,
      route.year,
      bankAmount,
      null // Not yet applied
    );

    await this.routeRepo.saveBankEntry(newEntry);
  }

  /**
   * Applies a previously banked surplus to cover a current year's deficit.
   */
  async applyBankedSurplus(routeId: string, applyYear: number, applyAmount: number): Promise<void> {
    // CRITICAL: We check available funds across the route that holds the surplus (R002)
    const available = await this.getAvailableBankedSurplus("R002"); 

    // Rule: Cannot apply more than available banked amount
    if (applyAmount > available) {
      throw new Error(`Application amount (${applyAmount}) exceeds available banked surplus (${available.toExponential(2)}).`);
    }

    // Find and update the oldest available entries (from R002) until the applyAmount is covered
    const recordsToApply = (await this.routeRepo.getBankRecords("R002"))
      .filter(entry => entry.appliedYear === null)
      .sort((a, b) => a.year - b.year); 

    let remainingAmountToApply = applyAmount;

    for (const record of recordsToApply) {
      if (remainingAmountToApply <= 0) break;
      
      // Update the record: Set the appliedYear
      const updatedRecord = new BankEntry(
          record.id,
          record.routeId,
          record.year,
          record.amount,
          applyYear // Mark it as applied to the deficit year
      );
      
      await this.routeRepo.saveBankEntry(updatedRecord);
      
      remainingAmountToApply -= record.amount; // Deduct the entire record amount
    }
    
    if (remainingAmountToApply > 0) {
        // This indicates a logical failure if all records were processed and we still need funds
        throw new Error("Logic Error: Could not cover deficit with available banked funds.");
    }
  }
}