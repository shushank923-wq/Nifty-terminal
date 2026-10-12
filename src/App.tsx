/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MarketSummaryResponse, ChartData, NseIndex, StockVariation, ActiveSecurity } from './types/nse';
import { TerminalHeader } from './components/TerminalHeader';
import { TickerRibbon } from './components/TickerRibbon';
import { MarketMetricsHero } from './components/MarketMetricsHero';
import { InteractiveChart } from './components/InteractiveChart';
import { SectorHeatmap } from './components/SectorHeatmap';
import { MarketExplorer } from './components/MarketExplorer';
import { StockModal } from './components/StockModal';
import { soundManager } from './utils/sound';
import { RefreshCw, AlertCircle, ArrowUpRight } from 'lucide-react';

const REFRESH_INTERVAL_SECONDS = 120; // Exact 2-minute cycle demanded by user

export default function App() {
  const [summaryData, setSummaryData] = useState<MarketSummaryResponse['data'] | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('NIFTY 50');
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [chartTimeframe, setChartTimeframe] = useState<string>('1d');
  
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [chartLoading, setChartLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(REFRESH_INTERVAL_SECONDS);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('nse_sound_enabled') === 'true';
    } catch {
      return false;
    }
  });

  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nse_watchlist');
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['NIFTY 50', 'NIFTY BANK', 'RELIANCE', 'TCS', 'HDFCBANK', 'INFY'];
  });

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    symbol: string;
    data: any;
    type: 'index' | 'stock';
  }>({
    isOpen: false,
    symbol: '',
    data: null,
    type: 'index'
  });

  // Fetch summary data from NSE backend
  const fetchSummary = useCallback(async (isAuto = false) => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/nse/summary');
      const json: MarketSummaryResponse = await res.json();
      if (json && json.data) {
        setSummaryData(json.data);
        setLastUpdated(new Date());
        if (isAuto && soundEnabled) {
          soundManager.playRefreshChime();
        }
      }
    } catch (err) {
      console.error('Error fetching NSE summary:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [soundEnabled]);

  // Fetch chart data for currently selected symbol
  const fetchChart = useCallback(async (symbol: string, timeframe: string) => {
    setChartLoading(true);
    try {
      const interval = timeframe === '1d' ? '5m' : timeframe === '5d' ? '15m' : '1d';
      const res = await fetch(`/api/nse/chart?symbol=${encodeURIComponent(symbol)}&range=${timeframe}&interval=${interval}`);
      const json = await res.json();
      if (json && json.data) {
        setChartData(json.data);
      }
    } catch (err) {
      console.error(`Error fetching chart for ${symbol}:`, err);
    } finally {
      setChartLoading(false);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Load chart when selected symbol or timeframe changes
  useEffect(() => {
    if (selectedSymbol) {
      fetchChart(selectedSymbol, chartTimeframe);
    }
  }, [selectedSymbol, chartTimeframe, fetchChart]);

  // ALWAYS REFRESH EVERY 2 MINUTES: Master countdown ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Trigger the 2-minute refresh
          fetchSummary(true);
          if (selectedSymbol) {
            fetchChart(selectedSymbol, chartTimeframe);
          }
          return REFRESH_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [fetchSummary, fetchChart, selectedSymbol, chartTimeframe]);

  // Manual refresh handler
  const handleManualRefresh = () => {
    soundManager.playClick();
    setSecondsLeft(REFRESH_INTERVAL_SECONDS);
    fetchSummary(false);
    if (selectedSymbol) {
      fetchChart(selectedSymbol, chartTimeframe);
    }
  };

  const handleToggleSound = () => {
    setSoundEnabled(prev => {
      const next = !prev;
      try {
        localStorage.setItem('nse_sound_enabled', String(next));
      } catch {}
      if (next) soundManager.playRefreshChime();
      return next;
    });
  };

  const handleToggleWatchlist = (symbol: string) => {
    soundManager.playClick();
    setWatchlist(prev => {
      const updated = prev.includes(symbol)
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol];
      try {
        localStorage.setItem('nse_watchlist', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleSelectSymbol = (symbol: string) => {
    soundManager.playClick();
    setSelectedSymbol(symbol);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDetails = (symbol: string, data: any, type: 'index' | 'stock') => {
    setModalState({
      isOpen: true,
      symbol,
      data,
      type
    });
  };

  // Filtered indices/stocks for global search
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim() || !summaryData) return [];
    const q = searchQuery.toLowerCase();
    const matchedIndices = summaryData.indices.filter(i => i.index.toLowerCase().includes(q)).slice(0, 4);
    const matchedGainers = summaryData.gainers.filter(g => g.symbol.toLowerCase().includes(q)).slice(0, 3);
    const matchedActive = summaryData.activeValue.filter(a => a.symbol.toLowerCase().includes(q)).slice(0, 3);
    const matchedBulk = (summaryData.bulkDeals?.deals || [])
      .filter(b => b.symbol.toLowerCase().includes(q) || b.clientName.toLowerCase().includes(q))
      .slice(0, 3);

    return [
      ...matchedIndices.map(i => ({ symbol: i.index, type: 'index' as const, price: i.last, pct: i.percentChange })),
      ...matchedGainers.map(g => ({ symbol: g.symbol, type: 'stock' as const, price: g.ltp, pct: g.perChange })),
      ...matchedActive.map(a => ({ symbol: a.symbol, type: 'stock' as const, price: a.lastPrice, pct: a.pChange })),
      ...matchedBulk.map(b => ({ symbol: b.symbol, type: 'bulk deal' as const, price: b.price, pct: 0 }))
    ];
  }, [searchQuery, summaryData]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 1. Header Terminal Bar with 2-Minute Sync Gauge */}
      <TerminalHeader
        secondsLeft={secondsLeft}
        totalCycleSeconds={REFRESH_INTERVAL_SECONDS}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onManualRefresh={handleManualRefresh}
        marketStatus={summaryData?.status || null}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Global Search Dropdown Overlay if searching */}
      {searchQuery && searchResults.length > 0 && (
        <div className="max-w-md mx-auto w-full px-4 relative z-50">
          <div className="absolute top-1 left-4 right-4 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 font-mono text-xs">
            <span className="text-[10px] text-slate-500 px-2 py-1 block uppercase">Search Results</span>
            {searchResults.map((item, idx) => (
              <button
                key={`${item.symbol}-${idx}`}
                onClick={() => {
                  handleSelectSymbol(item.symbol);
                  setSearchQuery('');
                }}
                className="w-full text-left p-2 hover:bg-slate-800 rounded-lg flex items-center justify-between text-slate-200 hover:text-white"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold">{item.symbol}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase">
                    {item.type}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>₹{item.price}</span>
                  <span className={item.pct >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {item.pct >= 0 ? '+' : ''}{item.pct.toFixed(2)}%
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. Top Ticker Ribbon */}
      <TickerRibbon
        indices={summaryData?.indices || []}
        gainers={summaryData?.gainers || []}
        onSelectSymbol={handleSelectSymbol}
        selectedSymbol={selectedSymbol}
      />

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-4 py-4 w-full flex-1 flex flex-col gap-4">
        {/* 3. Market Pulse Hero Cards */}
        <MarketMetricsHero
          indices={summaryData?.indices || []}
          marketStatus={summaryData?.status || null}
          fiidii={summaryData?.fiidii || []}
          onSelectIndex={handleSelectSymbol}
          selectedIndex={selectedSymbol}
        />

        {/* 4. Chart Studio & Quick Switcher */}
        <div className="grid grid-cols-1 gap-4">
          <InteractiveChart
            data={chartData}
            symbol={selectedSymbol}
            loading={chartLoading}
            timeframe={chartTimeframe}
            onTimeframeChange={setChartTimeframe}
            onRefresh={() => fetchChart(selectedSymbol, chartTimeframe)}
          />
        </div>

        {/* 5. Sectoral Momentum Heatmap */}
        <SectorHeatmap
          indices={summaryData?.indices || []}
          onSelectIndex={handleSelectSymbol}
          selectedIndex={selectedSymbol}
        />

        {/* 6. Comprehensive Multi-Tab Market Explorer */}
        <MarketExplorer
          indices={summaryData?.indices || []}
          gainers={summaryData?.gainers || []}
          losers={summaryData?.losers || []}
          activeVolume={summaryData?.activeVolume || []}
          activeValue={summaryData?.activeValue || []}
          fiidii={summaryData?.fiidii || []}
          bulkDeals={summaryData?.bulkDeals}
          watchlist={watchlist}
          onToggleWatchlist={handleToggleWatchlist}
          onSelectSymbol={handleSelectSymbol}
          selectedSymbol={selectedSymbol}
          onOpenDetails={handleOpenDetails}
        />
      </main>

      {/* 7. Modal for Stock/Index Deep-Dive */}
      <StockModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        symbol={modalState.symbol}
        data={modalState.data}
        type={modalState.type}
        onSelectForChart={handleSelectSymbol}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-3 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>NSE India Real-Time Data Pipeline</span>
            <span>·</span>
            <span>Always refreshing every 2 minutes</span>
          </div>

          <div>
            <span>IST Timezone (UTC+05:30)</span>
            <span>·</span>
            <span className="text-slate-400">
              Last synced: {lastUpdated ? lastUpdated.toLocaleTimeString('en-IN') : 'Connecting...'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
