/**
 * Run this once to seed all resume content into MongoDB:
 *   node backend/data/seedResumeContent.js
 */

import { createRequire } from "module";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env"), override: false });

const require = createRequire(import.meta.url);

const batch1 = require("./resumeContentDatabase.json");
const batch2 = require("./resumeContentDatabase_batch2.json");
const batch3 = require("./resumeContentDatabase_batch3.json");
const batch4 = require("./resumeContentDatabase_batch4.json");
const batch5 = require("./resumeContentDatabase_batch5.json");
const batch6 = require("./resumeContentDatabase_batch6.json");
const batch7 = require("./resumeContentDatabase_batch7.json");
const batch8 = require("./resumeContentDatabase_batch8.json");
const batch9 = require("./resumeContentDatabase_batch9.json");

// ── merge all batches into a single map keyed by role ──────────────────────
function buildRoleMap(batches) {
  const map = new Map();

  for (const batch of batches) {
    const sections = ["experience", "skills", "summaries", "achievements", "projects", "certifications"];

    for (const section of sections) {
      for (const entry of batch[section] || []) {
        if (!map.has(entry.role)) {
          map.set(entry.role, { role: entry.role, tags: entry.tags || [] });
        }
        const doc = map.get(entry.role);

        if (section === "experience")     doc.experience     = entry.phrases       || [];
        if (section === "skills")         doc.skills         = entry.skills        || [];
        if (section === "summaries")      doc.summaries      = entry.options       || [];
        if (section === "achievements")   doc.achievements   = entry.items         || [];
        if (section === "projects")       doc.projects       = entry.items         || [];
        if (section === "certifications") doc.certifications = entry.items         || [];
      }
    }
  }

  return Array.from(map.values());
}

async function seed() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error("❌  MONGO_URI not found in .env");
    process.exit(1);
  }

  console.log("🔗  Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("✅  Connected.");

  // import model AFTER mongoose connects
  const { default: ResumeContentLibrary } = await import("../models/ResumeContentLibrary.js");

  const roles = buildRoleMap([batch1, batch2, batch3, batch4, batch5, batch6, batch7, batch8, batch9]);
  console.log(`📦  Seeding ${roles.length} roles...`);

  let inserted = 0;
  let updated  = 0;

  for (const doc of roles) {
    const result = await ResumeContentLibrary.findOneAndUpdate(
      { role: doc.role },
      { $set: doc },
      { upsert: true, new: true }
    );
    if (result.createdAt?.getTime() === result.updatedAt?.getTime()) {
      inserted++;
    } else {
      updated++;
    }
    console.log(`  ✔  ${doc.role}`);
  }

  console.log(`\n🎉  Done — ${inserted} inserted, ${updated} updated.`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error("❌  Seed failed:", err.message);
  process.exit(1);
});
