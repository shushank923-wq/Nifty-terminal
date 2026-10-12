import React from 'react';
import { NseIndex, StockVariation } from '../types/nse';
import { formatINR } from '../utils/indicators';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TickerRibbonProps {
  indices: NseIndex[];
  gainers: StockVariation[];
  onSelectSymbol: (symbol: string) => void;
  selectedSymbol: string;
}

export const TickerRibbon: React.FC<TickerRibbonProps> = ({
  indices,
  gainers,
  onSelectSymbol,
  selectedSymbol,
}) => {
  // Key items to show in quick ribbon
  const ribbonItems = [
    ...indices.slice(0, 8).map(i => ({
      name: i.index,
      price: i.last,
      change: i.variation,
      pct: i.percentChange,
      isIndex: true,
    })),
    ...gainers.slice(0, 5).map(g => ({
      name: g.symbol,
      price: g.ltp,
      change: g.ltp - g.prev_price,
      pct: g.perChange,
      isIndex: false,
    }))
  ];

  return (
    <div className="w-full bg-slate-950/90 border-y border-slate-800/80 overflow-x-auto no-scrollbar py-2 px-4 backdrop-blur-sm">
      <div className="flex items-center gap-3 min-w-max">
        {ribbonItems.map((item, idx) => {
          const isUp = item.pct >= 0;
          const isSelected = selectedSymbol === item.name;

          return (
            <button
              key={`${item.name}-${idx}`}
              onClick={() => onSelectSymbol(item.name)}
              className={`flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-mono transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200'
                  : 'bg-slate-900/60 border-slate-800/60 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <span className="font-bold text-slate-100">{item.name}</span>
              <span className="text-slate-200">₹{formatINR(item.price, item.isIndex ? 1 : 2)}</span>
              <span className={`flex items-center text-[11px] font-semibold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isUp ? <TrendingUp className="w-3 h-3 mr-0.5 inline" /> : <TrendingDown className="w-3 h-3 mr-0.5 inline" />}
                {isUp ? '+' : ''}{item.pct?.toFixed(2)}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
