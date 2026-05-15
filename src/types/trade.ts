/** TypeScript type definitions for trade-related data. */

export type Direction = "LONG" | "SHORT";
export type TradeResult = "WIN" | "LOSS" | "BREAKEVEN";

export interface Trade {
  id: string;
  symbol: string;
  direction: Direction;
  entry_datetime: string;
  exit_datetime: string;
  entry_price: number;
  exit_price: number;
  quantity: number;
  fees: number;
  notes: string | null;
  tags: string[];
  pnl: number;
  pnl_percent: number;
  result: TradeResult;
  created_at: string;
  updated_at: string;
}

export interface TradeCreate {
  symbol: string;
  direction: Direction;
  entry_datetime: string;
  exit_datetime: string;
  entry_price: number;
  exit_price: number;
  quantity: number;
  fees?: number;
  notes?: string;
  tags?: string[];
}

export interface TradeListResponse {
  data: Trade[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface TradeFilters {
  symbol?: string;
  direction?: Direction | "";
  result?: TradeResult | "";
  date_from?: string;
  date_to?: string;
  page?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}
