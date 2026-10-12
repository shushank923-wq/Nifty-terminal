import React, { useState, useMemo } from 'react';
import { NseIndex, StockVariation, ActiveSecurity, FiiDiiItem, BulkDealsSummary } from '../types/nse';
import { formatINR, formatCrores } from '../utils/indicators';
import { 
  TrendingUp, TrendingDown, ArrowUpDown, Star, Search, Filter, 
  ExternalLink, BarChart2, DollarSign, Activity, CheckCircle2, Building2 
} from 'lucide-react';
import { BulkDealsView } from './BulkDealsView';

interface MarketExplorerProps {
  indices: NseIndex[];
  gainers: StockVariation[];
  losers: StockVariation[];
  activeVolume: ActiveSecurity[];
  activeValue: ActiveSecurity[];
  fiidii: FiiDiiItem[];
  bulkDeals?: BulkDealsSummary;
  watchlist: string[];
  onToggleWatchlist: (symbol: string) => void;
  onSelectSymbol: (symbol: string) => void;
  selectedSymbol: string;
  onOpenDetails: (symbol: string, data: any, type: 'index' | 'stock') => void;
}

export const MarketExplorer: React.FC<MarketExplorerProps> = ({
  indices,
  gainers,
  losers,
  activeVolume,
  activeValue,
  fiidii,
  bulkDeals,
  watchlist,
  onToggleWatchlist,
  onSelectSymbol,
  selectedSymbol,
  onOpenDetails,
}) => {
  const [activeTab, setActiveTab] = useState<'indices' | 'gainers_losers' | 'active' | 'fiidii' | 'bulk_deals' | 'watchlist'>('indices');
  const [indexCategory, setIndexCategory] = useState<string>('ALL');
  const [gainersLosersFilter, setGainersLosersFilter] = useState<'both' | 'gainers' | 'losers'>('both');
  const [activeSortType, setActiveSortType] = useState<'value' | 'volume'>('value');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('percentChange');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Filter indices
  const filteredIndices = useMemo(() => {
    return indices
      .filter(idx => {
        if (indexCategory === 'BROAD') return idx.key?.includes('BROAD') || idx.index.includes('NIFTY 50') || idx.index.includes('100') || idx.index.includes('500');
        if (indexCategory === 'SECTORAL') return idx.key?.includes('SECTORAL') || idx.index.includes('BANK') || idx.index.includes('IT') || idx.index.includes('AUTO') || idx.index.includes('PHARMA') || idx.index.includes('METAL');
        if (indexCategory === 'STRATEGY') return idx.key?.includes('STRATEGY') || idx.index.includes('ALPHA') || idx.index.includes('QUALITY') || idx.index.includes('MOMENTUM');
        return true;
      })
      .filter(idx => {
        if (!searchTerm) return true;
        return idx.index.toLowerCase().includes(searchTerm.toLowerCase());
      })
      .sort((a, b) => {
        const valA = (a as any)[sortField] ?? 0;
        const valB = (b as any)[sortField] ?? 0;
        if (typeof valA === 'string') return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        return sortAsc ? valA - valB : valB - valA;
      });
  }, [indices, indexCategory, searchTerm, sortField, sortAsc]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl shadow-xl backdrop-blur-md overflow-hidden flex flex-col">
      {/* Navigation Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800/80 px-4 pt-3 pb-2 gap-3 bg-slate-950/60">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'indices', label: `Indices (${indices.length})`, icon: BarChart2 },
            { id: 'gainers_losers', label: 'Top Gainers & Losers', icon: TrendingUp },
            { id: 'active', label: 'Most Active Equities', icon: Activity },
            { id: 'fiidii', label: 'FII & DII Cash Flows', icon: DollarSign },
            { id: 'bulk_deals', label: `Bulk Deals Summary (${bulkDeals?.totalDeals || 0})`, icon: Building2 },
            { id: 'watchlist', label: `Watchlist (${watchlist.length})`, icon: Star },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab specific mini controls */}
        {activeTab === 'indices' && (
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px] font-mono">
              {['ALL', 'BROAD', 'SECTORAL', 'STRATEGY'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setIndexCategory(cat)}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    indexCategory === cat ? 'bg-slate-800 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="w-3 h-3 text-slate-500 absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter index..."
                className="bg-slate-900 border border-slate-800 rounded-md pl-6 pr-2 py-1 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-32 font-mono"
              />
            </div>
          </div>
        )}

        {activeTab === 'gainers_losers' && (
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px] font-mono">
            {(['both', 'gainers', 'losers'] as const).map(f => (
              <button
                key={f}
                onClick={() => setGainersLosersFilter(f)}
                className={`px-2.5 py-0.5 rounded capitalize transition-colors ${
                  gainersLosersFilter === f ? 'bg-slate-800 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'active' && (
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px] font-mono">
            <button
              onClick={() => setActiveSortType('value')}
              className={`px-2.5 py-0.5 rounded transition-colors ${
                activeSortType === 'value' ? 'bg-slate-800 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              By Value (₹ Cr)
            </button>
            <button
              onClick={() => setActiveSortType('volume')}
              className={`px-2.5 py-0.5 rounded transition-colors ${
                activeSortType === 'volume' ? 'bg-slate-800 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              By Volume (Shares)
            </button>
          </div>
        )}
      </div>

      {/* TAB CONTENT 1: ALL INDICES TABLE */}
      {activeTab === 'indices' && (
        <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead className="bg-slate-950/80 sticky top-0 z-10 text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Symbol</th>
                <th 
                  onClick={() => handleSort('last')}
                  className="py-2.5 px-3 font-semibold text-right cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>LTP (₹)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('percentChange')}
                  className="py-2.5 px-3 font-semibold text-right cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Change (%)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3 font-semibold text-right hidden sm:table-cell">Day High / Low</th>
                <th className="py-2.5 px-3 font-semibold text-right hidden md:table-cell">52W Range</th>
                <th className="py-2.5 px-3 font-semibold text-right hidden lg:table-cell">P/E</th>
                <th className="py-2.5 px-3 font-semibold text-center hidden sm:table-cell">Adv / Dec</th>
                <th className="py-2.5 px-3 font-semibold text-right hidden xl:table-cell">365D %</th>
                <th className="py-2.5 px-3 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredIndices.map((idx) => {
                const isSelected = selectedSymbol === idx.index;
                const isUp = idx.percentChange >= 0;
                const isStarred = watchlist.includes(idx.index);

                return (
                  <tr
                    key={idx.index}
                    onClick={() => onSelectSymbol(idx.index)}
                    className={`hover:bg-slate-800/40 cursor-pointer transition-colors ${
                      isSelected ? 'bg-cyan-500/10' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-medium text-slate-100 flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWatchlist(idx.index);
                        }}
                        className="text-slate-500 hover:text-amber-400"
                      >
                        <Star className={`w-3.5 h-3.5 ${isStarred ? 'text-amber-400 fill-amber-400' : ''}`} />
                      </button>
                      <span className="font-bold">{idx.index}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-100">
                      ₹{formatINR(idx.last, 1)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`inline-flex items-center gap-0.5 font-bold ${
                        isUp ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {isUp ? '+' : ''}{idx.variation?.toFixed(2)} ({isUp ? '+' : ''}{idx.percentChange?.toFixed(2)}%)
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400 hidden sm:table-cell">
                      <span>{formatINR(idx.high, 0)}</span> / <span>{formatINR(idx.low, 0)}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400 hidden md:table-cell">
                      <span>{formatINR(idx.yearLow, 0)}</span> - <span>{formatINR(idx.yearHigh, 0)}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300 hidden lg:table-cell">
                      {idx.pe || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center hidden sm:table-cell">
                      <span className="text-emerald-400 font-semibold">{idx.advances}</span> : <span className="text-rose-400 font-semibold">{idx.declines}</span>
                    </td>
                    <td className={`py-2.5 px-3 text-right hidden xl:table-cell font-semibold ${
                      (idx.perChange365d ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {idx.perChange365d !== undefined ? `${idx.perChange365d >= 0 ? '+' : ''}${idx.perChange365d.toFixed(1)}%` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onOpenDetails(idx.index, idx, 'index')}
                        className="px-2 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB CONTENT 2: TOP GAINERS & LOSERS */}
      {activeTab === 'gainers_losers' && (
        <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
          {/* GAINERS COLUMN */}
          {(gainersLosersFilter === 'both' || gainersLosersFilter === 'gainers') && (
            <div className="bg-slate-950/60 rounded-xl border border-slate-800/80 p-3">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Top Market Gainers
                </h4>
              </div>

              <div className="space-y-2">
                {gainers.map((g) => {
                  const isStarred = watchlist.includes(g.symbol);
                  return (
                    <div
                      key={g.symbol}
                      onClick={() => onSelectSymbol(g.symbol)}
                      className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900 transition-all flex items-center justify-between cursor-pointer font-mono"
                    >
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleWatchlist(g.symbol);
                          }}
                          className="text-slate-500 hover:text-amber-400"
                        >
                          <Star className={`w-3.5 h-3.5 ${isStarred ? 'text-amber-400 fill-amber-400' : ''}`} />
                        </button>
                        <div>
                          <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                            <span>{g.symbol}</span>
                            <span className="text-[10px] text-slate-500">EQ</span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Vol: {(g.trade_quantity / 100000).toFixed(1)}L · Val: ₹{(g.turnover / 10000000).toFixed(1)} Cr
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-100">
                          ₹{formatINR(g.ltp)}
                        </div>
                        <div className="text-[11px] font-bold text-emerald-400">
                          +{g.perChange.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* LOSERS COLUMN */}
          {(gainersLosersFilter === 'both' || gainersLosersFilter === 'losers') && (
            <div className="bg-slate-950/60 rounded-xl border border-slate-800/80 p-3">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="w-4 h-4 text-rose-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400">
                  Top Market Losers
                </h4>
              </div>

              <div className="space-y-2">
                {losers.map((l) => {
                  const isStarred = watchlist.includes(l.symbol);
                  return (
                    <div
                      key={l.symbol}
                      onClick={() => onSelectSymbol(l.symbol)}
                      className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-rose-500/40 hover:bg-slate-900 transition-all flex items-center justify-between cursor-pointer font-mono"
                    >
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleWatchlist(l.symbol);
                          }}
                          className="text-slate-500 hover:text-amber-400"
                        >
                          <Star className={`w-3.5 h-3.5 ${isStarred ? 'text-amber-400 fill-amber-400' : ''}`} />
                        </button>
                        <div>
                          <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                            <span>{l.symbol}</span>
                            <span className="text-[10px] text-slate-500">EQ</span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Vol: {(l.trade_quantity / 100000).toFixed(1)}L · Val: ₹{(l.turnover / 10000000).toFixed(1)} Cr
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-100">
                          ₹{formatINR(l.ltp)}
                        </div>
                        <div className="text-[11px] font-bold text-rose-400">
                          {l.perChange.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 3: MOST ACTIVE EQUITIES */}
      {activeTab === 'active' && (
        <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead className="bg-slate-950/80 sticky top-0 z-10 text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Symbol</th>
                <th className="py-2.5 px-3 font-semibold text-right">LTP (₹)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Change (%)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Traded Volume</th>
                <th className="py-2.5 px-3 font-semibold text-right">Turnover (Value)</th>
                <th className="py-2.5 px-3 font-semibold text-right hidden md:table-cell">Day High / Low</th>
                <th className="py-2.5 px-3 font-semibold text-right hidden lg:table-cell">52W High / Low</th>
                <th className="py-2.5 px-3 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(activeSortType === 'value' ? activeValue : activeVolume).map(sec => {
                const isUp = sec.pChange >= 0;
                const isSelected = selectedSymbol === sec.symbol;
                const isStarred = watchlist.includes(sec.symbol);

                return (
                  <tr
                    key={sec.symbol}
                    onClick={() => onSelectSymbol(sec.symbol)}
                    className={`hover:bg-slate-800/40 cursor-pointer transition-colors ${
                      isSelected ? 'bg-cyan-500/10' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-medium text-slate-100 flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWatchlist(sec.symbol);
                        }}
                        className="text-slate-500 hover:text-amber-400"
                      >
                        <Star className={`w-3.5 h-3.5 ${isStarred ? 'text-amber-400 fill-amber-400' : ''}`} />
                      </button>
                      <span className="font-bold">{sec.symbol}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-100">
                      ₹{formatINR(sec.lastPrice)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isUp ? '+' : ''}{sec.pChange?.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300">
                      {(sec.quantityTraded / 100000).toFixed(2)} Lakhs
                    </td>
                    <td className="py-2.5 px-3 text-right text-cyan-300 font-semibold">
                      ₹{(sec.totalTradedValue / 10000000).toFixed(2)} Cr
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400 hidden md:table-cell">
                      ₹{formatINR(sec.dayHigh)} / ₹{formatINR(sec.dayLow)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400 hidden lg:table-cell">
                      ₹{formatINR(sec.yearHigh)} / ₹{formatINR(sec.yearLow)}
                    </td>
                    <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onOpenDetails(sec.symbol, sec, 'stock')}
                        className="px-2 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB CONTENT 4: FII / DII INSTITUTIONAL FLOWS */}
      {activeTab === 'fiidii' && (
        <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fiidii.map((item, idx) => {
              const net = parseFloat(String(item.netValue));
              const buy = parseFloat(String(item.buyValue));
              const sell = parseFloat(String(item.sellValue));
              const isNetPositive = net >= 0;

              return (
                <div key={idx} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 font-mono">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-white tracking-wide">
                      {item.category === 'DII' ? 'Domestic Institutional Investors (DII)' : 'Foreign Portfolio Investors (FII / FPI)'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {item.date}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Gross Buy Value:</span>
                      <span className="text-emerald-400 font-bold">₹{formatINR(buy)} Cr</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Gross Sell Value:</span>
                      <span className="text-rose-400 font-bold">₹{formatINR(sell)} Cr</span>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex justify-between text-sm">
                      <span className="text-slate-300 font-semibold">Net Cash Flow:</span>
                      <span className={`font-bold ${isNetPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isNetPositive ? '+' : ''}₹{formatINR(net)} Cr
                      </span>
                    </div>
                  </div>

                  {/* Relative bar */}
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-emerald-500 h-full" 
                      style={{ width: `${(buy / (buy + sell || 1)) * 100}%` }} 
                      title={`Buy: ₹${buy} Cr`}
                    />
                    <div 
                      className="bg-rose-500 h-full" 
                      style={{ width: `${(sell / (buy + sell || 1)) * 100}%` }} 
                      title={`Sell: ₹${sell} Cr`}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>Buy: {((buy / (buy + sell || 1)) * 100).toFixed(1)}%</span>
                    <span>Sell: {((sell / (buy + sell || 1)) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 text-xs font-mono text-slate-400 space-y-2">
            <h5 className="font-bold text-slate-200">NSE Cash Market Institutional Summary</h5>
            <p>
              Data reflects provisional institutional reporting provided to the National Stock Exchange of India (NSE). 
              A positive Net DII flow indicates domestic mutual funds, insurance companies, and pension funds are providing support against foreign capital movements.
            </p>
          </div>
        </div>
      )}

      {/* TAB CONTENT: BULK DEALS SUMMARY */}
      {activeTab === 'bulk_deals' && bulkDeals && (
        <BulkDealsView
          bulkDeals={bulkDeals}
          onSelectSymbol={onSelectSymbol}
          onOpenDetails={onOpenDetails}
          watchlist={watchlist}
          onToggleWatchlist={onToggleWatchlist}
        />
      )}

      {/* TAB CONTENT 5: WATCHLIST */}
      {activeTab === 'watchlist' && (
        <div className="p-4 max-h-[500px] overflow-y-auto">
          {watchlist.length === 0 ? (
            <div className="text-center py-12 text-slate-500 font-mono text-xs">
              <Star className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
              <p>Your watchlist is currently empty.</p>
              <p className="text-[11px] text-slate-600 mt-1">
                Click the star icon next to any index or equity to add it to your pinned watchlist.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {watchlist.map(sym => {
                // Find in indices or active or gainers
                const matchedIndex = indices.find(i => i.index === sym);
                const matchedStock = (activeValue.find(s => s.symbol === sym) || gainers.find(g => g.symbol === sym) || losers.find(l => l.symbol === sym)) as any;
                
                const price = matchedIndex?.last || matchedStock?.lastPrice || matchedStock?.ltp || 0;
                const pct = matchedIndex?.percentChange || matchedStock?.pChange || matchedStock?.perChange || 0;
                const isUp = pct >= 0;

                return (
                  <div
                    key={sym}
                    onClick={() => onSelectSymbol(sym)}
                    className="p-3 bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 rounded-xl flex items-center justify-between cursor-pointer font-mono transition-all group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{sym}</span>
                        <span className="text-[10px] text-slate-500">{matchedIndex ? 'INDEX' : 'EQUITY'}</span>
                      </div>
                      <div className="text-base font-bold text-slate-200 mt-1">
                        ₹{formatINR(price)}
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWatchlist(sym);
                        }}
                        className="text-amber-400 hover:text-slate-500 mb-1"
                        title="Remove from watchlist"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                      </button>
                      <span className={`text-xs font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isUp ? '+' : ''}{pct.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
