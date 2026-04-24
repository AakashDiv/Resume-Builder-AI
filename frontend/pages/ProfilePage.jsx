import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { extractProfile, fetchProfile, saveProfile } from "../services/profileApi.js";

function toForm(profile) {
  const extracted = profile?.extractedProfile || {};
  return {
    fullName: extracted.fullName || "",
    email: extracted.email || "",
    phone: extracted.phone || "",
    targetRole: extracted.targetRole || "",
    location: extracted.location || "",
    preferredLocations: (extracted.preferredLocations || []).join(", "),
    skills: (extracted.skills || []).join("\n"),
    experienceYears: extracted.experienceYears || 0,
    salaryMin: extracted.salaryMin || "",
    salaryMax: extracted.salaryMax || "",
    educationLevel: extracted.educationLevel || "",
    summary: profile?.summary || "",
    rawResumeText: profile?.rawResumeText || "",
    resumeMarkdown: profile?.resumeMarkdown || ""
  };
}

function toPayload(form) {
  const parseList = (value) =>
    String(value || "")
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);

  return {
    rawResumeText: form.rawResumeText,
    resumeMarkdown: form.resumeMarkdown,
    summary: form.summary,
    extractedProfile: {
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      targetRole: form.targetRole,
      location: form.location,
      preferredLocations: parseList(form.preferredLocations),
      skills: parseList(form.skills),
      experienceYears: Number(form.experienceYears || 0),
      salaryMin: Number(form.salaryMin || 0),
      salaryMax: Number(form.salaryMax || 0),
      educationLevel: form.educationLevel
    }
  };
}

function getCompletion(form) {
  const checks = [
    form.fullName,
    form.email,
    form.targetRole,
    form.location,
    form.skills,
    form.summary,
    form.rawResumeText || form.resumeMarkdown,
    form.educationLevel
  ];

  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState(() => toForm(null));

  async function loadProfile() {
    setLoading(true);
    try {
      const data = await fetchProfile();
      setForm(toForm(data.profile));
    } catch (err) {
      setToast({
        type: "error",
        message: err?.response?.data?.message || "Unable to load profile."
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  const completion = useMemo(() => getCompletion(form), [form]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setToast(null);

    try {
      const result = await saveProfile(toPayload(form));
      setForm(toForm(result.profile));
      setToast({
        type: "success",
        message: "Profile saved. Your dashboard can now use this data for matching."
      });
    } catch (err) {
      setToast({
        type: "error",
        message: err?.response?.data?.message || "Unable to save profile."
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleExtractFromText() {
    setExtracting(true);
    setToast(null);

    try {
      const result = await extractProfile({
        resumeText: form.rawResumeText,
        resumeMarkdown: form.resumeMarkdown
      });

      setForm((prev) => ({
        ...prev,
        ...toForm(result.profile),
        rawResumeText: result.resumeText || prev.rawResumeText
      }));
      setToast({
        type: "success",
        message: "Profile extracted from resume text."
      });
    } catch (err) {
      setToast({
        type: "error",
        message: err?.response?.data?.message || "Unable to extract profile from text."
      });
    } finally {
      setExtracting(false);
    }
  }

  async function handleExtractFromUpload() {
    if (!file) {
      setToast({
        type: "error",
        message: "Choose a PDF or DOCX resume file first."
      });
      return;
    }

    setUploading(true);
    setToast(null);

    try {
      const result = await extractProfile({ file });
      setForm((prev) => ({
        ...prev,
        ...toForm(result.profile),
        rawResumeText: result.resumeText || prev.rawResumeText
      }));
      setToast({
        type: "success",
        message: "Resume uploaded and profile extracted successfully."
      });
      setFile(null);
    } catch (err) {
      setToast({
        type: "error",
        message: err?.response?.data?.message || "Unable to extract profile from file."
      });
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        Loading profile...
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {toast ? (
        <div
          className={`rounded-2xl px-4 py-3 text-sm font-medium ${
            toast.type === "error" ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
          }`}
        >
          {toast.message}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.4fr,0.9fr]">
        <form onSubmit={handleSave} className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Candidate Profile</p>
                <h3 className="mt-2 text-2xl font-bold">Build the matching baseline</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  This profile powers match ranking, cover-letter drafting, and application tracking.
                </p>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} />
              <Field label="Email" name="email" value={form.email} onChange={handleChange} type="email" />
              <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} />
              <Field label="Target Role" name="targetRole" value={form.targetRole} onChange={handleChange} placeholder="e.g. Full Stack Developer" />
              <Field label="Current / Preferred Location" name="location" value={form.location} onChange={handleChange} placeholder="e.g. Bengaluru, India" />
              <Field label="Preferred Locations" name="preferredLocations" value={form.preferredLocations} onChange={handleChange} placeholder="Bengaluru, Remote, Hyderabad" />
              <Field label="Experience Years" name="experienceYears" value={form.experienceYears} onChange={handleChange} type="number" />
              <Field label="Education Level" name="educationLevel" value={form.educationLevel} onChange={handleChange} placeholder="Bachelor's" />
              <Field label="Salary Min" name="salaryMin" value={form.salaryMin} onChange={handleChange} type="number" />
              <Field label="Salary Max" name="salaryMax" value={form.salaryMax} onChange={handleChange} type="number" />
            </div>

            <div className="mt-4 grid gap-4">
              <TextArea
                label="Top Skills"
                name="skills"
                value={form.skills}
                onChange={handleChange}
                rows={6}
                helper="One skill per line or comma separated."
              />
              <TextArea
                label="Professional Summary"
                name="summary"
                value={form.summary}
                onChange={handleChange}
                rows={5}
              />
              <TextArea
                label="Raw Resume Text"
                name="rawResumeText"
                value={form.rawResumeText}
                onChange={handleChange}
                rows={12}
                helper="Paste extracted resume text here, or upload a file below to extract automatically."
              />
              <TextArea
                label="Resume Markdown"
                name="resumeMarkdown"
                value={form.resumeMarkdown}
                onChange={handleChange}
                rows={10}
                helper="Optional. Store your polished markdown resume for tailoring and applications."
              />
            </div>
          </section>
        </form>

        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-xl font-bold">Profile Health</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Better profile data creates stronger match scoring.
            </p>

            <div className="mt-5">
              <div className="flex items-center justify-between text-sm">
                <span>Completion</span>
                <span className="font-semibold">{completion}%</span>
              </div>
              <div className="mt-2 h-3 rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-3 rounded-full bg-brand-600"
                  style={{ width: `${Math.max(4, Math.min(100, completion))}%` }}
                />
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <QuickStat label="Skills saved" value={form.skills ? form.skills.split(/\r?\n|,/).filter(Boolean).length : 0} />
              <QuickStat label="Resume available" value={form.rawResumeText || form.resumeMarkdown ? "Yes" : "No"} />
              <QuickStat label="Target role" value={form.targetRole || "Missing"} />
            </div>

            <div className="mt-5">
              <Link to="/app/dashboard" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                Back to dashboard
              </Link>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-xl font-bold">Resume Extraction</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Use AI to convert resume text or an uploaded file into structured profile fields.
            </p>

            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={handleExtractFromText}
                disabled={extracting}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60 dark:bg-brand-600 dark:hover:bg-brand-700"
              >
                {extracting ? "Extracting..." : "Extract From Pasted Resume Text"}
              </button>

              <div className="rounded-2xl border border-dashed border-slate-300 p-4 dark:border-slate-700">
                <label className="block text-sm font-medium">Upload Resume File</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(event) => setFile(event.target.files?.[0] || null)}
                  className="mt-3 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                />
                <button
                  type="button"
                  onClick={handleExtractFromUpload}
                  disabled={uploading}
                  className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  {uploading ? "Uploading..." : "Upload And Extract"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

function Field({ label, helper, ...props }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-950"
      />
      {helper ? <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{helper}</span> : null}
    </label>
  );
}

function TextArea({ label, helper, ...props }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
      <textarea
        {...props}
        className="w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-950"
      />
      {helper ? <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{helper}</span> : null}
    </label>
  );
}

function QuickStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-bold">{value}</p>
    </div>
  );
}
