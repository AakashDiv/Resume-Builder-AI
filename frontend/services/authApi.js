import api from "./apiClient.js";

export async function register(payload) {
  const { data } = await api.post("/auth/register", payload);
  return data;
}

export async function login(payload) {
  const { data } = await api.post("/auth/login", payload);
  return data;
}

export async function fetchCurrentUser() {
  const { data } = await api.get("/protected/me");
  return data;
}
