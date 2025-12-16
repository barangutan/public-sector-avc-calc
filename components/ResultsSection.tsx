import React from 'react';
import { CalculationResult, ViewMode, CalculatorInputs } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowRight, AlertTriangle, TrendingUp, PiggyBank, Coins } from 'lucide-react';

interface ResultsSectionProps {
  results: CalculationResult;
  viewMode: ViewMode;
  onToggleView: (mode: ViewMode) => void;
  drawdownRate: number;
  onDrawdownChange: (val: number) => void;
}

const ResultsSection: React.FC<ResultsSectionProps> = ({ 
  results, 
  viewMode, 
  onToggleView,
  drawdownRate,
  onDrawdownChange
}) => {
  const { taxRelief, projections, drawdownSchedule } = results;
  const isReal = viewMode === ViewMode.Real;

  const currencyFormatter = new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  });

  const chartDataKey = isReal ? 'fundValueReal' : 'fundValueNominal';
  const finalPot = isReal ? results.finalPotReal : results.finalPotNominal;
  const taxFreeLump = isReal ? results.taxFreeLumpSumReal : results.taxFreeLumpSumNominal;

  // Calculate percentages for the bar chart
  const maxRelief = taxRelief.maxReliefAmount;
  const mandatoryPct = (taxRelief.mandatoryContribution / maxRelief) * 100;
  const regularAvcPct = (taxRelief.annualRegularAVC / maxRelief) * 100;
  const lumpSumPct = (taxRelief.lumpSumAVC / maxRelief) * 100;

  return (
    <div className="space-y-8">
      
      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Net Monthly Cost */}
        <div className="bg-emerald-600 text-white rounded-2xl shadow-xl shadow-emerald-900/10 p-6 relative overflow-hidden flex flex-col justify-between h-full">
            <div className="relative z-10">
              <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider mb-2">Net Monthly Cost</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-bold tracking-tight">{currencyFormatter.format(taxRelief.netMonthlyCost)}</h3>
                <span className="text-emerald-200 text-sm">/ month</span>
              </div>
              <p className="text-xs text-emerald-100/80 mt-2">After tax relief at source</p>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <Coins className="w-24 h-24" />
            </div>
        </div>

        {/* Card 2: Annual Tax Relief (Aggregated) */}
        <div className="bg-emerald-800 text-white rounded-2xl shadow-xl shadow-emerald-900/10 p-6 relative overflow-hidden flex flex-col justify-between h-full">
            <div className="relative z-10">
              <p className="text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-2">Annual Tax Relief Savings</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold tracking-tight">{currencyFormatter.format(taxRelief.immediateTaxSaving)}</h3>
              </div>
              <p className="text-xs text-emerald-300/60 mt-4 leading-relaxed">
                * Estimated immediate savings on your Regular AVCs (x12) + Lump Sum. Based on a {taxRelief.taxRate * 100}% rate.
              </p>
            </div>
            <div className="absolute -bottom-4 -right-4 opacity-10">
               <PiggyBank className="w-24 h-24 transform -rotate-12" />
            </div>
        </div>

        {/* Card 3: Capacity Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center lg:col-span-1 md:col-span-2">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">Relief Limit <span className="text-xs font-normal text-gray-500">(Age {results.projections[0].age})</span></h3>
              <p className="text-xs text-gray-500 mt-1">Band: <span className="font-medium text-emerald-600">{Math.round(taxRelief.ageBandPercent * 100)}% of Salary</span></p>
            </div>
            <div className="text-right">
               <span className="block text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Max Allowance</span>
               <span className="text-lg font-bold text-gray-800">{currencyFormatter.format(maxRelief)}</span>
            </div>
          </div>
          
          {/* Stacked Bar */}
          <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden flex mb-3 ring-1 ring-gray-200">
            {/* 1. Mandatory */}
            <div 
              style={{ width: `${mandatoryPct}%` }} 
              className="bg-gray-400 h-full transition-all duration-500" 
            ></div>
            {/* 2. Regular AVC */}
            <div 
              style={{ width: `${regularAvcPct}%` }} 
              className={`h-full transition-all duration-500 ${taxRelief.isOverLimit ? 'bg-emerald-400/80' : 'bg-emerald-500'}`}
            ></div>
            {/* 3. Lump Sum */}
            <div 
              style={{ width: `${lumpSumPct}%` }} 
              className={`h-full transition-all duration-500 ${taxRelief.isOverLimit ? 'bg-teal-300' : 'bg-teal-400'}`}
            ></div>
          </div>
          
          {/* Legend */}
          <div className="grid grid-cols-2 gap-y-1 gap-x-2 text-[10px] text-gray-500 mb-3">
             <div className="flex items-center gap-1.5">
               <div className="w-2 h-2 rounded-full bg-gray-400"></div> 
               <span>Main Scheme</span>
             </div>
             <div className="flex items-center gap-1.5">
               <div className="w-2 h-2 rounded-full bg-emerald-500"></div> 
               <span>Regular AVC</span>
             </div>
             <div className="flex items-center gap-1.5">
               <div className="w-2 h-2 rounded-full bg-teal-400"></div> 
               <span>Lump Sum</span>
             </div>
          </div>

          <div className="pt-3 border-t border-gray-50 flex justify-between items-center">
            {taxRelief.isOverLimit ? (
               <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-100 w-full justify-center">
                 <AlertTriangle className="w-3 h-3"/> 
                 <span className="font-bold text-xs">Over Limit by {currencyFormatter.format(Math.abs(taxRelief.remainingHeadroom))}</span>
               </div>
            ) : (
               <span className="text-emerald-700 font-medium text-xs flex items-center gap-1.5 w-full justify-end">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                 Room: {currencyFormatter.format(taxRelief.remainingHeadroom)}
               </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Projection Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600"/>
              Fund Projection
            </h2>
            <p className="text-sm text-gray-500 mt-1">Projected growth until retirement age {results.projections[results.projections.length-1].age}</p>
          </div>
          
          {/* Toggle */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
             <button 
               onClick={() => onToggleView(ViewMode.Nominal)}
               className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${viewMode === ViewMode.Nominal ? 'bg-white text-emerald-900 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}
             >
               Future €
             </button>
             <button 
               onClick={() => onToggleView(ViewMode.Real)}
               className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${viewMode === ViewMode.Real ? 'bg-white text-emerald-900 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}
             >
               Today's Money
             </button>
          </div>
        </div>

        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projections} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorFund" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="age" 
                tick={{fontSize: 12, fill: '#94a3b8'}} 
                tickLine={false} 
                axisLine={false} 
                dy={10}
              />
              <YAxis 
                tickFormatter={(value) => `€${value / 1000}k`} 
                tick={{fontSize: 12, fill: '#94a3b8'}} 
                tickLine={false} 
                axisLine={false}
                dx={-10}
              />
              <Tooltip 
                formatter={(value: number) => [currencyFormatter.format(value), "Fund Value"]}
                labelFormatter={(label) => `Age ${label}`}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                cursor={{ stroke: '#10b981', strokeWidth: 2, strokeDasharray: '4 4' }}
              />
              <Area 
                type="monotone" 
                dataKey={chartDataKey} 
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorFund)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10 pt-8 border-t border-gray-50">
           <div className="text-center group">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-2 font-semibold">Total Net Input</p>
              <p className="text-2xl font-bold text-gray-700 group-hover:text-gray-900 transition-colors">{currencyFormatter.format(results.totalNetInput)}</p>
           </div>
           <div className="text-center group">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-2 font-semibold">Estimated Pot</p>
              <p className="text-3xl font-bold text-emerald-600 group-hover:text-emerald-700 transition-colors">{currencyFormatter.format(finalPot)}</p>
           </div>
           <div className="text-center group">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-2 font-semibold">Tax-Free Lump (25%)</p>
              <p className="text-2xl font-bold text-emerald-500 group-hover:text-emerald-600 transition-colors">{currencyFormatter.format(taxFreeLump)}</p>
           </div>
        </div>
      </div>

      {/* Drawdown Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
           <div>
             <h2 className="text-lg font-bold text-gray-800">Retirement Drawdown</h2>
             <p className="text-sm text-gray-500 mt-1">Projected income (ARF) after taking 25% tax-free lump sum.</p>
           </div>
           <div className="flex items-center gap-4 bg-gray-50 px-5 py-3 rounded-xl border border-gray-100">
             <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Withdrawal Rate: <span className="text-emerald-600 font-bold ml-1">{drawdownRate}%</span></label>
             <input 
               type="range" 
               min="2" 
               max="10" 
               step="0.5" 
               value={drawdownRate}
               onChange={(e) => onDrawdownChange(parseFloat(e.target.value))}
               className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
             />
           </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-100">
          <table className="min-w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 backdrop-blur">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Age</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-emerald-700">Annual Income</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Monthly Income</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">Balance Remaining</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {drawdownSchedule.slice(0, 10).map((row) => (
                <tr key={row.age} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{row.age}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">
                    {currencyFormatter.format(isReal ? row.annualIncomeReal : row.annualIncomeNominal)}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {currencyFormatter.format(isReal ? row.monthlyIncomeReal : row.monthlyIncomeNominal)}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-right tabular-nums">
                    {currencyFormatter.format(isReal ? row.remainingBalanceReal : row.remainingBalanceNominal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="bg-gray-50 px-6 py-3 text-center text-xs text-gray-400 italic border-t border-gray-100">
            Showing first 10 years of drawdown
          </div>
        </div>
      </div>

    </div>
  );
};

export default ResultsSection;