export interface NseIndex {
  index: string;
  indexSymbol?: string;
  key?: string;
  last: number;
  variation: number;
  percentChange: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  yearHigh: number;
  yearLow: number;
  pe: string | number;
  pb: string | number;
  dy: string | number;
  advances: string | number;
  declines: string | number;
  unchanged?: string | number;
  perChange30d?: number;
  perChange365d?: number;
  date30dAgo?: string;
  date365dAgo?: string;
  chartTodayPath?: string;
  chart30dPath?: string;
  chart365dPath?: string;
}

export interface MarketStateItem {
  market: string;
  marketStatus: string;
  tradeDate: string;
  index: string;
  last: string | number;
  variation: string | number;
  percentChange: string | number;
  marketStatusMessage: string;
  expiryDate?: string;
  underlying?: string;
}

export interface MarketStatusData {
  marketState: MarketStateItem[];
  marketcap?: {
    timeStamp: string;
    marketCapinTRDollars: number;
    marketCapinLACCRRupees: number;
    marketCapinCRRupeesFormatted?: string;
    marketCapinLACCRRupeesFormatted?: string;
  };
  giftnifty?: {
    LASTPRICE: number;
    DAYCHANGE: number;
    PERCHANGE: number;
    EXPIRYDATE: string;
    CONTRACTSTRADED: number;
    SYMBOL?: string;
  };
  niftyusd?: {
    index: string;
    last: number;
    change: number;
    percentChange: number;
    timestamp?: string;
  };
}

export interface StockVariation {
  symbol: string;
  series?: string;
  open_price: number;
  high_price: number;
  low_price: number;
  ltp: number;
  prev_price: number;
  perChange: number;
  trade_quantity: number;
  turnover: number;
}

export interface ActiveSecurity {
  symbol: string;
  identifier?: string;
  lastPrice: number;
  pChange: number;
  change: number;
  quantityTraded: number;
  totalTradedValue: number;
  totalTradedVolume?: number;
  previousClose: number;
  open: number;
  dayHigh: number;
  dayLow: number;
  yearHigh: number;
  yearLow: number;
}

export interface FiiDiiItem {
  category: string;
  date: string;
  buyValue: string | number;
  sellValue: string | number;
  netValue: string | number;
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartData {
  meta?: {
    symbol: string;
    regularMarketPrice?: number;
    previousClose?: number;
    currency?: string;
  };
  candles: Candle[];
}

export interface BulkDealItem {
  date: string;
  symbol: string;
  securityName: string;
  clientName: string;
  dealType: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  value: number;
  valueInCrores: number;
  remarks?: string;
  isBlockDeal?: boolean;
}

export interface BulkDealsSummary {
  totalDeals: number;
  totalTurnoverCr: number;
  buyDealsCount: number;
  buyValueCr: number;
  sellDealsCount: number;
  sellValueCr: number;
  netFlowCr: number;
  topAccumulated: { symbol: string; securityName: string; netBuyCr: number; buyValueCr: number }[];
  topDistributed: { symbol: string; securityName: string; netSellCr: number; sellValueCr: number }[];
  topClients: { clientName: string; totalValueCr: number; buyValueCr: number; sellValueCr: number }[];
  deals: BulkDealItem[];
  blockDealsCount?: number;
  blockDealsValueCr?: number;
}

export interface MarketSummaryResponse {
  success: boolean;
  lastUpdated: string;
  source?: string;
  data: {
    indices: NseIndex[];
    status: MarketStatusData;
    gainers: StockVariation[];
    losers: StockVariation[];
    activeVolume: ActiveSecurity[];
    activeValue: ActiveSecurity[];
    fiidii: FiiDiiItem[];
    bulkDeals: BulkDealsSummary;
  };
}
