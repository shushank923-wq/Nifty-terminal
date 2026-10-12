import React from 'react';
import { NseIndex } from '../types/nse';
import { formatINR } from '../utils/indicators';
import { TrendingUp, TrendingDown, Layers } from 'lucide-react';

interface SectorHeatmapProps {
  indices: NseIndex[];
  onSelectIndex: (indexName: string) => void;
  selectedIndex: string;
}

export const SectorHeatmap: React.FC<SectorHeatmapProps> = ({
  indices,
  onSelectIndex,
  selectedIndex,
}) => {
  // Filter key sectoral indices
  const sectorKeywords = [
    'NIFTY BANK',
    'NIFTY IT',
    'NIFTY AUTO',
    'NIFTY PHARMA',
    'NIFTY METAL',
    'NIFTY FMCG',
    'NIFTY REALTY',
    'NIFTY FINANCIAL SERVICES',
    'NIFTY MEDIA',
    'NIFTY ENERGY',
    'NIFTY INFRASTRUCTURE',
    'NIFTY COMMODITIES'
  ];

  const sectorIndices = indices.filter(idx => 
    sectorKeywords.includes(idx.index) || (idx.key === 'SECTORAL')
  ).slice(0, 12);

  const getColorClass = (pct: number) => {
    if (pct >= 2.0) return 'bg-emerald-500/30 border-emerald-500/60 text-emerald-300';
    if (pct >= 1.0) return 'bg-emerald-600/25 border-emerald-500/40 text-emerald-400';
    if (pct > 0.0) return 'bg-emerald-700/15 border-emerald-600/30 text-emerald-400';
    if (pct === 0.0) return 'bg-slate-800/40 border-slate-700/40 text-slate-300';
    if (pct > -1.0) return 'bg-rose-700/15 border-rose-600/30 text-rose-400';
    if (pct > -2.0) return 'bg-rose-600/25 border-rose-500/40 text-rose-400';
    return 'bg-rose-500/35 border-rose-500/60 text-rose-300';
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-4 shadow-xl backdrop-blur-md flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-100 tracking-wide uppercase">
            Sectoral Momentum Heatmap
          </h3>
        </div>
        <span className="text-xs text-slate-500 font-mono">NSE Sector Indices</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {sectorIndices.map(sec => {
          const isSelected = selectedIndex === sec.index;
          const isUp = sec.percentChange >= 0;

          return (
            <button
              key={sec.index}
              onClick={() => onSelectIndex(sec.index)}
              className={`p-3 rounded-lg border text-left transition-all duration-150 flex flex-col justify-between h-24 hover:scale-[1.02] cursor-pointer ${
                getColorClass(sec.percentChange)
              } ${isSelected ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950' : ''}`}
            >
              <div className="flex items-start justify-between w-full">
                <span className="text-xs font-bold truncate max-w-[110px] text-slate-100" title={sec.index}>
                  {sec.index.replace('NIFTY ', '')}
                </span>
                {isUp ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                )}
              </div>

              <div>
                <div className="text-sm font-mono font-bold text-slate-100">
                  ₹{formatINR(sec.last, 1)}
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono mt-0.5">
                  <span className="font-semibold">
                    {isUp ? '+' : ''}{sec.percentChange?.toFixed(2)}%
                  </span>
                  <span className="text-[10px] text-slate-400 opacity-80">
                    {sec.advances}:{sec.declines}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
