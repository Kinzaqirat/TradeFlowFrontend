import api from "./api";
import { Trade, TradeCreate, TradeFilters, TradeListResponse } from "@/types/trade";

export async function createTrade(data: TradeCreate): Promise<Trade> {
  const res = await api.post("/trades/", data);
  return res.data;
}

export async function getTrades(filters: TradeFilters = {}): Promise<TradeListResponse> {
  const res = await api.get("/trades/", { params: filters });
  return res.data;
}

export async function getTrade(id: string): Promise<Trade> {
  const res = await api.get(`/trades/${id}`);
  return res.data;
}

export async function updateTrade(id: string, data: any): Promise<Trade> {
  const res = await api.put(`/trades/${id}`, data);
  return res.data;
}

export async function deleteTrade(id: string): Promise<void> {
  await api.delete(`/trades/${id}`);
}

export async function exportCSV(): Promise<void> {
  const res = await api.get("/trades/export/csv", { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `trades_export_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}
