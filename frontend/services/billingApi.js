import api from "./apiClient.js";

export async function createCheckoutSession() {
  const { data } = await api.post("/billing/create-checkout-session");
  return data;
}

export async function activateTestProPlan() {
  const { data } = await api.post("/billing/test-pro");
  return data;
}
