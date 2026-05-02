import mongoose from "mongoose";

const automationSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "global"
    },
    schedulerEnabled: {
      type: Boolean,
      default: true
    },
    autoWorkEnabled: {
      type: Boolean,
      default: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  {
    timestamps: true
  }
);

const AutomationSettings = mongoose.model("AutomationSettings", automationSettingsSchema);

export default AutomationSettings;
