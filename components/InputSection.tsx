import React, { useState } from 'react';
import { CalculatorInputs } from '../types';
import { ChevronDown, ChevronUp, Info, User, Wallet, Settings } from 'lucide-react';

interface InputSectionProps {
  inputs: CalculatorInputs;
  onChange: (key: keyof CalculatorInputs, value: number | boolean) => void;
}

const InputSection: React.FC<InputSectionProps> = ({ inputs, onChange }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, key: keyof CalculatorInputs, type: 'number' | 'boolean' = 'number') => {
    let value: number | boolean = type === 'boolean' ? e.target.checked : parseFloat(e.target.value);
    if (type === 'number' && isNaN(value as number)) value = 0;
    onChange(key, value);
  };

  return (
    <div className="space-y-8">
      {/* Profile Card */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6 text-emerald-800 border-b border-gray-50 pb-4">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <User className="w-5 h-5 text-emerald-600" />
          </div>
          <h2 className="font-semibold text-lg tracking-tight">Your Profile</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Age</label>
            <input
              type="number"
              value={inputs.currentAge}
              onChange={(e) => handleChange(e, 'currentAge')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Retirement Age</label>
            <input
              type="number"
              value={inputs.retirementAge}
              onChange={(e) => handleChange(e, 'retirementAge')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Gross Annual Salary (€)</label>
          <input
            type="number"
            value={inputs.grossSalary}
            onChange={(e) => handleChange(e, 'grossSalary')}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Contributions Card */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6 text-emerald-800 border-b border-gray-50 pb-4">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <Wallet className="w-5 h-5 text-emerald-600" />
          </div>
          <h2 className="font-semibold text-lg tracking-tight">Contributions</h2>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-gray-700">Monthly Regular AVC (€)</label>
              <span className="text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full text-sm">€{inputs.monthlyAVC}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2500"
              step="50"
              value={inputs.monthlyAVC}
              onChange={(e) => handleChange(e, 'monthlyAVC')}
              className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-600 transition-all"
            />
            <input
              type="number"
              value={inputs.monthlyAVC}
              onChange={(e) => handleChange(e, 'monthlyAVC')}
              className="mt-3 w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">One-off Lump Sum (€)</label>
            <input
              type="number"
              value={inputs.lumpSumAVC === 0 ? '' : inputs.lumpSumAVC}
              onChange={(e) => handleChange(e, 'lumpSumAVC')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all bg-emerald-50/30 placeholder-gray-400"
              placeholder="0"
            />
          </div>

          <div className="flex items-center gap-3 pt-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
            <input
              type="checkbox"
              id="indexLinked"
              checked={inputs.isIndexLinked}
              onChange={(e) => handleChange(e, 'isIndexLinked', 'boolean')}
              className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer"
            />
            <label htmlFor="indexLinked" className="text-sm text-gray-700 cursor-pointer select-none">
              Increase contributions with salary?
            </label>
          </div>
        </div>
      </div>

      {/* Advanced Assumptions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between p-5 bg-white hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3 text-gray-700">
            <div className="p-1.5 bg-gray-100 rounded-md">
              <Settings className="w-4 h-4 text-gray-500" />
            </div>
            <span className="font-medium">Assumptions & Fees</span>
          </div>
          {showAdvanced ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {showAdvanced && (
          <div className="p-8 border-t border-gray-100 bg-gray-50/50 grid grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-200">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Inv. Growth (%)</label>
              <input
                type="number"
                step="0.1"
                value={inputs.investmentGrowth}
                onChange={(e) => handleChange(e, 'investmentGrowth')}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Mgmt Fee (%)</label>
              <input
                type="number"
                step="0.1"
                value={inputs.managementFee}
                onChange={(e) => handleChange(e, 'managementFee')}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Inflation (%)</label>
              <input
                type="number"
                step="0.1"
                value={inputs.inflationRate}
                onChange={(e) => handleChange(e, 'inflationRate')}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Salary Growth (%)</label>
              <input
                type="number"
                step="0.1"
                value={inputs.salaryGrowth}
                onChange={(e) => handleChange(e, 'salaryGrowth')}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
            </div>
            <div className="col-span-2">
              <div className="flex items-center gap-1 mb-2">
                 <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">Main Pension Contrib (%)</label>
                 <div className="group relative">
                   <Info className="w-3 h-3 text-gray-400 cursor-help"/>
                   <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-48 bg-gray-800 text-white text-xs p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 mb-2">
                     Includes Spouses & Childrens, Main Scheme, etc.
                   </div>
                 </div>
              </div>
              <input
                type="number"
                step="0.1"
                value={inputs.mainSchemeContribPercent}
                onChange={(e) => handleChange(e, 'mainSchemeContribPercent')}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputSection;