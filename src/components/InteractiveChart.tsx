import React, { useState, useMemo, useRef } from 'react';
import { Candle, ChartData } from '../types/nse';
import { calculateSMA, calculateEMA, calculateBollingerBands, calculateRSI, calculateMACD, formatINR } from '../utils/indicators';
import { BarChart3, TrendingUp, Activity, Layers, Eye, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';

interface InteractiveChartProps {
  data: ChartData | null;
  symbol: string;
  loading: boolean;
  timeframe: string;
  onTimeframeChange: (tf: string) => void;
  onRefresh: () => void;
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  data,
  symbol,
  loading,
  timeframe,
  onTimeframeChange,
  onRefresh,
}) => {
  const [chartType, setChartType] = useState<'candlestick' | 'area'>('candlestick');
  const [showSMA, setShowSMA] = useState(true);
  const [showEMA, setShowEMA] = useState(false);
  const [showBollinger, setShowBollinger] = useState(false);
  const [showVolume, setShowVolume] = useState(true);
  const [subIndicator, setSubIndicator] = useState<'none' | 'rsi' | 'macd'>('rsi');
  
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const candles = data?.candles || [];
  const meta = data?.meta;

  const closes = useMemo(() => candles.map(c => c.close), [candles]);
  const sma20 = useMemo(() => (showSMA ? calculateSMA(closes, 20) : []), [closes, showSMA]);
  const ema50 = useMemo(() => (showEMA ? calculateEMA(closes, 50) : []), [closes, showEMA]);
  const bollinger = useMemo(() => (showBollinger ? calculateBollingerBands(closes, 20, 2) : null), [closes, showBollinger]);
  const rsi = useMemo(() => (subIndicator === 'rsi' ? calculateRSI(closes, 14) : []), [closes, subIndicator]);
  const macd = useMemo(() => (subIndicator === 'macd' ? calculateMACD(closes) : null), [closes, subIndicator]);

  // Chart dimensions
  const width = 860;
  const height = subIndicator !== 'none' ? 440 : 360;
  const padding = { top: 24, right: 65, bottom: 28, left: 16 };
  
  const mainHeight = subIndicator !== 'none' ? 300 : 300;
  const subTop = 330;
  const subHeight = 85;

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = mainHeight - padding.top;

  // Price Extents
  const { minPrice, maxPrice, maxVolume } = useMemo(() => {
    if (candles.length === 0) return { minPrice: 0, maxPrice: 100, maxVolume: 1000 };
    let min = Infinity;
    let max = -Infinity;
    let maxVol = 0;

    candles.forEach((c, i) => {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
      if (c.volume > maxVol) maxVol = c.volume;

      if (showBollinger && bollinger) {
        if (bollinger.upper[i] !== null && bollinger.upper[i]! > max) max = bollinger.upper[i]!;
        if (bollinger.lower[i] !== null && bollinger.lower[i]! < min) min = bollinger.lower[i]!;
      }
    });

    const margin = (max - min) * 0.06 || 10;
    return {
      minPrice: Math.max(0, min - margin),
      maxPrice: max + margin,
      maxVolume: maxVol || 1,
    };
  }, [candles, showBollinger, bollinger]);

  // Coordinates
  const getX = (index: number) => {
    if (candles.length <= 1) return padding.left + innerWidth / 2;
    return padding.left + (index / (candles.length - 1)) * innerWidth;
  };

  const getY = (price: number) => {
    if (maxPrice === minPrice) return padding.top + innerHeight / 2;
    return padding.top + (1 - (price - minPrice) / (maxPrice - minPrice)) * innerHeight;
  };

  // Hover handling
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || candles.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const chartX = (mouseX / rect.width) * width;
    
    if (chartX < padding.left || chartX > width - padding.right) {
      setHoverIndex(null);
      return;
    }

    const ratio = (chartX - padding.left) / innerWidth;
    const index = Math.round(ratio * (candles.length - 1));
    setHoverIndex(Math.max(0, Math.min(candles.length - 1, index)));
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const activeCandle = hoverIndex !== null && candles[hoverIndex] ? candles[hoverIndex] : candles[candles.length - 1];
  const firstCandle = candles[0];
  const priceChange = activeCandle && firstCandle ? activeCandle.close - firstCandle.open : 0;
  const pctChange = activeCandle && firstCandle && firstCandle.open > 0 ? (priceChange / firstCandle.open) * 100 : 0;
  const isPositive = priceChange >= 0;

  // Grid lines
  const priceTicks = useMemo(() => {
    const ticks: number[] = [];
    const step = (maxPrice - minPrice) / 5;
    for (let i = 0; i <= 5; i++) {
      ticks.push(minPrice + i * step);
    }
    return ticks;
  }, [minPrice, maxPrice]);

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-4 flex flex-col gap-3 shadow-xl backdrop-blur-md">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-white font-mono">{symbol}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">NSE</span>
          </div>

          {activeCandle && (
            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-xl font-bold text-slate-100">
                ₹{formatINR(activeCandle.close)}
              </span>
              <span className={`text-xs font-semibold flex items-center gap-0.5 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{pctChange.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>

        {/* Chart Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframes */}
          <div className="flex items-center bg-slate-950/80 rounded-lg p-0.5 border border-slate-800 text-xs">
            {['1d', '5d', '1mo', '6mo', '1y'].map(tf => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  timeframe === tf
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Type Toggle */}
          <div className="flex items-center bg-slate-950/80 rounded-lg p-0.5 border border-slate-800 text-xs">
            <button
              onClick={() => setChartType('candlestick')}
              title="Candlestick Chart"
              className={`px-2 py-1 rounded-md transition-colors ${
                chartType === 'candlestick' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartType('area')}
              title="Area Line Chart"
              className={`px-2 py-1 rounded-md transition-colors ${
                chartType === 'area' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Indicator Toggles */}
          <div className="flex items-center gap-1 bg-slate-950/80 rounded-lg p-0.5 border border-slate-800 text-xs">
            <button
              onClick={() => setShowSMA(!showSMA)}
              className={`px-2 py-1 rounded font-mono text-[11px] transition-colors ${
                showSMA ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              SMA20
            </button>
            <button
              onClick={() => setShowEMA(!showEMA)}
              className={`px-2 py-1 rounded font-mono text-[11px] transition-colors ${
                showEMA ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              EMA50
            </button>
            <button
              onClick={() => setShowBollinger(!showBollinger)}
              className={`px-2 py-1 rounded font-mono text-[11px] transition-colors ${
                showBollinger ? 'bg-purple-500/20 text-purple-300 font-semibold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              BOLL
            </button>
            <button
              onClick={() => setSubIndicator(subIndicator === 'rsi' ? 'none' : 'rsi')}
              className={`px-2 py-1 rounded font-mono text-[11px] transition-colors ${
                subIndicator === 'rsi' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              RSI
            </button>
            <button
              onClick={() => setSubIndicator(subIndicator === 'macd' ? 'none' : 'macd')}
              className={`px-2 py-1 rounded font-mono text-[11px] transition-colors ${
                subIndicator === 'macd' ? 'bg-indigo-500/20 text-indigo-300 font-semibold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              MACD
            </button>
          </div>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            title="Refresh Chart"
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-950/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Crosshair Meta HUD */}
      {activeCandle && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-slate-400 bg-slate-950/50 px-2.5 py-1 rounded border border-slate-800/40">
          <div>
            <span className="text-slate-500">TIME: </span>
            <span className="text-slate-300">
              {new Date(activeCandle.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}
            </span>
          </div>
          <div>
            <span className="text-slate-500">O: </span>
            <span className="text-slate-200">{formatINR(activeCandle.open)}</span>
          </div>
          <div>
            <span className="text-slate-500">H: </span>
            <span className="text-emerald-400">{formatINR(activeCandle.high)}</span>
          </div>
          <div>
            <span className="text-slate-500">L: </span>
            <span className="text-rose-400">{formatINR(activeCandle.low)}</span>
          </div>
          <div>
            <span className="text-slate-500">C: </span>
            <span className={activeCandle.close >= activeCandle.open ? 'text-emerald-400' : 'text-rose-400'}>
              {formatINR(activeCandle.close)}
            </span>
          </div>
          <div>
            <span className="text-slate-500">VOL: </span>
            <span className="text-slate-200">{activeCandle.volume.toLocaleString('en-IN')}</span>
          </div>
        </div>
      )}

      {/* SVG Chart Canvas */}
      <div className="relative w-full overflow-hidden select-none">
        {loading && candles.length === 0 ? (
          <div className="h-[360px] flex flex-col items-center justify-center gap-2 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
            <span className="text-xs font-mono">Streaming real-time candles from NSE...</span>
          </div>
        ) : candles.length === 0 ? (
          <div className="h-[360px] flex items-center justify-center text-slate-500 text-xs font-mono">
            No chart data available for symbol
          </div>
        ) : (
          <svg
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="bollBand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.12" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines & Price Labels */}
            {priceTicks.map((price, i) => {
              const y = getY(price);
              return (
                <g key={i}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke="#1e293b"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={width - padding.right + 6}
                    y={y + 3}
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {price.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {/* Bollinger Bands Fill */}
            {showBollinger && bollinger && (
              <>
                <path
                  d={(() => {
                    const topPoints: string[] = [];
                    const btmPoints: string[] = [];
                    candles.forEach((_, idx) => {
                      if (bollinger.upper[idx] !== null && bollinger.lower[idx] !== null) {
                        const x = getX(idx);
                        topPoints.push(`${x},${getY(bollinger.upper[idx]!)}`);
                        btmPoints.unshift(`${x},${getY(bollinger.lower[idx]!)}`);
                      }
                    });
                    if (topPoints.length === 0) return '';
                    return `M ${topPoints.join(' L ')} L ${btmPoints.join(' L ')} Z`;
                  })()}
                  fill="url(#bollBand)"
                />
                {/* Upper line */}
                <path
                  d={candles.map((_, idx) => {
                    if (bollinger.upper[idx] === null) return '';
                    const prefix = idx === 0 || bollinger.upper[idx - 1] === null ? 'M' : 'L';
                    return `${prefix} ${getX(idx)} ${getY(bollinger.upper[idx]!)}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#c084fc"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                {/* Lower line */}
                <path
                  d={candles.map((_, idx) => {
                    if (bollinger.lower[idx] === null) return '';
                    const prefix = idx === 0 || bollinger.lower[idx - 1] === null ? 'M' : 'L';
                    return `${prefix} ${getX(idx)} ${getY(bollinger.lower[idx]!)}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#c084fc"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
              </>
            )}

            {/* Volume bars */}
            {showVolume && (
              <g opacity="0.45">
                {candles.map((c, idx) => {
                  const x = getX(idx);
                  const barW = Math.max(1, (innerWidth / candles.length) * 0.65);
                  const volHeight = (c.volume / maxVolume) * 60;
                  const volY = mainHeight - volHeight;
                  const isUp = c.close >= c.open;
                  return (
                    <rect
                      key={idx}
                      x={x - barW / 2}
                      y={volY}
                      width={barW}
                      height={volHeight}
                      fill={isUp ? '#10b981' : '#f43f5e'}
                    />
                  );
                })}
              </g>
            )}

            {/* Candlestick or Area rendering */}
            {chartType === 'area' ? (
              <>
                {/* Area Gradient */}
                <path
                  d={(() => {
                    const pts = candles.map((c, i) => `${getX(i)},${getY(c.close)}`);
                    const startX = getX(0);
                    const endX = getX(candles.length - 1);
                    return `M ${startX},${mainHeight} L ${pts.join(' L ')} L ${endX},${mainHeight} Z`;
                  })()}
                  fill="url(#areaGradient)"
                />
                {/* Main line */}
                <path
                  d={candles.map((c, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(c.close)}`).join(' ')}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2"
                />
              </>
            ) : (
              /* Candlesticks */
              candles.map((c, idx) => {
                const x = getX(idx);
                const openY = getY(c.open);
                const closeY = getY(c.close);
                const highY = getY(c.high);
                const lowY = getY(c.low);
                const isUp = c.close >= c.open;
                const candleColor = isUp ? '#10b981' : '#f43f5e';
                const candleW = Math.max(2, (innerWidth / candles.length) * 0.7);
                const topY = Math.min(openY, closeY);
                const bodyH = Math.max(1.5, Math.abs(closeY - openY));

                return (
                  <g key={idx}>
                    {/* Wick */}
                    <line
                      x1={x}
                      y1={highY}
                      x2={x}
                      y2={lowY}
                      stroke={candleColor}
                      strokeWidth="1.2"
                    />
                    {/* Body */}
                    <rect
                      x={x - candleW / 2}
                      y={topY}
                      width={candleW}
                      height={bodyH}
                      fill={candleColor}
                      rx="0.5"
                    />
                  </g>
                );
              })
            )}

            {/* SMA 20 line */}
            {showSMA && (
              <path
                d={candles.map((_, idx) => {
                  if (sma20[idx] === null) return '';
                  const prefix = idx === 0 || sma20[idx - 1] === null ? 'M' : 'L';
                  return `${prefix} ${getX(idx)} ${getY(sma20[idx]!)}`;
                }).join(' ')}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
              />
            )}

            {/* EMA 50 line */}
            {showEMA && (
              <path
                d={candles.map((_, idx) => {
                  if (ema50[idx] === null) return '';
                  const prefix = idx === 0 || ema50[idx - 1] === null ? 'M' : 'L';
                  return `${prefix} ${getX(idx)} ${getY(ema50[idx]!)}`;
                }).join(' ')}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="1.5"
              />
            )}

            {/* Current Price Highlight line on Right Axis */}
            {candles.length > 0 && (
              <g>
                <line
                  x1={padding.left}
                  y1={getY(candles[candles.length - 1].close)}
                  x2={width - padding.right}
                  y2={getY(candles[candles.length - 1].close)}
                  stroke="#06b6d4"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                  opacity="0.8"
                />
                <rect
                  x={width - padding.right + 2}
                  y={getY(candles[candles.length - 1].close) - 9}
                  width="58"
                  height="18"
                  fill="#06b6d4"
                  rx="3"
                />
                <text
                  x={width - padding.right + 6}
                  y={getY(candles[candles.length - 1].close) + 4}
                  fill="#020617"
                  fontSize="9.5"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {candles[candles.length - 1].close.toFixed(1)}
                </text>
              </g>
            )}

            {/* Sub Indicator Panel: RSI */}
            {subIndicator === 'rsi' && (
              <g transform={`translate(0, ${subTop})`}>
                <line x1={padding.left} y1="0" x2={width - padding.right} y2="0" stroke="#334155" strokeWidth="1" />
                {/* 70 overbought line */}
                <line x1={padding.left} y1={subHeight * 0.3} x2={width - padding.right} y2={subHeight * 0.3} stroke="#f43f5e" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
                {/* 30 oversold line */}
                <line x1={padding.left} y1={subHeight * 0.7} x2={width - padding.right} y2={subHeight * 0.7} stroke="#10b981" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
                
                <text x={padding.left + 4} y="12" fill="#94a3b8" fontSize="9" fontFamily="monospace">RSI (14)</text>
                <text x={width - padding.right + 4} y={subHeight * 0.3 + 3} fill="#f43f5e" fontSize="9" fontFamily="monospace">70</text>
                <text x={width - padding.right + 4} y={subHeight * 0.7 + 3} fill="#10b981" fontSize="9" fontFamily="monospace">30</text>

                {/* RSI curve */}
                <path
                  d={candles.map((_, idx) => {
                    const r = rsi[idx];
                    if (r === null) return '';
                    const x = getX(idx);
                    const y = subHeight * (1 - r / 100);
                    const prefix = idx === 0 || rsi[idx - 1] === null ? 'M' : 'L';
                    return `${prefix} ${x} ${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="1.5"
                />
              </g>
            )}

            {/* Sub Indicator Panel: MACD */}
            {subIndicator === 'macd' && macd && (
              <g transform={`translate(0, ${subTop})`}>
                <line x1={padding.left} y1="0" x2={width - padding.right} y2="0" stroke="#334155" strokeWidth="1" />
                <line x1={padding.left} y1={subHeight / 2} x2={width - padding.right} y2={subHeight / 2} stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
                <text x={padding.left + 4} y="12" fill="#94a3b8" fontSize="9" fontFamily="monospace">MACD (12, 26, 9)</text>

                {/* Histogram */}
                {candles.map((_, idx) => {
                  const h = macd.histogram[idx];
                  if (h === null) return null;
                  const x = getX(idx);
                  const barH = Math.min(35, Math.abs(h) * 2);
                  const barY = h >= 0 ? subHeight / 2 - barH : subHeight / 2;
                  return (
                    <rect
                      key={idx}
                      x={x - 1}
                      y={barY}
                      width="2"
                      height={barH}
                      fill={h >= 0 ? '#10b981' : '#f43f5e'}
                      opacity="0.8"
                    />
                  );
                })}
              </g>
            )}

            {/* Hover Crosshair */}
            {hoverIndex !== null && (
              <g>
                {/* Vertical line */}
                <line
                  x1={getX(hoverIndex)}
                  y1={padding.top}
                  x2={getX(hoverIndex)}
                  y2={height - padding.bottom}
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                {/* Horizontal line */}
                <line
                  x1={padding.left}
                  y1={getY(candles[hoverIndex].close)}
                  x2={width - padding.right}
                  y2={getY(candles[hoverIndex].close)}
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              </g>
            )}
          </svg>
        )}
      </div>

      {/* Time axis footer labels */}
      {candles.length > 0 && (
        <div className="flex justify-between px-3 text-[10px] font-mono text-slate-500 border-t border-slate-800/40 pt-1">
          <span>{new Date(candles[0].time).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          {candles[Math.floor(candles.length / 2)] && (
            <span>{new Date(candles[Math.floor(candles.length / 2)].time).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          )}
          <span>{new Date(candles[candles.length - 1].time).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      )}
    </div>
  );
};
