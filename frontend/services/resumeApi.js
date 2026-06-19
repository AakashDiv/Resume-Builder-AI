import api from "./apiClient.js";

export async function generateResume(payload) {
  const { data } = await api.post("/resume/generate", payload);
  return data;
}

export async function improveResume(file) {
  const formData = new FormData();
  formData.append("resumeFile", file);

  const { data } = await api.post("/resume/improve", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

  return data;
}

export async function scoreResume(payload) {
  const { data } = await api.post("/resume/score", payload);
  return data;
}

export async function tailorResume(payload) {
  const { data } = await api.post("/resume/tailor", payload);
  return data;
}

export async function generateCoverLetter(payload) {
  const { data } = await api.post("/resume/cover-letter", payload);
  return data;
}

export async function fetchResumeSuggestions(params = {}) {
  const { data } = await api.get("/resume/suggestions", { params });
  return data;
}

export async function parseResumeUpload(file) {
  const formData = new FormData();
  formData.append("resumeFile", file);

  const { data } = await api.post("/resume/parse", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

  return data;
}
