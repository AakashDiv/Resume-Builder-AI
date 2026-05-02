import nodemailer from "nodemailer";
import Application from "../models/Application.js";
import JobMatch from "../models/JobMatch.js";
import User from "../models/User.js";
import { env } from "../config/env.js";

let transporter = null;

function getTransporter() {
  if (!env.emailEnabled) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure,
      auth: env.smtpUser || env.smtpPass
        ? {
            user: env.smtpUser,
            pass: env.smtpPass
          }
        : undefined
    });
  }

  return transporter;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendEmail({ to, subject, text, html }) {
  if (!to) {
    return {
      sent: false,
      reason: "Missing recipient"
    };
  }

  const payload = {
    from: env.emailFrom,
    to,
    subject,
    text,
    html
  };

  const mailer = getTransporter();
  if (!mailer) {
    console.log("[email] EMAIL_ENABLED=false, email skipped:", {
      to,
      subject
    });
    return {
      sent: false,
      skipped: true,
      payload
    };
  }

  const info = await mailer.sendMail(payload);
  return {
    sent: true,
    messageId: info.messageId
  };
}

export async function sendApplyConfirmation({ user, job, application }) {
  const subject = `Application ${application.status}: ${job.title} at ${job.company || "company"}`;
  const dashboardUrl = `${env.clientBaseUrl}/app/applications`;
  const text = [
    `Hi ${user.name},`,
    "",
    `Your application for ${job.title} at ${job.company || "the company"} is now marked ${application.status}.`,
    `Match score: ${application.matchScore || 0}%`,
    job.applyUrl ? `Job link: ${job.applyUrl}` : "",
    `Application tracker: ${dashboardUrl}`
  ].filter(Boolean).join("\n");

  const html = `
    <p>Hi ${escapeHtml(user.name)},</p>
    <p>Your application for <strong>${escapeHtml(job.title)}</strong> at <strong>${escapeHtml(job.company || "the company")}</strong> is now marked <strong>${escapeHtml(application.status)}</strong>.</p>
    <p>Match score: <strong>${Number(application.matchScore || 0)}%</strong></p>
    ${job.applyUrl ? `<p><a href="${escapeHtml(job.applyUrl)}">Open job</a></p>` : ""}
    <p><a href="${escapeHtml(dashboardUrl)}">Open application tracker</a></p>
  `;

  return sendEmail({
    to: user.email,
    subject,
    text,
    html
  });
}

export async function sendDailyDigestToAllPremiumUsers() {
  const users = await User.find({
    plan: "pro",
    notifyEmail: true
  }).select("_id name email");

  let sentCount = 0;
  let skippedCount = 0;

  for (const user of users) {
    const [matches, applications] = await Promise.all([
      JobMatch.find({ candidateId: user._id })
        .sort({ matchScore: -1, computedAt: -1 })
        .limit(5)
        .populate("jobId"),
      Application.find({ candidateId: user._id })
        .sort({ updatedAt: -1 })
        .limit(10)
        .populate("jobId")
    ]);

    const topMatches = matches
      .map((match, index) => {
        const job = match.jobId || {};
        return `${index + 1}. ${job.title || "Job"} at ${job.company || "Company"} - ${match.matchScore}%`;
      })
      .join("\n");

    const queuedCount = applications.filter((item) => item.status === "queued").length;
    const appliedCount = applications.filter((item) => item.status === "applied").length;
    const failedCount = applications.filter((item) => item.status === "failed").length;
    const dashboardUrl = `${env.clientBaseUrl}/app/dashboard`;

    const result = await sendEmail({
      to: user.email,
      subject: "Your daily job match digest",
      text: [
        `Hi ${user.name},`,
        "",
        "Top matches:",
        topMatches || "No matches yet.",
        "",
        `Queued: ${queuedCount}`,
        `Applied: ${appliedCount}`,
        `Failed: ${failedCount}`,
        "",
        `Dashboard: ${dashboardUrl}`
      ].join("\n"),
      html: `
        <p>Hi ${escapeHtml(user.name)},</p>
        <h3>Top matches</h3>
        ${
          matches.length
            ? `<ol>${matches.map((match) => {
                const job = match.jobId || {};
                return `<li>${escapeHtml(job.title || "Job")} at ${escapeHtml(job.company || "Company")} - ${Number(match.matchScore || 0)}%</li>`;
              }).join("")}</ol>`
            : "<p>No matches yet.</p>"
        }
        <p>Queued: <strong>${queuedCount}</strong><br/>Applied: <strong>${appliedCount}</strong><br/>Failed: <strong>${failedCount}</strong></p>
        <p><a href="${escapeHtml(dashboardUrl)}">Open dashboard</a></p>
      `
    });

    if (result.sent) sentCount += 1;
    else skippedCount += 1;
  }

  return {
    usersProcessed: users.length,
    sentCount,
    skippedCount
  };
}
