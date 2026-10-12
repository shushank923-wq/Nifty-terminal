import React from 'react';
import { NseIndex, MarketStatusData, FiiDiiItem } from '../types/nse';
import { formatINR } from '../utils/indicators';
import { TrendingUp, TrendingDown, DollarSign, Activity, Users, Globe2, ShieldAlert } from 'lucide-react';

interface MarketMetricsHeroProps {
  indices: NseIndex[];
  marketStatus: MarketStatusData | null;
  fiidii: FiiDiiItem[];
  onSelectIndex: (name: string) => void;
  selectedIndex: string;
}

export const MarketMetricsHero: React.FC<MarketMetricsHeroProps> = ({
  indices,
  marketStatus,
  fiidii,
  onSelectIndex,
  selectedIndex,
}) => {
  const nifty50 = indices.find(i => i.index === 'NIFTY 50') || indices[0];
  const niftyBank = indices.find(i => i.index === 'NIFTY BANK');
  const indiaVix = indices.find(i => i.index === 'INDIA VIX');
  const cap = marketStatus?.marketcap;
  const gift = marketStatus?.giftnifty;

  // Calculate Market Breadth across all indices or Nifty 50
  const adv50 = Number(nifty50?.advances || 13);
  const dec50 = Number(nifty50?.declines || 36);
  const unch50 = Number(nifty50?.unchanged || 1);
  const total50 = adv50 + dec50 + unch50 || 50;
  const advPct = Math.round((adv50 / total50) * 100);

  // FII and DII figures
  const dii = fiidii.find(f => f.category === 'DII');
  const fii = fiidii.find(f => f.category === 'FII/FPI');
  const diiNet = dii ? parseFloat(String(dii.netValue)) : 0;
  const fiiNet = fii ? parseFloat(String(fii.netValue)) : 0;
  const totalNet = diiNet + fiiNet;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* 1. NIFTY 50 Primary Card */}
      <div 
        onClick={() => nifty50 && onSelectIndex(nifty50.index)}
        className={`bg-slate-900/90 border border-slate-800/80 rounded-xl p-3.5 shadow-lg flex flex-col justify-between cursor-pointer hover:border-cyan-500/50 transition-all ${
          selectedIndex === 'NIFTY 50' ? 'ring-2 ring-cyan-500/50' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-white">NIFTY 50</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">BENCHMARK</span>
          </div>
          {nifty50 && (
            <span className={`text-xs font-bold font-mono flex items-center gap-0.5 ${
              nifty50.percentChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {nifty50.percentChange >= 0 ? '+' : ''}{nifty50.percentChange.toFixed(2)}%
            </span>
          )}
        </div>

        <div className="my-2">
          <div className="text-2xl font-bold font-mono tracking-tight text-white">
            ₹{nifty50 ? formatINR(nifty50.last) : '22,363.35'}
          </div>
          <div className="text-xs font-mono text-slate-400 flex items-center gap-2 mt-0.5">
            <span className={nifty50 && nifty50.variation >= 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
              {nifty50 && nifty50.variation >= 0 ? '+' : ''}{nifty50?.variation?.toFixed(2)} pts
            </span>
            <span>· Prev: ₹{nifty50 ? formatINR(nifty50.previousClose) : '—'}</span>
          </div>
        </div>

        {/* 52W Range Micro Bar */}
        {nifty50 && (
          <div className="pt-2 border-t border-slate-800/60 text-[11px] font-mono text-slate-400">
            <div className="flex justify-between text-[10px] mb-1">
              <span>52W L: ₹{formatINR(nifty50.yearLow, 0)}</span>
              <span>52W H: ₹{formatINR(nifty50.yearHigh, 0)}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-400 rounded-full"
                style={{
                  width: `${Math.min(100, Math.max(5, ((nifty50.last - nifty50.yearLow) / (nifty50.yearHigh - nifty50.yearLow)) * 100))}%`
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. NIFTY BANK Card */}
      <div 
        onClick={() => niftyBank && onSelectIndex(niftyBank.index)}
        className={`bg-slate-900/90 border border-slate-800/80 rounded-xl p-3.5 shadow-lg flex flex-col justify-between cursor-pointer hover:border-cyan-500/50 transition-all ${
          selectedIndex === 'NIFTY BANK' ? 'ring-2 ring-cyan-500/50' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-white">NIFTY BANK</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">BANKING</span>
          </div>
          {niftyBank && (
            <span className={`text-xs font-bold font-mono flex items-center gap-0.5 ${
              niftyBank.percentChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {niftyBank.percentChange >= 0 ? '+' : ''}{niftyBank.percentChange.toFixed(2)}%
            </span>
          )}
        </div>

        <div className="my-2">
          <div className="text-2xl font-bold font-mono tracking-tight text-white">
            ₹{niftyBank ? formatINR(niftyBank.last) : '54,918.00'}
          </div>
          <div className="text-xs font-mono text-slate-400 flex items-center gap-2 mt-0.5">
            <span className={niftyBank && niftyBank.variation >= 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
              {niftyBank && niftyBank.variation >= 0 ? '+' : ''}{niftyBank?.variation?.toFixed(2)} pts
            </span>
            <span>· P/E: {niftyBank?.pe || '14.8'}</span>
          </div>
        </div>

        {/* Bank Nifty Day Range */}
        {niftyBank && (
          <div className="pt-2 border-t border-slate-800/60 text-[11px] font-mono text-slate-400">
            <div className="flex justify-between text-[10px] mb-1">
              <span>Day Low: ₹{formatINR(niftyBank.low, 0)}</span>
              <span>Day High: ₹{formatINR(niftyBank.high, 0)}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-400 rounded-full"
                style={{
                  width: `${Math.min(100, Math.max(5, ((niftyBank.last - niftyBank.low) / (niftyBank.high - niftyBank.low || 1)) * 100))}%`
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Market Breadth & Volatility */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-3.5 shadow-lg flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-white">MARKET BREADTH</span>
          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>NIFTY 50</span>
          </div>
        </div>

        {/* Advances / Declines Bar */}
        <div className="my-2">
          <div className="flex justify-between text-xs font-mono font-bold mb-1.5">
            <span className="text-emerald-400">{adv50} ADVANCES</span>
            <span className="text-rose-400">{dec50} DECLINES</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500" 
              style={{ width: `${advPct}%` }}
              title={`${adv50} Advances (${advPct}%)`}
            />
            <div 
              className="h-full bg-rose-500 transition-all duration-500" 
              style={{ width: `${100 - advPct}%` }}
              title={`${dec50} Declines`}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
            <span>Ratio: {(adv50 / (dec50 || 1)).toFixed(2)}x</span>
            <span>Unchanged: {unch50}</span>
          </div>
        </div>

        {/* India VIX */}
        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">INDIA VIX (VOLATILITY)</span>
          <span className={`font-bold ${indiaVix && indiaVix.percentChange >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {indiaVix?.last || '13.85'} ({indiaVix && indiaVix.percentChange >= 0 ? '+' : ''}{indiaVix?.percentChange?.toFixed(2) || '4.69'}%)
          </span>
        </div>
      </div>

      {/* 4. Institutional Flows (FII & DII Cash Market) */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-3.5 shadow-lg flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-white">INSTITUTIONAL FLOWS</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
            {dii?.date || 'TODAY'}
          </span>
        </div>

        <div className="my-2 space-y-1.5 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">DII (DOMESTIC):</span>
            <span className={`font-bold ${diiNet >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {diiNet >= 0 ? '+' : ''}₹{formatINR(diiNet)} Cr
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">FII / FPI (FOREIGN):</span>
            <span className={`font-bold ${fiiNet >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {fiiNet >= 0 ? '+' : ''}₹{formatINR(fiiNet)} Cr
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
            <span className="text-slate-400 font-semibold">NET INSTITUTIONAL:</span>
            <span className={`font-bold ${totalNet >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalNet >= 0 ? '+' : ''}₹{formatINR(totalNet)} Cr
            </span>
          </div>
        </div>

        {/* Market Cap & GIFT Nifty Footer */}
        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>GIFT NIFTY: <strong className="text-slate-200">{gift?.LASTPRICE ? `₹${formatINR(gift.LASTPRICE)}` : '22,409.5'}</strong></span>
          <span>MCAP: <strong className="text-slate-200">₹{cap?.marketCapinLACCRRupees || '461.1'}L Cr</strong></span>
        </div>
      </div>
    </div>
  );
};
