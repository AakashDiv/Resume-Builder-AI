import adminApi from "./adminApiClient.js";

export async function adminAuthLogin(email, password) {
  const { data } = await adminApi.post("/admin-auth/login", { email, password });
  return data;
}

export async function adminAuthVerify() {
  const { data } = await adminApi.get("/admin-auth/verify");
  return data;
}

export async function fetchSuperAdminStats() {
  const { data } = await adminApi.get("/super-admin/stats");
  return data;
}

export async function fetchSuperAdminCategories() {
  const { data } = await adminApi.get("/super-admin/categories");
  return data;
}

export async function fetchSuperAdminMedia(params = {}) {
  const { data } = await adminApi.get("/super-admin/media", { params });
  return data;
}

export async function fetchSuperAdminBlogs(params = {}) {
  const { data } = await adminApi.get("/super-admin/blogs", { params });
  return data;
}

export async function fetchSuperAdminBlog(id) {
  const { data } = await adminApi.get(`/super-admin/blogs/${id}`);
  return data;
}

export async function createSuperAdminBlog(payload) {
  const { data } = await adminApi.post("/super-admin/blogs", toFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
}

export async function updateSuperAdminBlog(id, payload) {
  const { data } = await adminApi.patch(`/super-admin/blogs/${id}`, toFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
}

export async function deleteSuperAdminBlog(id) {
  const { data } = await adminApi.delete(`/super-admin/blogs/${id}`);
  return data;
}

export async function uploadSuperAdminContentImage(file, alt = "") {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("alt", alt);
  const { data } = await adminApi.post("/super-admin/blogs/content-image", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
}

function toFormData(payload) {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === "featuredImage") {
      if (value instanceof File) formData.append("featuredImage", value);
      return;
    }
    if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
      return;
    }
    formData.append(key, String(value));
  });
  return formData;
}
