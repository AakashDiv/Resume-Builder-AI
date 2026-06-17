import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import {
  FaMagnifyingGlass,
  FaArrowRight,
  FaCircleCheck,
  FaClock,
  FaEye,
  FaBriefcase,
  FaUserTie,
  FaEnvelope,
  FaLinkedin,
  FaRegFileLines,
  FaRobot,
  FaComments,
  FaBrain,
  FaCode,
  FaStar,
  FaKey,
  FaGears,
  FaTriangleExclamation,
  FaChartLine,
  FaCheck,
  FaRocket,
  FaMicrophone,
  FaHandshake,
  FaFire,
  FaXmark,
  FaBookOpen,
} from "react-icons/fa6";
import Seo from "../components/Seo.jsx";
import { fetchBlogs } from "../services/blogApi.js";

const BLOG_DESCRIPTION =
  "Resume examples, ATS tips, job search advice, and career guides from NightHire.ai.";

const RESOURCE_CATEGORIES = [
  { label: "Resume Writing",     icon: FaRegFileLines,    count: "48 articles" },
  { label: "ATS Optimization",   icon: FaRobot,           count: "32 articles" },
  { label: "Interview Tips",     icon: FaMicrophone,      count: "41 articles" },
  { label: "Career Growth",      icon: FaChartLine,       count: "27 articles" },
  { label: "LinkedIn",           icon: FaLinkedin,        count: "18 articles" },
  { label: "Cover Letters",      icon: FaEnvelope,        count: "22 articles" },
  { label: "Job Search",         icon: FaMagnifyingGlass, count: "35 articles" },
  { label: "Salary Negotiation", icon: FaHandshake,       count: "15 articles" },
];

const ATS_GUIDES = [
  { icon: FaGears,               title: "How ATS Works",            desc: "Understand how applicant tracking systems filter resumes and rank candidates." },
  { icon: FaRegFileLines,        title: "ATS Resume Examples",      desc: "See real examples of ATS-optimized resumes that get past automated filters." },
  { icon: FaKey,                 title: "Keywords Guide",           desc: "Master keyword placement to beat ATS systems and land more interviews." },
  { icon: FaTriangleExclamation, title: "Resume Mistakes",          desc: "Avoid the 12 critical mistakes that get resumes auto-rejected by ATS." },
  { icon: FaChartLine,           title: "Resume Score Improvement", desc: "Step-by-step guide to improving your ATS compatibility score." },
];

const INTERVIEW_GUIDES = [
  { icon: FaComments, title: "Top Interview Questions", desc: "Prepare answers for the 50 most common interview questions." },
  { icon: FaBrain,    title: "Behavioral Questions",    desc: "Master behavioral interviews with proven response frameworks." },
  { icon: FaCode,     title: "Technical Interviews",    desc: "Ace technical rounds with our expert preparation strategies." },
  { icon: FaUserTie,  title: "HR Interviews",           desc: "Navigate HR screening calls and final-round interviews with confidence." },
  { icon: FaStar,     title: "STAR Method",             desc: "Use the STAR framework to structure compelling interview stories." },
];

export default function BlogListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState({ items: [], categories: [], page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState(searchParams.get("q") || "");

  const page = Number(searchParams.get("page") || 1);
  const category = searchParams.get("category") || "";
  const q = searchParams.get("q") || "";

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    fetchBlogs({ page, category, q })
      .then((result) => { if (active) setData(result); })
      .catch((err) => { if (active) setError(err?.response?.data?.message || "Unable to load blog posts."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page, category, q]);

  const featured = data.items?.[0] ?? null;
  const trending = featured ? (data.items?.slice(1, 7) ?? []) : [];
  const gridArticles = featured ? (data.items?.slice(7) ?? []) : [];

  const canonical = useMemo(() => `${window.location.origin}/blog`, []);

  function updateFilters(next) {
    const params = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    if (!("page" in next)) params.set("page", "1");
    setSearchParams(params);
  }

  function submitSearch(event) {
    event.preventDefault();
    updateFilters({ q: query.trim(), page: "1" });
  }

  function clearSearch() {
    setQuery("");
    updateFilters({ q: "", page: "1" });
  }

  return (
    <div className="nbh-page">
      <Seo
        title="Resume And Job Search Blog"
        description={BLOG_DESCRIPTION}
        canonical={canonical}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "NightHire.ai Blog",
          description: BLOG_DESCRIPTION,
          url: canonical,
        }}
      />

      {/* ── HERO ── */}
      <section className="nbh-hero">
        <div className="nbh-hero-bg">
          <div className="nbh-orb-blue" />
          <div className="nbh-orb-violet" />
          <div className="nbh-dot-grid" />
        </div>
        <div className="nbh-hero-inner">
          <motion.div
            className="nbh-eyebrow"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <FaBookOpen /> Career Resource Hub
          </motion.div>
          <motion.h1
            className="nbh-hero-h1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            Land More Interviews With{" "}
            <span className="nbh-gradient-text">Expert Strategies</span>
          </motion.h1>
          <motion.p
            className="nbh-hero-sub"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            ATS tips, resume guides, interview prep, and career growth resources
            trusted by 100,000+ job seekers.
          </motion.p>

          {/* Hero search bar */}
          <motion.form
            onSubmit={submitSearch}
            className="nbh-hero-search"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <label className="nbh-hero-search-field">
              <FaMagnifyingGlass className="nbh-search-icon" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search resume guides, ATS tips, interview questions…"
                aria-label="Search articles"
              />
              {query && (
                <button
                  type="button"
                  className="nbh-search-clear"
                  onClick={clearSearch}
                  aria-label="Clear search"
                >
                  <FaXmark />
                </button>
              )}
            </label>
            <button type="submit" className="nbh-search-submit">
              Search <FaArrowRight />
            </button>
          </motion.form>

          {/* Trust chips */}
          <motion.div
            className="nbh-trust-chips"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.32 }}
          >
            <span><FaCheck /> 500+ Articles</span>
            <span><FaCheck /> 100K+ Readers</span>
            <span><FaCheck /> ATS Optimized</span>
            <span><FaCheck /> Weekly Updated</span>
          </motion.div>
        </div>
      </section>

      {/* ── CATEGORY FILTER BAR ── */}
      <div className="nbf-bar">
        <div className="nbf-inner">
          <nav className="nbf-tabs" aria-label="Filter by category">
            {[{ label: "All", icon: FaBookOpen }, ...RESOURCE_CATEGORIES].map((cat) => {
              const isAll = cat.label === "All";
              const isActive = isAll ? !category : category === cat.label;
              return (
                <button
                  key={cat.label}
                  type="button"
                  className={`nbf-tab${isActive ? " is-active" : ""}`}
                  onClick={() =>
                    updateFilters({
                      category: isAll ? "" : (category === cat.label ? "" : cat.label),
                      page: "1",
                    })
                  }
                >
                  <cat.icon className="nbf-tab-icon" />
                  <span>{cat.label}</span>
                  {isActive && (
                    <motion.div
                      className="nbf-tab-indicator"
                      layoutId="nbf-active-indicator"
                      transition={{ type: "spring", stiffness: 340, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
          {!loading && (
            <span className="nbf-result-count">
              <strong>{data.total || data.items?.length || 0}</strong> articles
            </span>
          )}
        </div>
      </div>

      {/* ── STATE MESSAGES ── */}
      <div className="nbh-section-wrap">
        {loading && (
          <div className="nbh-state-msg nbh-state-loading">
            <div className="nbh-spinner" />
            Loading articles…
          </div>
        )}
        {error && (
          <div className="nbh-state-msg nbh-state-error">{error}</div>
        )}
        {!loading && !error && !data.items?.length && (
          <div className="nbh-state-msg nbh-state-empty">
            No articles found. Try a different search or category.
          </div>
        )}
      </div>

      {/* ── FEATURED ARTICLE ── */}
      {featured && (
        <section className="nbh-section-wrap nbh-featured-section">
          <div className="nbh-section-head">
            <span className="nbh-section-badge"><FaFire /> Featured Guide</span>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link to={`/blog/${featured.slug}`} className="nbh-featured-card">
              <div className="nbh-featured-img">
                {featured.featuredImage?.url ? (
                  <img
                    src={featured.featuredImage.url}
                    alt={featured.featuredImage.alt || featured.title}
                    loading="eager"
                  />
                ) : (
                  <div className="nbh-featured-img-placeholder" />
                )}
                <div className="nbh-featured-img-overlay" />
              </div>
              <div className="nbh-featured-body">
                {featured.category && (
                  <span className="nbh-featured-cat">{featured.category}</span>
                )}
                <h2>{featured.title}</h2>
                {featured.excerpt && <p className="nbh-featured-excerpt">{featured.excerpt}</p>}
                <div className="nbh-featured-meta-row">
                  <span><FaUserTie /> {featured.author?.name || "NightHire.ai Editorial"}</span>
                  {featured.publishedAt && (
                    <span>
                      {new Date(featured.publishedAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </span>
                  )}
                  <span><FaClock /> {featured.readingTime} min read</span>
                </div>
                <div className="nbh-featured-cta">
                  Read Guide <FaArrowRight />
                </div>
              </div>
            </Link>
          </motion.div>
        </section>
      )}

      {/* ── RESOURCE CATEGORIES ── */}
      <section className="nbh-section-wrap">
        <div className="nbh-section-head">
          <span className="nbh-section-badge"><FaBookOpen /> Browse by Topic</span>
          <h2>Explore All Resources</h2>
          <p>Find guides, tips, and strategies for every stage of your job search</p>
        </div>
        <div className="nbh-cat-grid">
          {RESOURCE_CATEGORIES.map((cat, i) => (
            <motion.button
              key={cat.label}
              type="button"
              className={`nbh-cat-card${category === cat.label ? " is-active" : ""}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}
              onClick={() =>
                updateFilters({ category: category === cat.label ? "" : cat.label, page: "1" })
              }
            >
              <span className="nbh-cat-icon"><cat.icon /></span>
              <span className="nbh-cat-label">{cat.label}</span>
              <span className="nbh-cat-count">{cat.count}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* ── TRENDING ARTICLES ── */}
      {trending.length > 0 && (
        <section className="nbh-section-wrap">
          <div className="nbh-section-head">
            <span className="nbh-section-badge"><FaFire /> Trending</span>
            <h2>Trending Articles</h2>
            <p>Most-read guides helping job seekers land interviews faster</p>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={`trending-${category}-${q}`} className="nbh-cards-grid">
              {trending.map((blog, i) => (
                <BlogCard key={blog._id} blog={blog} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        </section>
      )}

      {/* ── ATS GUIDES ── */}
      <section className="nbh-section-wrap nbh-guides-dark">
        <div className="nbh-guides-dark-bg">
          <div className="nbh-gd-orb-1" />
          <div className="nbh-gd-orb-2" />
        </div>
        <div className="nbh-section-head nbh-section-head-light">
          <span className="nbh-section-badge nbh-badge-light"><FaRobot /> Product Guides</span>
          <h2>ATS Resume Guides</h2>
          <p>Everything you need to create a resume that passes applicant tracking systems</p>
        </div>
        <div className="nbh-guide-grid">
          {ATS_GUIDES.map((g, i) => (
            <GuideCard key={g.title} {...g} index={i} />
          ))}
        </div>
        <div className="nbh-guides-cta">
          <Link to="/builder" className="nbh-btn-primary">
            Improve My Resume <FaArrowRight />
          </Link>
        </div>
      </section>

      {/* ── INTERVIEW GUIDES ── */}
      <section className="nbh-section-wrap">
        <div className="nbh-section-head">
          <span className="nbh-section-badge"><FaMicrophone /> Interview Prep</span>
          <h2>Interview Preparation</h2>
          <p>Master every type of interview with our expert-written preparation guides</p>
        </div>
        <div className="nbh-guide-grid">
          {INTERVIEW_GUIDES.map((g, i) => (
            <GuideCard key={g.title} {...g} index={i} />
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="nbh-section-wrap">
        <div className="nbh-cta-banner">
          <div className="nbh-cta-deco">
            <div className="nbh-cta-orb-1" />
            <div className="nbh-cta-orb-2" />
          </div>
          <div className="nbh-cta-body">
            <div className="nbh-cta-chips">
              <span><FaCheck /> ATS Badge</span>
              <span><FaRocket /> AI Suggestions</span>
              <span><FaRegFileLines /> PDF Export</span>
              <span><FaBriefcase /> Job Matching</span>
            </div>
            <h2>Ready To Build A Resume That Gets Interviews?</h2>
            <p>
              Join 100,000+ job seekers who use NightHire.ai to create ATS-optimized
              resumes that land interviews.
            </p>
            <div className="nbh-cta-actions">
              <Link to="/builder" className="nbh-cta-primary">Build Resume Free</Link>
              <Link to="/templates" className="nbh-cta-outline">Browse Templates</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── ALL ARTICLES ── */}
      {gridArticles.length > 0 && (
        <section className="nbh-section-wrap" id="career-articles">
          <div className="nbh-section-head">
            <span className="nbh-section-badge"><FaRegFileLines /> All Articles</span>
            <h2>All Career Resources</h2>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={`grid-${category}-${q}-${page}`} className="nbh-cards-grid nbh-cards-grid-main">
              {gridArticles.map((blog, i) => (
                <BlogCard key={blog._id} blog={blog} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>

          {data.pages > 1 && (
            <div className="nbh-pagination">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => updateFilters({ page: String(page - 1) })}
              >
                ← Previous
              </button>
              <span>Page {data.page} of {data.pages}</span>
              <button
                type="button"
                disabled={page >= data.pages}
                onClick={() => updateFilters({ page: String(page + 1) })}
              >
                Next →
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

/* ── Sub-components ── */

function BlogCard({ blog, index }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.42,
        delay: Math.min(index * 0.055, 0.38),
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={reduceMotion ? undefined : { y: -6, transition: { type: "spring", stiffness: 240, damping: 22 } }}
    >
      <Link to={`/blog/${blog.slug}`} className="nbh-blog-card">
        <div className="nbh-blog-card-img">
          {blog.featuredImage?.url ? (
            <img
              src={blog.featuredImage.url}
              alt={blog.featuredImage.alt || blog.title}
              loading="lazy"
            />
          ) : (
            <div className="nbh-blog-card-img-placeholder" />
          )}
        </div>
        <div className="nbh-blog-card-body">
          {blog.category && <span className="nbh-blog-cat">{blog.category}</span>}
          <h3>{blog.title}</h3>
          {blog.excerpt && <p>{blog.excerpt}</p>}
          <div className="nbh-blog-meta">
            <span><FaClock /> {blog.readingTime} min read</span>
            {blog.viewCount > 0 && <span><FaEye /> {blog.viewCount.toLocaleString()}</span>}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function GuideCard({ icon: Icon, title, desc, index }) {
  return (
    <motion.div
      className="nbh-guide-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.42, delay: Math.min(index * 0.06, 0.3), ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { type: "spring", stiffness: 280, damping: 20 } }}
    >
      <div className="nbh-guide-card-icon"><Icon /></div>
      <h3>{title}</h3>
      <p>{desc}</p>
      <span className="nbh-guide-card-link">Learn More <FaArrowRight /></span>
    </motion.div>
  );
}
