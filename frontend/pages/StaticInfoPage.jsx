import Seo from "../components/Seo.jsx";

const CONTENT = {
  privacy: {
    title: "Privacy Policy",
    description: "How NightHire.ai handles account, resume, job search, and billing data.",
    sections: [
      ["Information We Collect", "We collect account details, resume/profile content, job-search preferences, application activity, and technical usage data needed to provide the service."],
      ["How We Use Data", "We use data to run resume tools, job matching, billing, support, security, analytics, and product improvement."],
      ["Third Parties", "The product may use hosting, analytics, payment, AI, email, storage, and job-search providers to operate core features."],
      ["Your Choices", "You can update account information, control uploaded content, and contact us for deletion or data questions."]
    ]
  },
  terms: {
    title: "Terms Of Service",
    description: "Terms for using NightHire.ai resume builder, job search, AI tools, and subscriptions.",
    sections: [
      ["Use Of Service", "Use NightHire.ai lawfully and provide accurate information when creating resumes, profiles, or job applications."],
      ["AI And Career Guidance", "AI outputs are suggestions. Review all resumes, cover letters, and applications before use."],
      ["Subscriptions", "Paid features may require an active subscription. Pricing and plan access can change with notice."],
      ["Limitations", "We do not guarantee interviews, employment, application responses, or third-party platform availability."]
    ]
  },
  about: {
    title: "About NightHire.ai",
    description: "NightHire.ai helps job seekers build resumes, improve applications, search jobs, and apply smarter.",
    sections: [
      ["Our Mission", "NightHire.ai gives job seekers practical tools for resume building, ATS optimization, job matching, and application tracking."],
      ["What We Build", "The platform combines resume templates, AI writing support, job search workflows, and automation-ready application tracking."],
      ["Who It Helps", "Students, freshers, developers, analysts, career switchers, and working professionals can create cleaner, stronger applications."]
    ]
  },
  contact: {
    title: "Contact",
    description: "Contact NightHire.ai for product questions, support, partnerships, and content inquiries.",
    sections: [
      ["Support", "For account, billing, resume, or job-search support, contact the NightHire.ai team from your registered email."],
      ["Partnerships", "We are open to career content, hiring, education, and job-board partnerships."],
      ["Email", "Use your official support inbox or contact address here before launch."]
    ]
  },
  disclaimer: {
    title: "Disclaimer",
    description: "Important notes about NightHire.ai career content, AI suggestions, and job application tools.",
    sections: [
      ["Career Content", "Blog posts and AI suggestions are educational guidance, not legal, financial, immigration, or employment guarantees."],
      ["Job Platforms", "External job listings, application forms, and employer responses are controlled by third parties."],
      ["User Review", "Always review generated resumes, cover letters, and application details before submitting them."]
    ]
  }
};

export default function StaticInfoPage({ type }) {
  const page = CONTENT[type] || CONTENT.about;

  return (
    <main className="bg-[#f7f8f4] text-slate-950">
      <Seo title={page.title} description={page.description} canonical={`${window.location.origin}/${type === "privacy" ? "privacy-policy" : type}`} />
      <section className="mx-auto max-w-4xl px-5 py-16">
        <p className="text-xs font-black uppercase text-cyan-700">NightHire.ai</p>
        <h1 className="mt-3 text-4xl font-black md:text-6xl">{page.title}</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">{page.description}</p>
        <div className="mt-10 space-y-6">
          {page.sections.map(([heading, body]) => (
            <section key={heading} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black">{heading}</h2>
              <p className="mt-3 leading-7 text-slate-600">{body}</p>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
