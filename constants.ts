import { CalculatorInputs } from "./types";

export const DEFAULT_INPUTS: CalculatorInputs = {
  currentAge: 40,
  retirementAge: 65,
  grossSalary: 100000,
  monthlyAVC: 600,
  lumpSumAVC: 0,
  isIndexLinked: true,
  investmentGrowth: 5.0,
  managementFee: 1.0,
  inflationRate: 2.0,
  salaryGrowth: 2.5,
  mainSchemeContribPercent: 5.0,
  drawdownRate: 4.0,
};

// Irish Revenue Age Bands for Pension Relief
export const TAX_RELIEF_BANDS = [
  { maxAge: 29, percent: 0.15 },
  { maxAge: 39, percent: 0.20 },
  { maxAge: 49, percent: 0.25 },
  { maxAge: 54, percent: 0.30 },
  { maxAge: 59, percent: 0.35 },
  { maxAge: 999, percent: 0.40 }, // 60+
];

export const EARNINGS_CAP = 115000;
export const STANDARD_TAX_CUTOFF = 44000;
