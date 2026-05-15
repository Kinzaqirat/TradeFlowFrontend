import api from "./api";

export async function getStats(period: string = "all") {
  const res = await api.get("/dashboard/stats", { params: { period } });
  return res.data;
}
