import React from 'react';
import { formatINR, formatCrores } from '../utils/indicators';
import { X, TrendingUp, TrendingDown, Layers, BarChart2, DollarSign, Activity } from 'lucide-react';

interface StockModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  data: any;
  type: 'index' | 'stock';
  onSelectForChart: (symbol: string) => void;
}

export const StockModal: React.FC<StockModalProps> = ({
  isOpen,
  onClose,
  symbol,
  data,
  type,
  onSelectForChart,
}) => {
  if (!isOpen || !data) return null;

  const isIndex = type === 'index';
  const price = data.last || data.lastPrice || data.ltp || 0;
  const pct = data.percentChange || data.pChange || data.perChange || 0;
  const change = data.variation || data.change || (data.ltp ? data.ltp - data.prev_price : 0);
  const isUp = pct >= 0;

  const dayLow = data.low || data.dayLow || data.low_price || price * 0.99;
  const dayHigh = data.high || data.dayHigh || data.high_price || price * 1.01;
  const yearLow = data.yearLow || data.year_low || dayLow * 0.85;
  const yearHigh = data.yearHigh || data.year_high || dayHigh * 1.25;

  // Day range percentage
  const dayRangePct = dayHigh > dayLow ? Math.min(100, Math.max(0, ((price - dayLow) / (dayHigh - dayLow)) * 100)) : 50;
  // Year range percentage
  const yearRangePct = yearHigh > yearLow ? Math.min(100, Math.max(0, ((price - yearLow) / (yearHigh - yearLow)) * 100)) : 50;

  // Simulated Order Book Depth for Equities
  const bids = [
    { price: price - 0.15, qty: 15400 },
    { price: price - 0.35, qty: 32000 },
    { price: price - 0.70, qty: 45000 },
    { price: price - 1.10, qty: 89000 },
    { price: price - 1.50, qty: 120000 },
  ];
  const asks = [
    { price: price + 0.15, qty: 14200 },
    { price: price + 0.40, qty: 28500 },
    { price: price + 0.80, qty: 51200 },
    { price: price + 1.20, qty: 74000 },
    { price: price + 1.65, qty: 110000 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl font-mono text-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-cyan-400">
              {isIndex ? 'IDX' : 'EQ'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">{symbol}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {isIndex ? 'NSE INDEX' : 'NSE CASH'}
                </span>
              </div>
              <p className="text-xs text-slate-400">National Stock Exchange</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onSelectForChart(symbol);
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold cursor-pointer transition-colors"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Load in Chart</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5">
          {/* Price Overview Hero */}
          <div className="flex flex-wrap items-baseline justify-between p-4 bg-slate-950/80 rounded-xl border border-slate-800/80">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">LAST TRADED PRICE</span>
              <div className="text-3xl font-extrabold text-white mt-0.5">
                ₹{formatINR(price)}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">DAY'S VARIATION</span>
              <div className={`text-base font-bold flex items-center justify-end gap-1 mt-0.5 ${
                isUp ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{isUp ? '+' : ''}{change.toFixed(2)} ({isUp ? '+' : ''}{pct.toFixed(2)}%)</span>
              </div>
            </div>
          </div>

          {/* Range Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Day Range */}
            <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Today's Range
              </span>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">L: ₹{formatINR(dayLow)}</span>
                <span className="text-cyan-400 font-bold">₹{formatINR(price)}</span>
                <span className="text-slate-400">H: ₹{formatINR(dayHigh)}</span>
              </div>
              <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-500 rounded-full" 
                  style={{ width: `${dayRangePct}%` }}
                />
              </div>
            </div>

            {/* 52-Week Range */}
            <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                52-Week Range
              </span>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">52W L: ₹{formatINR(yearLow)}</span>
                <span className="text-purple-400 font-bold">₹{formatINR(price)}</span>
                <span className="text-slate-400">52W H: ₹{formatINR(yearHigh)}</span>
              </div>
              <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 rounded-full" 
                  style={{ width: `${yearRangePct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Key Statistics Grid */}
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Key Metrics & Fundamentals
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Previous Close</span>
                <span className="font-bold text-slate-200">₹{formatINR(data.previousClose || data.prev_price || price)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Open Price</span>
                <span className="font-bold text-slate-200">₹{formatINR(data.open || data.open_price || price)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">P/E Ratio</span>
                <span className="font-bold text-slate-200">{data.pe || '—'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">P/B Ratio</span>
                <span className="font-bold text-slate-200">{data.pb || '—'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Div Yield</span>
                <span className="font-bold text-slate-200">{data.dy ? `${data.dy}%` : '—'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Volume</span>
                <span className="font-bold text-slate-200">
                  {data.quantityTraded ? (data.quantityTraded / 100000).toFixed(2) + ' Lakhs' : data.trade_quantity ? (data.trade_quantity / 100000).toFixed(2) + ' Lakhs' : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Simulated Order Book Depth */}
          {!isIndex && (
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5">
                Market Depth (5 Best Bids & Asks)
              </h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                {/* Bids */}
                <div>
                  <div className="flex justify-between text-[11px] text-emerald-400 font-semibold mb-1 border-b border-slate-800 pb-1">
                    <span>BID QTY</span>
                    <span>BID PRICE</span>
                  </div>
                  <div className="space-y-1">
                    {bids.map((b, i) => (
                      <div key={i} className="flex justify-between text-slate-300">
                        <span>{b.qty.toLocaleString('en-IN')}</span>
                        <span className="text-emerald-400 font-bold">₹{formatINR(b.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Asks */}
                <div>
                  <div className="flex justify-between text-[11px] text-rose-400 font-semibold mb-1 border-b border-slate-800 pb-1">
                    <span>ASK PRICE</span>
                    <span>ASK QTY</span>
                  </div>
                  <div className="space-y-1">
                    {asks.map((a, i) => (
                      <div key={i} className="flex justify-between text-slate-300">
                        <span className="text-rose-400 font-bold">₹{formatINR(a.price)}</span>
                        <span>{a.qty.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
