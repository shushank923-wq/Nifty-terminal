import React from 'react';
import { MarketStatusData } from '../types/nse';
import { RefreshCw, Volume2, VolumeX, Radio, Clock, ShieldCheck, Search } from 'lucide-react';
import { formatINR } from '../utils/indicators';

interface TerminalHeaderProps {
  secondsLeft: number;
  totalCycleSeconds: number;
  isRefreshing: boolean;
  lastUpdated: Date | null;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onManualRefresh: () => void;
  marketStatus: MarketStatusData | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const TerminalHeader: React.FC<TerminalHeaderProps> = ({
  secondsLeft,
  totalCycleSeconds,
  isRefreshing,
  lastUpdated,
  soundEnabled,
  onToggleSound,
  onManualRefresh,
  marketStatus,
  searchQuery,
  onSearchChange,
}) => {
  const cap = marketStatus?.marketcap;
  const gift = marketStatus?.giftnifty;
  const capitalState = marketStatus?.marketState?.find(s => s.market === 'Capital Market') || marketStatus?.marketState?.[0];
  const isMarketOpen = capitalState?.marketStatus?.toLowerCase() === 'open';

  // Format countdown minutes:seconds
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formattedCountdown = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  
  // Progress ratio (0 to 1)
  const progressRatio = secondsLeft / totalCycleSeconds;
  const strokeDashoffset = 100 - (progressRatio * 100);

  return (
    <header className="bg-slate-900/95 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Market Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 via-white to-emerald-600 p-[1.5px] shadow-lg shadow-cyan-500/10">
              <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center font-bold text-xs text-white">
                NSE
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-extrabold tracking-tight text-white font-mono">
                  NSE PULSE
                </h1>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                  Terminal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                National Stock Exchange of India
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-800 text-xs font-mono">
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${
              isMarketOpen 
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isMarketOpen ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              <span className="font-semibold text-[11px]">
                {capitalState?.marketStatus ? capitalState.marketStatus.toUpperCase() : 'MARKET CLOSED'}
              </span>
            </div>
            {capitalState?.tradeDate && (
              <span className="text-slate-400 text-[11px] hidden md:inline">
                {capitalState.tradeDate}
              </span>
            )}
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative flex-1 max-w-xs min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search index or stock (e.g. RELIANCE, NIFTY)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
            >
              ×
            </button>
          )}
        </div>

        {/* 2-Minute Auto-Refresh Engine Controls */}
        <div className="flex items-center gap-2.5 font-mono">
          {/* Circular Countdown Progress Widget */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1">
            <div className="relative w-5 h-5 flex items-center justify-center">
              <svg className="w-5 h-5 transform -rotate-90">
                <circle
                  cx="10"
                  cy="10"
                  r="7"
                  stroke="#1e293b"
                  strokeWidth="2"
                  fill="transparent"
                />
                <circle
                  cx="10"
                  cy="10"
                  r="7"
                  stroke="#06b6d4"
                  strokeWidth="2"
                  fill="transparent"
                  strokeDasharray="44"
                  strokeDashoffset={(44 * (1 - progressRatio))}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
            </div>

            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-cyan-300">
                  {formattedCountdown}
                </span>
                <span className="text-[9px] text-slate-400 uppercase tracking-wider">
                  2m Sync
                </span>
              </div>
              <span className="text-[9px] text-slate-400">
                {isRefreshing ? 'Fetching NSE...' : 'Auto-polling'}
              </span>
            </div>
          </div>

          {/* Manual Refresh Button */}
          <button
            onClick={onManualRefresh}
            disabled={isRefreshing}
            title="Force immediate NSE refresh"
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Sound Alert Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute 2-min sync audio chime' : 'Enable 2-min sync audio chime'}
            className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-slate-800 border-slate-700 text-cyan-400'
                : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </header>
  );
};
