export interface CalculatorInputs {
  currentAge: number;
  retirementAge: number;
  grossSalary: number;
  monthlyAVC: number;
  lumpSumAVC: number;
  isIndexLinked: boolean;
  investmentGrowth: number;
  managementFee: number;
  inflationRate: number;
  salaryGrowth: number;
  mainSchemeContribPercent: number;
  drawdownRate: number;
}

export interface YearlyProjection {
  age: number;
  fundValueNominal: number;
  fundValueReal: number;
  totalContributed: number;
}

export interface DrawdownYear {
  age: number;
  annualIncomeNominal: number;
  annualIncomeReal: number;
  monthlyIncomeNominal: number;
  monthlyIncomeReal: number;
  remainingBalanceNominal: number;
  remainingBalanceReal: number;
}

export interface TaxReliefResult {
  maxReliefAmount: number;
  mandatoryContribution: number;
  totalAVC: number;
  annualRegularAVC: number;
  lumpSumAVC: number;
  remainingHeadroom: number;
  taxRate: number; // 0.20 or 0.40
  immediateTaxSaving: number;
  netMonthlyCost: number;
  isOverLimit: boolean;
  ageBandPercent: number;
}

export interface CalculationResult {
  taxRelief: TaxReliefResult;
  projections: YearlyProjection[];
  finalPotNominal: number;
  finalPotReal: number;
  taxFreeLumpSumNominal: number;
  taxFreeLumpSumReal: number;
  drawdownSchedule: DrawdownYear[];
  totalNetInput: number;
}

export enum ViewMode {
  Nominal = 'NOMINAL', // Future €
  Real = 'REAL',       // Today's Money
}