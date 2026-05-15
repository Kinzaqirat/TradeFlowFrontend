import api from "./api";

export async function getChartData(tradeId: string) {
  const res = await api.get(`/trades/${tradeId}/chart-data`);
  return res.data;
}

export async function getSymbolChartData(symbol: string) {
  const res = await api.get(`/trades/price-data/${symbol}`);
  return res.data;
}
