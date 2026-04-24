import api from "./apiClient.js";

export async function fetchMatchedJobs() {
  const { data } = await api.get("/match/jobs");
  return data;
}

export async function runMatchCalculation() {
  const { data } = await api.post("/match/run");
  return data;
}

export async function fetchMatchedJob(jobId) {
  const { data } = await api.get(`/match/job/${jobId}`);
  return data;
}
