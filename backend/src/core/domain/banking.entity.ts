// This represents a surplus (CB > 0) that a ship chooses to "bank"
// for use in a future year.
export class BankEntry {
  constructor(
    public readonly id: string,
    public readonly routeId: string, // Which route generated this surplus
    public readonly year: number,     // Year the surplus was generated
    public readonly amount: number,   // The amount of CB banked (e.g., 5,000,000 gCO2eq)
    public readonly appliedYear: number | null = null // Year it was applied, if any
  ) {}
}