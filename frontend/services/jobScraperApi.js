import api from "./apiClient.js";

export async function runScraper(payload) {
  const { data } = await api.post("/scraper/run", payload);
  return data;
}

export function getDownloadUrl(downloadPath) {
  if (!downloadPath) return "#";

  if (/^https?:\/\//i.test(downloadPath)) {
    return downloadPath;
  }

  const baseApiUrl = api.defaults.baseURL || "http://localhost:5000/api";
  const baseOrigin = baseApiUrl.replace(/\/api\/?$/, "");
  return `${baseOrigin}${downloadPath}`;
}

export function exportJobsAsCsv(jobs, fileName = "jobs_export.csv") {
  if (!Array.isArray(jobs) || !jobs.length) return;

  const columns = [
    ["Platform", "platform"],
    ["Job Title", "title"],
    ["Company", "company"],
    ["Location", "location"],
    ["Source", "source"],
    ["Date Posted", "posted_at"],
    ["View Job", "url"]
  ];

  const esc = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const header = columns.map(([label]) => esc(label)).join(",");
  const rows = jobs.map((job) => columns.map(([, key]) => esc(job[key])).join(","));

  const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function normalizeJobRow(row) {
  return {
    platform: row.platform || row.portal || "",
    title: row.title || row.job_title || "",
    company: row.company || row.company_name || "",
    location: row.location || row.job_location || "",
    source: row.source || row.source_keyword || row.portal || "",
    posted_at: row.posted_at || row.date_posted || "",
    url: row.url || row.job_url || ""
  };
}
