import api from "./apiClient.js";

export async function fetchBlogs(params = {}) {
  const { data } = await api.get("/blogs", { params });
  return data;
}

export async function searchBlogs(params = {}) {
  const { data } = await api.get("/blogs/search", { params });
  return data;
}

export async function fetchBlogBySlug(slug) {
  const { data } = await api.get(`/blogs/${slug}`);
  return data;
}

export async function fetchAdminBlogs(params = {}) {
  const { data } = await api.get("/blogs/admin", { params });
  return data;
}

export async function fetchAdminBlog(id) {
  const { data } = await api.get(`/blogs/admin/${id}`);
  return data;
}

export async function createAdminBlog(payload) {
  const { data } = await api.post("/blogs/admin", toFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
}

export async function updateAdminBlog(id, payload) {
  const { data } = await api.patch(`/blogs/admin/${id}`, toFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
}

export async function deleteAdminBlog(id) {
  const { data } = await api.delete(`/blogs/admin/${id}`);
  return data;
}

export async function uploadBlogContentImage(file, alt = "") {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("alt", alt);

  const { data } = await api.post("/blogs/admin/content-image", formData, {
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
    formData.append(key, value);
  });

  return formData;
}
