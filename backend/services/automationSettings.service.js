import AutomationSettings from "../models/AutomationSettings.js";
import { env } from "../config/env.js";

const GLOBAL_KEY = "global";

export async function getAutomationSettings() {
  const settings = await AutomationSettings.findOneAndUpdate(
    { key: GLOBAL_KEY },
    {
      $setOnInsert: {
        key: GLOBAL_KEY,
        schedulerEnabled: env.schedulerEnabled,
        autoWorkEnabled: env.schedulerEnabled
      }
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );

  return settings;
}

export async function isAutomaticWorkEnabled() {
  if (!env.schedulerEnabled) {
    return false;
  }

  const settings = await getAutomationSettings();
  return Boolean(settings.schedulerEnabled && settings.autoWorkEnabled);
}

export async function setAutomaticWorkEnabled(enabled, userId = null) {
  const settings = await AutomationSettings.findOneAndUpdate(
    { key: GLOBAL_KEY },
    {
      schedulerEnabled: Boolean(enabled),
      autoWorkEnabled: Boolean(enabled),
      updatedBy: userId
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );

  return settings;
}
