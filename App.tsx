import React, { useState, useMemo } from 'react';
import { CalculatorInputs, ViewMode } from './types';
import { DEFAULT_INPUTS } from './constants';
import { calculateProjections } from './utils/calculations';
import InputSection from './components/InputSection';
import ResultsSection from './components/ResultsSection';

const App: React.FC = () => {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Nominal);

  const handleInputChange = (key: keyof CalculatorInputs, value: number | boolean) => {
    setInputs((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const results = useMemo(() => calculateProjections(inputs), [inputs]);

  return (
    <div className="min-h-screen bg-[#f0fdf4] font-sans pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">P</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">Public Sector AVC Planner</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Advanced projection with inflation & salary indexing</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-4 xl:col-span-3">
             <div className="sticky top-24">
                <InputSection inputs={inputs} onChange={handleInputChange} />
             </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-8 xl:col-span-9">
            <ResultsSection 
              results={results} 
              viewMode={viewMode}
              onToggleView={setViewMode}
              drawdownRate={inputs.drawdownRate}
              onDrawdownChange={(val) => handleInputChange('drawdownRate', val)}
            />
          </div>
        </div>
      </main>

      {/* Footer Disclaimer */}
      <footer className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-xs mt-12 mb-8">
        <p>Disclaimer: This calculator is for illustrative purposes only. Estimates are based on assumptions about future growth, inflation, and tax laws which may change. It does not constitute financial advice. The "Real" view assumes future values are discounted by the inflation rate.</p>
      </footer>
    </div>
  );
};

export default App;
