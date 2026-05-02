import puppeteer from "puppeteer";
import Application from "../models/Application.js";
import CandidateProfile from "../models/CandidateProfile.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import { env } from "../config/env.js";
import { sendApplyConfirmation } from "./emailService.js";

const DEFAULT_TIMEOUT_MS = 20000;

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function normalize(value) {
  return String(value || "").trim();
}

function lower(value) {
  return normalize(value).toLowerCase();
}

function getProfileValue(profile, user, key) {
  const extracted = profile?.extractedProfile || {};
  if (key === "name") return extracted.fullName || user?.name || "";
  if (key === "email") return extracted.email || user?.email || "";
  if (key === "phone") return extracted.phone || "";
  if (key === "location") return extracted.location || "";
  if (key === "summary") return profile?.summary || profile?.rawResumeText || "";
  if (key === "skills") return Array.isArray(extracted.skills) ? extracted.skills.join(", ") : "";
  if (key === "experience") return extracted.experienceYears ? String(extracted.experienceYears) : "";
  return "";
}

function buildCandidateContext({ user, profile }) {
  return {
    name: getProfileValue(profile, user, "name"),
    email: getProfileValue(profile, user, "email"),
    phone: getProfileValue(profile, user, "phone"),
    location: getProfileValue(profile, user, "location"),
    summary: getProfileValue(profile, user, "summary"),
    skills: getProfileValue(profile, user, "skills"),
    experienceYears: getProfileValue(profile, user, "experience")
  };
}

function inferPlatform(job = {}) {
  const source = lower(`${job.platform} ${job.source} ${job.applyUrl}`);
  if (source.includes("linkedin")) return "linkedin";
  if (source.includes("naukri")) return "naukri";
  return "unsupported";
}

async function createBrowser() {
  return puppeteer.launch({
    headless: env.autoApplyHeadless,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage"
    ]
  });
}

async function safeClick(page, selectors = []) {
  for (const selector of selectors) {
    const element = await page.$(selector);
    if (element) {
      await element.click();
      return true;
    }
  }

  return false;
}

async function fillFirstAvailable(page, selectors = [], value = "") {
  const cleanValue = normalize(value);
  if (!cleanValue) {
    return false;
  }

  for (const selector of selectors) {
    const element = await page.$(selector);
    if (!element) {
      continue;
    }

    await element.click({ clickCount: 3 }).catch(() => {});
    await element.type(cleanValue, { delay: 15 });
    return true;
  }

  return false;
}

async function fillInputsByLabels(page, candidate) {
  return page.evaluate((values) => {
    const normalizeText = (value) => String(value || "").toLowerCase();
    const textFor = (element) => {
      const id = element.getAttribute("id");
      const aria = element.getAttribute("aria-label");
      const placeholder = element.getAttribute("placeholder");
      const name = element.getAttribute("name");
      const label = id ? document.querySelector(`label[for="${CSS.escape(id)}"]`)?.textContent : "";
      const wrapper = element.closest("label, div, section, fieldset")?.textContent || "";
      return normalizeText([aria, placeholder, name, label, wrapper].filter(Boolean).join(" "));
    };
    const pickValue = (text) => {
      if (text.includes("email")) return values.email;
      if (text.includes("phone") || text.includes("mobile")) return values.phone;
      if (text.includes("name")) return values.name;
      if (text.includes("location") || text.includes("city")) return values.location;
      if (text.includes("experience") || text.includes("years")) return values.experienceYears;
      if (text.includes("skill")) return values.skills;
      if (text.includes("summary") || text.includes("cover") || text.includes("about")) return values.summary;
      return "";
    };

    let filled = 0;
    const fields = Array.from(document.querySelectorAll("input:not([type='hidden']):not([type='file']), textarea"));
    for (const field of fields) {
      const value = pickValue(textFor(field));
      if (!value || field.value) continue;
      field.focus();
      field.value = value;
      field.dispatchEvent(new Event("input", { bubbles: true }));
      field.dispatchEvent(new Event("change", { bubbles: true }));
      filled += 1;
    }
    return filled;
  }, candidate);
}

async function detectCaptcha(page) {
  const text = await page.evaluate(() => document.body?.innerText || "").catch(() => "");
  const source = lower(text);
  if (source.includes("captcha") || source.includes("recaptcha") || source.includes("verify you are human")) {
    return true;
  }

  return Boolean(await page.$("iframe[src*='captcha'], iframe[src*='recaptcha'], .g-recaptcha, [data-sitekey]"));
}

async function hasText(page, pattern) {
  const text = await page.evaluate(() => document.body?.innerText || "").catch(() => "");
  return pattern.test(text);
}

async function clickButtonByText(page, patterns = []) {
  const clicked = await page.evaluate((sources) => {
    const regexes = sources.map((source) => new RegExp(source, "i"));
    const buttons = Array.from(document.querySelectorAll("button, a, input[type='button'], input[type='submit']"));
    const target = buttons.find((element) => {
      const label = element.innerText || element.value || element.getAttribute("aria-label") || "";
      return regexes.some((regex) => regex.test(label));
    });
    if (!target) return false;
    target.click();
    return true;
  }, patterns.map((pattern) => pattern.source));

  if (clicked) {
    await delay(1000);
  }

  return clicked;
}

async function pageLooksLikeLinkedInLogin(page) {
  return Boolean(await page.$("input#username, input[name='session_key'], input[name='session_password']"));
}

async function pageLooksLikeNaukriLogin(page) {
  return Boolean(await page.$("input[type='email'], input[name='email'], input[placeholder*='email' i], input[placeholder*='username' i]"));
}

async function ensureLinkedInSession(page) {
  if (!(await pageLooksLikeLinkedInLogin(page))) {
    return {
      ok: true
    };
  }

  if (!env.linkedInEmail || !env.linkedInPassword) {
    return {
      ok: false,
      reason: "LinkedIn login required but LINKEDIN_EMAIL/LINKEDIN_PASSWORD are not configured"
    };
  }

  await fillFirstAvailable(page, ["input#username", "input[name='session_key']"], env.linkedInEmail);
  await fillFirstAvailable(page, ["input#password", "input[name='session_password']"], env.linkedInPassword);
  await safeClick(page, ["button[type='submit']"]);
  await delay(2500);

  if (await detectCaptcha(page)) {
    return {
      ok: false,
      captcha: true,
      reason: "CAPTCHA detected during LinkedIn login"
    };
  }

  return {
    ok: !(await pageLooksLikeLinkedInLogin(page)),
    reason: "LinkedIn login did not complete"
  };
}

async function ensureNaukriSession(page) {
  const hasPassword = Boolean(await page.$("input[type='password']"));
  const loginTextVisible = await hasText(page, /login|sign in/i);
  if (!hasPassword || !loginTextVisible) {
    return {
      ok: true
    };
  }

  if (!env.naukriEmail || !env.naukriPassword) {
    return {
      ok: false,
      reason: "Naukri login required but NAUKRI_EMAIL/NAUKRI_PASSWORD are not configured"
    };
  }

  await fillFirstAvailable(page, [
    "input[type='email']",
    "input[name='email']",
    "input[placeholder*='email' i]",
    "input[placeholder*='username' i]"
  ], env.naukriEmail);
  await fillFirstAvailable(page, ["input[type='password']"], env.naukriPassword);
  await clickButtonByText(page, [/login/, /sign in/, /submit/]);
  await delay(2500);

  if (await detectCaptcha(page)) {
    return {
      ok: false,
      captcha: true,
      reason: "CAPTCHA detected during Naukri login"
    };
  }

  return {
    ok: !(await pageLooksLikeNaukriLogin(page) && Boolean(await page.$("input[type='password']"))),
    reason: "Naukri login did not complete"
  };
}

export async function fillLinkedInEasyApply(page, candidate, options = {}) {
  const hasEasyApply = await clickButtonByText(page, [/easy apply/, /^apply$/]);
  if (!hasEasyApply && !(await hasText(page, /easy apply/i))) {
    return {
      success: false,
      reason: "LinkedIn Easy Apply button was not found"
    };
  }

  await fillFirstAvailable(page, [
    "input[name='phoneNumber']",
    "input[id*='phone']",
    "input[aria-label*='phone' i]"
  ], candidate.phone);

  await fillInputsByLabels(page, candidate);

  for (let step = 0; step < 8; step += 1) {
    if (await detectCaptcha(page)) {
      return {
        success: false,
        captcha: true,
        reason: "CAPTCHA detected during LinkedIn Easy Apply"
      };
    }

    const submittedTextVisible = await hasText(page, /application submitted|your application was sent|applied/i);
    if (submittedTextVisible) {
      return {
        success: true,
        submitted: true,
        reason: "LinkedIn application submitted"
      };
    }

    await fillInputsByLabels(page, candidate);

    const reviewClicked = await clickButtonByText(page, [/next/, /review/, /continue/]);
    if (reviewClicked) {
      continue;
    }

    const submitAvailable = await hasText(page, /submit application|submit|send application/i);
    if (submitAvailable) {
      if (options.dryRun) {
        return {
          success: true,
          submitted: false,
          dryRun: true,
          reason: "LinkedIn Easy Apply form reached final submit in dry-run mode"
        };
      }

      const submitted = await clickButtonByText(page, [/submit application/, /^submit$/, /send application/]);
      return {
        success: submitted,
        submitted,
        reason: submitted ? "LinkedIn application submitted" : "LinkedIn submit button was not clickable"
      };
    }

    break;
  }

  return {
    success: options.dryRun,
    submitted: false,
    dryRun: options.dryRun,
    reason: options.dryRun
      ? "LinkedIn Easy Apply dry-run completed without final submit"
      : "LinkedIn Easy Apply flow could not be completed"
  };
}

export async function fillNaukriForm(page, candidate, options = {}) {
  await fillFirstAvailable(page, [
    "input[name='name']",
    "input[id*='name']",
    "input[placeholder*='name' i]"
  ], candidate.name);
  await fillFirstAvailable(page, [
    "input[type='email']",
    "input[name='email']",
    "input[placeholder*='email' i]"
  ], candidate.email);
  await fillFirstAvailable(page, [
    "input[name*='mobile' i]",
    "input[name*='phone' i]",
    "input[placeholder*='mobile' i]",
    "input[placeholder*='phone' i]"
  ], candidate.phone);
  await fillInputsByLabels(page, candidate);

  if (await detectCaptcha(page)) {
    return {
      success: false,
      captcha: true,
      reason: "CAPTCHA detected during Naukri apply"
    };
  }

  const applyVisible = await hasText(page, /apply|submit|send/i);
  if (!applyVisible) {
    return {
      success: false,
      reason: "Naukri apply form was not found"
    };
  }

  if (options.dryRun) {
    return {
      success: true,
      submitted: false,
      dryRun: true,
      reason: "Naukri form reached submit stage in dry-run mode"
    };
  }

  const submitted = await clickButtonByText(page, [/apply/, /submit/, /send/]);
  return {
    success: submitted,
    submitted,
    reason: submitted ? "Naukri application submitted" : "Naukri submit button was not clickable"
  };
}

export async function autoApplyToJob({ applicationId, dryRun = env.autoApplyDryRun } = {}) {
  const application = await Application.findById(applicationId);
  if (!application) {
    return {
      success: false,
      status: "failed",
      reason: "Application not found"
    };
  }

  const [user, profile, job] = await Promise.all([
    User.findById(application.candidateId).select("_id name email"),
    CandidateProfile.findOne({ userId: application.candidateId }),
    Job.findById(application.jobId)
  ]);

  if (!user || !profile || !job) {
    const reason = "Missing user, profile, or job for auto-apply";
    await Application.updateOne({ _id: application._id }, { status: "failed", failReason: reason });
    return {
      success: false,
      status: "failed",
      reason
    };
  }

  if (!job.applyUrl) {
    const reason = "Job has no apply URL";
    await Application.updateOne({ _id: application._id }, { status: "failed", failReason: reason });
    return {
      success: false,
      status: "failed",
      reason
    };
  }

  const platform = inferPlatform(job);
  if (platform === "unsupported") {
    const reason = `Unsupported auto-apply platform: ${job.platform || job.source || "unknown"}`;
    await Application.updateOne({ _id: application._id }, { status: "failed", failReason: reason });
    return {
      success: false,
      status: "failed",
      reason
    };
  }

  const candidate = buildCandidateContext({ user, profile });
  let browser;

  try {
    browser = await createBrowser();
    const page = await browser.newPage();
    page.setDefaultTimeout(DEFAULT_TIMEOUT_MS);
    await page.setViewport({ width: 1366, height: 900 });
    await page.goto(job.applyUrl, { waitUntil: "domcontentloaded", timeout: DEFAULT_TIMEOUT_MS });
    await delay(1500);

    if (await detectCaptcha(page)) {
      const reason = "CAPTCHA detected before form fill";
      await Application.updateOne({ _id: application._id }, { status: "failed", failReason: reason });
      return {
        success: false,
        status: "failed",
        captcha: true,
        reason
      };
    }

    const sessionResult = platform === "linkedin"
      ? await ensureLinkedInSession(page)
      : await ensureNaukriSession(page);

    if (!sessionResult.ok) {
      await Application.updateOne({ _id: application._id }, { status: "failed", failReason: sessionResult.reason });
      return {
        success: false,
        status: "failed",
        captcha: Boolean(sessionResult.captcha),
        reason: sessionResult.reason
      };
    }

    const result = platform === "linkedin"
      ? await fillLinkedInEasyApply(page, candidate, { dryRun })
      : await fillNaukriForm(page, candidate, { dryRun });

    if (result.captcha) {
      await Application.updateOne({ _id: application._id }, { status: "failed", failReason: result.reason });
      return {
        ...result,
        status: "failed"
      };
    }

    if (!result.success) {
      await Application.updateOne({ _id: application._id }, { status: "failed", failReason: result.reason });
      return {
        ...result,
        status: "failed"
      };
    }

    const nextStatus = dryRun || !result.submitted ? "viewed" : "applied";
    await Application.updateOne(
      { _id: application._id },
      {
        status: nextStatus,
        appliedAt: nextStatus === "applied" ? new Date() : null,
        failReason: dryRun ? result.reason : ""
      }
    );

    if (nextStatus === "applied") {
      await sendApplyConfirmation({
        user,
        job,
        application: {
          ...application.toObject(),
          status: nextStatus,
          appliedAt: new Date()
        }
      }).catch((error) => {
        console.warn("[email] Apply confirmation failed:", error.message || error);
      });
    }

    return {
      ...result,
      status: nextStatus,
      platform
    };
  } catch (error) {
    const reason = error.message || "Auto-apply failed";
    await Application.updateOne({ _id: application._id }, { status: "failed", failReason: reason });
    return {
      success: false,
      status: "failed",
      reason
    };
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}
