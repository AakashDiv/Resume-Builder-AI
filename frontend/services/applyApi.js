import api from "./apiClient.js";

export async function setAutoApplyEnabled(enabled) {
  const { data } = await api.post("/apply/enable", { enabled });
  return data;
}

export async function fetchQueueStatus() {
  const { data } = await api.get("/apply/queue-status");
  return data;
}

export async function manualApply(jobId) {
  const { data } = await api.post(`/apply/manual/${jobId}`);
  return data;
}
