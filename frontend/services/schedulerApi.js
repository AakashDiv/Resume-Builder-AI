import api from "./apiClient.js";

export async function fetchSchedulerStatus() {
  const { data } = await api.get("/scheduler/status");
  return data;
}

export async function enableScheduler() {
  const { data } = await api.post("/scheduler/enable");
  return data;
}

export async function disableScheduler() {
  const { data } = await api.post("/scheduler/disable");
  return data;
}
