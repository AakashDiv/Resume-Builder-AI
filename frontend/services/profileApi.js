import api from "./apiClient.js";

export async function fetchProfile() {
  const { data } = await api.get("/profile");
  return data;
}

export async function saveProfile(payload) {
  const { data } = await api.put("/profile", payload);
  return data;
}

export async function extractProfile({ resumeText, resumeMarkdown, file }) {
  if (file) {
    const formData = new FormData();
    formData.append("resumeFile", file);
    if (resumeMarkdown) {
      formData.append("resumeMarkdown", resumeMarkdown);
    }

    const { data } = await api.post("/profile/extract", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    return data;
  }

  const { data } = await api.post("/profile/extract", {
    resumeText,
    resumeMarkdown
  });
  return data;
}
