import { CalculatorInputs, CalculationResult, TaxReliefResult, YearlyProjection, DrawdownYear } from "../types";
import { TAX_RELIEF_BANDS, EARNINGS_CAP, STANDARD_TAX_CUTOFF } from "../constants";

export const getAgeBandLimit = (age: number): number => {
  const band = TAX_RELIEF_BANDS.find((b) => age <= b.maxAge);
  return band ? band.percent : 0.40;
};

export const calculateTaxRelief = (inputs: CalculatorInputs): TaxReliefResult => {
  const { grossSalary, currentAge, mainSchemeContribPercent, monthlyAVC, lumpSumAVC } = inputs;

  const effectiveSalary = Math.min(grossSalary, EARNINGS_CAP);
  const ageBandPercent = getAgeBandLimit(currentAge);
  const maxReliefAmount = effectiveSalary * ageBandPercent;

  const mandatoryContribution = grossSalary * (mainSchemeContribPercent / 100);
  const annualRegularAVC = monthlyAVC * 12;
  const totalAVC = annualRegularAVC + lumpSumAVC;

  const totalContribution = mandatoryContribution + totalAVC;
  const remainingHeadroom = maxReliefAmount - totalContribution;
  const isOverLimit = remainingHeadroom < 0;

  // Marginal Tax Rate Assumption
  const taxRate = grossSalary > STANDARD_TAX_CUTOFF ? 0.40 : 0.20;

  // CAPACITY LOGIC: Prioritize Regular Monthly AVCs for the tax relief "bucket"
  // This ensures the "Monthly Net Cost" remains stable even if a Lump Sum pushes the user over the limit.
  const avcCapacity = Math.max(0, maxReliefAmount - mandatoryContribution);

  const relievableRegularAVC = Math.min(annualRegularAVC, avcCapacity);
  
  // Lump Sum gets whatever capacity is left
  const remainingCapacityForLumpSum = Math.max(0, avcCapacity - relievableRegularAVC);
  const relievableLumpSum = Math.min(lumpSumAVC, remainingCapacityForLumpSum);

  const totalRelievableAVC = relievableRegularAVC + relievableLumpSum;
  
  // immediateTaxSaving is the Total Annual Tax Relief on all relievable contributions
  const immediateTaxSaving = totalRelievableAVC * taxRate;
  
  // monthlyTaxSaving is strictly the relief on the monthly portion
  const monthlyTaxSaving = (relievableRegularAVC / 12) * taxRate;
  
  const netMonthlyCost = monthlyAVC - monthlyTaxSaving;

  return {
    maxReliefAmount,
    mandatoryContribution,
    totalAVC,
    annualRegularAVC,
    lumpSumAVC,
    remainingHeadroom,
    taxRate,
    immediateTaxSaving,
    netMonthlyCost,
    isOverLimit,
    ageBandPercent,
  };
};

export const calculateProjections = (inputs: CalculatorInputs): CalculationResult => {
  const taxResult = calculateTaxRelief(inputs);
  const {
    currentAge,
    retirementAge,
    grossSalary,
    monthlyAVC,
    lumpSumAVC,
    isIndexLinked,
    investmentGrowth,
    managementFee,
    inflationRate,
    salaryGrowth,
    mainSchemeContribPercent
  } = inputs;

  const netGrowthRate = (investmentGrowth - managementFee) / 100;
  const inflationDecimal = inflationRate / 100;
  const salaryGrowthDecimal = salaryGrowth / 100;

  const projections: YearlyProjection[] = [];
  
  let currentFundNominal = 0;
  let currentSalary = grossSalary;
  let currentMonthlyAVC = monthlyAVC;
  let totalNetInput = 0;

  // Accumulation Phase
  for (let age = currentAge; age <= retirementAge; age++) {
    const yearIndex = age - currentAge;
    
    // Yearly Contribution
    const annualContrib = currentMonthlyAVC * 12;
    let yearTotalContribution = annualContrib;
    
    // Add Lump Sum in year 0
    if (yearIndex === 0) {
      currentFundNominal += lumpSumAVC;
      yearTotalContribution += lumpSumAVC;
    }
    
    // Apply Growth to existing fund + annual contributions
    // (Simplified: Add annual contribs to pot then grow. 
    // Ideally mid-year, but end-year is safer conservative estimate for accumulation start)
    currentFundNominal = (currentFundNominal + annualContrib) * (1 + netGrowthRate);

    // --- ACCURATE COST CALCULATION ---
    // Recalculate tax limits for this specific projection year to get accurate "Total Net Input"
    // This handles cases where salary growth might push you into a higher band or limit changes with age
    const ageBand = getAgeBandLimit(age);
    const effSalary = Math.min(currentSalary, EARNINGS_CAP);
    const limit = effSalary * ageBand;
    const mandatory = currentSalary * (mainSchemeContribPercent/100);
    const avcSpace = Math.max(0, limit - mandatory);

    // Determine how much of this year's contribution is relievable
    const relievable = Math.min(yearTotalContribution, avcSpace);
    const nonRelievable = yearTotalContribution - relievable;
    
    // Cost = (Relievable * (1 - Rate)) + NonRelievable
    // Using current tax rate assumption for simplicity of projection
    const yearCost = (relievable * (1 - taxResult.taxRate)) + nonRelievable;
    
    totalNetInput += yearCost;

    // Calculate Real Value
    const discountFactor = Math.pow(1 + inflationDecimal, yearIndex);
    const fundValueReal = currentFundNominal / discountFactor;

    projections.push({
      age,
      fundValueNominal: currentFundNominal,
      fundValueReal,
      totalContributed: totalNetInput,
    });

    // Increment for next year
    if (isIndexLinked) {
      currentMonthlyAVC = currentMonthlyAVC * (1 + salaryGrowthDecimal);
    }
    currentSalary = currentSalary * (1 + salaryGrowthDecimal);
  }

  const finalPotNominal = projections[projections.length - 1].fundValueNominal;
  const finalPotReal = projections[projections.length - 1].fundValueReal;

  // Decumulation Phase
  const taxFreeLumpSumNominal = finalPotNominal * 0.25;
  const taxFreeLumpSumReal = finalPotReal * 0.25;
  const arfPotNominal = finalPotNominal * 0.75;
  
  const drawdownSchedule: DrawdownYear[] = [];
  let currentBalanceNominal = arfPotNominal;
  
  // 20 Years Drawdown
  for (let i = 1; i <= 20; i++) {
    const yearIndex = (retirementAge - currentAge) + i;
    const age = retirementAge + i;

    // Withdrawal at start of year
    const annualDrawdownNominal = currentBalanceNominal * (inputs.drawdownRate / 100);
    currentBalanceNominal -= annualDrawdownNominal;
    
    // Growth on remainder
    currentBalanceNominal = currentBalanceNominal * (1 + netGrowthRate);

    // Real Value adjustments
    const discountFactor = Math.pow(1 + inflationDecimal, yearIndex);
    const annualIncomeReal = annualDrawdownNominal / discountFactor;
    const remainingBalanceReal = currentBalanceNominal / discountFactor;

    drawdownSchedule.push({
      age,
      annualIncomeNominal: annualDrawdownNominal,
      annualIncomeReal: annualIncomeReal,
      monthlyIncomeNominal: annualDrawdownNominal / 12,
      monthlyIncomeReal: annualIncomeReal / 12,
      remainingBalanceNominal: currentBalanceNominal,
      remainingBalanceReal: remainingBalanceReal,
    });
  }

  return {
    taxRelief: taxResult,
    projections,
    finalPotNominal,
    finalPotReal,
    taxFreeLumpSumNominal,
    taxFreeLumpSumReal,
    drawdownSchedule,
    totalNetInput
  };
};