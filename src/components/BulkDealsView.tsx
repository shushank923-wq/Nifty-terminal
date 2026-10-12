import React, { useState, useMemo } from 'react';
import { BulkDealsSummary, BulkDealItem } from '../types/nse';
import { formatINR } from '../utils/indicators';
import { 
  Building2, TrendingUp, TrendingDown, ArrowUpDown, Filter, 
  Search, ShieldAlert, PieChart, Layers, BarChart2, Star 
} from 'lucide-react';

interface BulkDealsViewProps {
  bulkDeals: BulkDealsSummary;
  onSelectSymbol: (symbol: string) => void;
  onOpenDetails: (symbol: string, data: any, type: 'index' | 'stock') => void;
  watchlist: string[];
  onToggleWatchlist: (symbol: string) => void;
}

export const BulkDealsView: React.FC<BulkDealsViewProps> = ({
  bulkDeals,
  onSelectSymbol,
  onOpenDetails,
  watchlist,
  onToggleWatchlist,
}) => {
  const [dealTypeFilter, setDealTypeFilter] = useState<'ALL' | 'BUY' | 'SELL' | 'BLOCK'>('ALL');
  const [minSizeCr, setMinSizeCr] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<'valueInCrores' | 'price' | 'quantity' | 'symbol'>('valueInCrores');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const deals = bulkDeals?.deals || [];

  const filteredDeals = useMemo(() => {
    return deals
      .filter(d => {
        if (dealTypeFilter === 'BUY') return d.dealType === 'BUY';
        if (dealTypeFilter === 'SELL') return d.dealType === 'SELL';
        if (dealTypeFilter === 'BLOCK') return d.isBlockDeal;
        return true;
      })
      .filter(d => d.valueInCrores >= minSizeCr)
      .filter(d => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (
          d.symbol.toLowerCase().includes(q) ||
          d.securityName.toLowerCase().includes(q) ||
          d.clientName.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const valA = (a as any)[sortField] ?? 0;
        const valB = (b as any)[sortField] ?? 0;
        if (typeof valA === 'string') return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        return sortAsc ? valA - valB : valB - valA;
      });
  }, [deals, dealTypeFilter, minSizeCr, searchTerm, sortField, sortAsc]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const buyRatio = bulkDeals.totalTurnoverCr > 0 
    ? Math.round((bulkDeals.buyValueCr / bulkDeals.totalTurnoverCr) * 100) 
    : 50;

  return (
    <div className="p-4 space-y-4">
      {/* 1. Header Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Turnover */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="uppercase font-semibold">Total Bulk Turnover</span>
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="my-1.5 font-mono">
            <div className="text-2xl font-bold text-white">
              ₹{formatINR(bulkDeals.totalTurnoverCr)} Cr
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {bulkDeals.totalDeals} transactions reported today
            </div>
          </div>
          <div className="text-[10px] font-mono text-slate-500 pt-1.5 border-t border-slate-800/60">
            NSE Institutional & HNI Deals
          </div>
        </div>

        {/* Gross Buy Value */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="uppercase font-semibold">Institutional Buying</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="my-1.5 font-mono">
            <div className="text-2xl font-bold text-emerald-400">
              ₹{formatINR(bulkDeals.buyValueCr)} Cr
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {bulkDeals.buyDealsCount} Buy Orders ({buyRatio}%)
            </div>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${buyRatio}%` }} />
          </div>
        </div>

        {/* Gross Sell Value */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="uppercase font-semibold">Institutional Selling</span>
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="my-1.5 font-mono">
            <div className="text-2xl font-bold text-rose-400">
              ₹{formatINR(bulkDeals.sellValueCr)} Cr
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {bulkDeals.sellDealsCount} Sell Orders ({100 - buyRatio}%)
            </div>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-rose-500" style={{ width: `${100 - buyRatio}%` }} />
          </div>
        </div>

        {/* Net Flow Balance */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="uppercase font-semibold">Net Deal Pressure</span>
            <PieChart className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="my-1.5 font-mono">
            <div className={`text-2xl font-bold ${bulkDeals.netFlowCr >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {bulkDeals.netFlowCr >= 0 ? '+' : ''}₹{formatINR(bulkDeals.netFlowCr)} Cr
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {bulkDeals.netFlowCr >= 0 ? 'Net Accumulation bias' : 'Net Distribution bias'}
            </div>
          </div>
          <div className="text-[10px] font-mono text-slate-500 pt-1.5 border-t border-slate-800/60 flex justify-between">
            <span>Block Deals: {bulkDeals.blockDealsCount || 0}</span>
            <span>₹{formatINR(bulkDeals.blockDealsValueCr || 0)} Cr</span>
          </div>
        </div>
      </div>

      {/* 2. Key Accumulation vs Distribution Leaders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Top Accumulated */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2.5 text-xs font-mono font-bold text-emerald-400 uppercase">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Top Accumulated Equities</span>
          </div>
          <div className="space-y-1.5 font-mono text-xs">
            {bulkDeals.topAccumulated.map((item, idx) => (
              <div
                key={idx}
                onClick={() => onSelectSymbol(item.symbol)}
                className="p-2 rounded-lg bg-slate-900/50 hover:bg-slate-900 hover:border-emerald-500/40 border border-slate-800/60 flex items-center justify-between cursor-pointer transition-all"
              >
                <div>
                  <div className="font-bold text-slate-100 flex items-center gap-1.5">
                    <span>{item.symbol}</span>
                    <BarChart2 className="w-3 h-3 text-cyan-400 opacity-60" />
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                    {item.securityName}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-400">
                    +₹{formatINR(item.netBuyCr)} Cr
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Buy: ₹{formatINR(item.buyValueCr)} Cr
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Distributed */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2.5 text-xs font-mono font-bold text-rose-400 uppercase">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Top Distributed Equities</span>
          </div>
          <div className="space-y-1.5 font-mono text-xs">
            {bulkDeals.topDistributed.map((item, idx) => (
              <div
                key={idx}
                onClick={() => onSelectSymbol(item.symbol)}
                className="p-2 rounded-lg bg-slate-900/50 hover:bg-slate-900 hover:border-rose-500/40 border border-slate-800/60 flex items-center justify-between cursor-pointer transition-all"
              >
                <div>
                  <div className="font-bold text-slate-100 flex items-center gap-1.5">
                    <span>{item.symbol}</span>
                    <BarChart2 className="w-3 h-3 text-cyan-400 opacity-60" />
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                    {item.securityName}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-rose-400">
                    -₹{formatINR(item.netSellCr)} Cr
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Sell: ₹{formatINR(item.sellValueCr)} Cr
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Active Clients */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2.5 text-xs font-mono font-bold text-amber-400 uppercase">
            <Building2 className="w-3.5 h-3.5" />
            <span>Key Institutional Participants</span>
          </div>
          <div className="space-y-1.5 font-mono text-xs">
            {bulkDeals.topClients.slice(0, 5).map((c, idx) => (
              <div
                key={idx}
                className="p-2 rounded-lg bg-slate-900/50 border border-slate-800/60 flex items-center justify-between"
              >
                <div className="max-w-[180px]">
                  <div className="font-bold text-slate-200 text-[11px] truncate" title={c.clientName}>
                    {c.clientName}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    B: ₹{formatINR(c.buyValueCr)} Cr · S: ₹{formatINR(c.sellValueCr)} Cr
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-cyan-300">
                    ₹{formatINR(c.totalValueCr)} Cr
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Filter Bar & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
        <div className="flex flex-wrap items-center gap-2">
          {/* Deal Type Segment */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
            {[
              { id: 'ALL', label: 'All Deals' },
              { id: 'BUY', label: 'Buy Deals' },
              { id: 'SELL', label: 'Sell Deals' },
              { id: 'BLOCK', label: 'Block Deals' },
            ].map(type => (
              <button
                key={type.id}
                onClick={() => setDealTypeFilter(type.id as any)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  dealTypeFilter === type.id
                    ? 'bg-slate-800 text-cyan-300 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Min Size Filter */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
            {[
              { val: 0, label: 'All Sizes' },
              { val: 5, label: '> ₹5 Cr' },
              { val: 20, label: '> ₹20 Cr' },
              { val: 50, label: '> ₹50 Cr' },
            ].map(sz => (
              <button
                key={sz.val}
                onClick={() => setMinSizeCr(sz.val)}
                className={`px-2 py-1 rounded transition-colors ${
                  minSizeCr === sz.val
                    ? 'bg-slate-800 text-cyan-300 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sz.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search symbol or client..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>
      </div>

      {/* 4. Complete Bulk Deals Table */}
      <div className="overflow-x-auto max-h-[460px] overflow-y-auto rounded-xl border border-slate-800">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead className="bg-slate-950 sticky top-0 z-10 text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3 font-semibold">Date / Symbol</th>
              <th className="py-2.5 px-3 font-semibold">Security Name</th>
              <th className="py-2.5 px-3 font-semibold">Client / Fund Name</th>
              <th className="py-2.5 px-3 font-semibold text-center">Type</th>
              <th 
                onClick={() => handleSort('quantity')}
                className="py-2.5 px-3 font-semibold text-right cursor-pointer hover:text-slate-200"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Quantity</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th 
                onClick={() => handleSort('price')}
                className="py-2.5 px-3 font-semibold text-right cursor-pointer hover:text-slate-200"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Price (₹)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th 
                onClick={() => handleSort('valueInCrores')}
                className="py-2.5 px-3 font-semibold text-right cursor-pointer hover:text-slate-200"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Value (₹ Cr)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
            {filteredDeals.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500 font-mono text-xs">
                  No bulk deals found matching the current criteria.
                </td>
              </tr>
            ) : (
              filteredDeals.map((deal, idx) => {
                const isBuy = deal.dealType === 'BUY';
                const isStarred = watchlist.includes(deal.symbol);

                return (
                  <tr
                    key={`${deal.symbol}-${idx}`}
                    onClick={() => onSelectSymbol(deal.symbol)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 font-medium text-slate-100">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleWatchlist(deal.symbol);
                          }}
                          className="text-slate-500 hover:text-amber-400"
                        >
                          <Star className={`w-3.5 h-3.5 ${isStarred ? 'text-amber-400 fill-amber-400' : ''}`} />
                        </button>
                        <div>
                          <div className="font-bold flex items-center gap-1.5">
                            <span>{deal.symbol}</span>
                            {deal.isBlockDeal && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                                BLOCK
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500">{deal.date}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-slate-300 max-w-[170px] truncate" title={deal.securityName}>
                      {deal.securityName}
                    </td>

                    <td className="py-2.5 px-3 text-slate-200 max-w-[240px] truncate font-medium" title={deal.clientName}>
                      {deal.clientName}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                        isBuy 
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}>
                        {deal.dealType}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right text-slate-300">
                      {(deal.quantity / 100000).toFixed(2)} Lakhs
                      <div className="text-[10px] text-slate-500">
                        {deal.quantity.toLocaleString('en-IN')}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-right font-bold text-slate-100">
                      ₹{formatINR(deal.price)}
                    </td>

                    <td className="py-2.5 px-3 text-right font-bold">
                      <span className={isBuy ? 'text-emerald-400' : 'text-rose-400'}>
                        ₹{formatINR(deal.valueInCrores)} Cr
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onOpenDetails(deal.symbol, {
                          last: deal.price,
                          open: deal.price,
                          high: deal.price * 1.02,
                          low: deal.price * 0.98,
                          previousClose: deal.price,
                          symbol: deal.symbol,
                          clientName: deal.clientName,
                          quantityTraded: deal.quantity
                        }, 'stock')}
                        className="px-2 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
