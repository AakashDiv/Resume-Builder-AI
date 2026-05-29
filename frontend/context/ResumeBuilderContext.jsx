import { createContext, useContext, useEffect, useMemo, useState } from "react";

const DRAFT_KEY = "resume_builder_draft_v2";

const defaultState = {
  header: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    headline: "",
    photo: ""
  },
  experience: [
    {
      jobTitle: "",
      employer: "",
      city: "",
      country: "",
      startDate: "",
      endDate: "",
      currentlyWorking: false,
      bullets: ""
    }
  ],
  education: [
    {
      degree: "",
      institution: "",
      city: "",
      country: "",
      startDate: "",
      endDate: "",
      currentlyStudying: false,
      details: ""
    }
  ],
  skills: {
    primarySkills: ""
  },
  summary: {
    text: ""
  },
  additional: {
    linkedin: "",
    portfolio: "",
    certifications: "",
    sections: []
  }
};

const ResumeBuilderContext = createContext(null);

function normalizeDraft(draft) {
  const source = draft || {};
  return {
    ...defaultState,
    ...source,
    header: { ...defaultState.header, ...(source.header || {}) },
    skills: { ...defaultState.skills, ...(source.skills || {}) },
    summary: { ...defaultState.summary, ...(source.summary || {}) },
    additional: { ...defaultState.additional, ...(source.additional || {}) },
    experience: Array.isArray(source.experience) && source.experience.length ? source.experience : defaultState.experience,
    education: Array.isArray(source.education) && source.education.length ? source.education : defaultState.education
  };
}

export function ResumeBuilderProvider({ children }) {
  const [resumeData, setResumeData] = useState(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return defaultState;
      const parsed = JSON.parse(raw);
      return normalizeDraft(parsed);
    } catch (_error) {
      return defaultState;
    }
  });

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(resumeData));
  }, [resumeData]);

  const actions = useMemo(
    () => ({
      resetDraft() {
        setResumeData(defaultState);
      },
      loadDraft(nextDraft) {
        setResumeData(normalizeDraft(nextDraft));
      },
      updateHeader(field, value) {
        setResumeData((prev) => ({ ...prev, header: { ...prev.header, [field]: value } }));
      },
      updateSummary(value) {
        setResumeData((prev) => ({ ...prev, summary: { ...prev.summary, text: value } }));
      },
      updateSkills(value) {
        setResumeData((prev) => ({ ...prev, skills: { ...prev.skills, primarySkills: value } }));
      },
      updateAdditional(field, value) {
        setResumeData((prev) => ({ ...prev, additional: { ...prev.additional, [field]: value } }));
      },
      updateExperience(index, field, value) {
        setResumeData((prev) => {
          const next = [...prev.experience];
          next[index] = { ...next[index], [field]: value };
          return { ...prev, experience: next };
        });
      },
      addExperience() {
        setResumeData((prev) => ({
          ...prev,
          experience: [
            ...prev.experience,
            {
              jobTitle: "",
              employer: "",
              city: "",
              country: "",
              startDate: "",
              endDate: "",
              currentlyWorking: false,
              bullets: ""
            }
          ]
        }));
      },
      removeExperience(index) {
        setResumeData((prev) => {
          if (prev.experience.length <= 1) return prev;
          return {
            ...prev,
            experience: prev.experience.filter((_, i) => i !== index)
          };
        });
      },
      updateEducation(index, field, value) {
        setResumeData((prev) => {
          const next = [...prev.education];
          next[index] = { ...next[index], [field]: value };
          return { ...prev, education: next };
        });
      },
      addEducation() {
        setResumeData((prev) => ({
          ...prev,
          education: [
            ...prev.education,
            {
              degree: "",
              institution: "",
              city: "",
              country: "",
              startDate: "",
              endDate: "",
              currentlyStudying: false,
              details: ""
            }
          ]
        }));
      },
      removeEducation(index) {
        setResumeData((prev) => {
          if (prev.education.length <= 1) return prev;
          return {
            ...prev,
            education: prev.education.filter((_, i) => i !== index)
          };
        });
      }
    }),
    []
  );

  const value = useMemo(() => ({ resumeData, ...actions }), [resumeData, actions]);

  return <ResumeBuilderContext.Provider value={value}>{children}</ResumeBuilderContext.Provider>;
}

export function useResumeBuilder() {
  const context = useContext(ResumeBuilderContext);
  if (!context) {
    throw new Error("useResumeBuilder must be used within ResumeBuilderProvider");
  }
  return context;
}
