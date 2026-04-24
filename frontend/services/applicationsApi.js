import api from "./apiClient.js";

export async function fetchApplications() {
  const { data } = await api.get("/applications");
  return data;
}

export async function updateApplicationStatus(applicationId, payload) {
  const { data } = await api.patch(`/applications/${applicationId}/status`, payload);
  return data;
}
