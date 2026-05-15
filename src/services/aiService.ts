import api from "./api";

export async function sendMessage(message: string) {
  const res = await api.post("/ai/chat", { message });
  return res.data;
}
