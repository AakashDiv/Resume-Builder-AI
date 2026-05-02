import connectDB from "../config/db.js";
import AutomationSettings from "../models/AutomationSettings.js";
import { getAutomationSettings, isAutomaticWorkEnabled, setAutomaticWorkEnabled } from "../services/automationSettings.service.js";
import { getSchedulerRuntimeStatus, runDailyDigest, runDailyJobMatcher } from "../scheduler/jobMatcher.js";

async function main() {
  await connectDB();

  const initial = await getAutomationSettings();
  await setAutomaticWorkEnabled(false);
  const disabled = await isAutomaticWorkEnabled();
  const skippedMatcher = await runDailyJobMatcher();
  const forcedDigest = await runDailyDigest({ force: true });
  await setAutomaticWorkEnabled(initial.autoWorkEnabled && initial.schedulerEnabled);

  console.log("Initial automatic work:", Boolean(initial.autoWorkEnabled && initial.schedulerEnabled));
  console.log("Disabled automatic work:", disabled);
  console.log("Matcher skipped:", skippedMatcher);
  console.log("Digest result:", forcedDigest);
  console.log("Runtime:", getSchedulerRuntimeStatus());

  if (disabled !== false || !skippedMatcher.skipped) {
    throw new Error("Scheduler disable flow failed");
  }

  await AutomationSettings.db.close();
}

main().catch(async (error) => {
  console.error(error);
  await AutomationSettings.db.close().catch(() => {});
  process.exit(1);
});
