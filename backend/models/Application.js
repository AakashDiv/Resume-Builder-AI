import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true
    },
    matchScore: {
      type: Number,
      default: 0
    },
    resumeVersion: {
      type: String,
      default: ""
    },
    coverLetter: {
      type: String,
      default: ""
    },
    source: {
      type: String,
      enum: ["manual", "auto"],
      default: "manual"
    },
    status: {
      type: String,
      enum: ["queued", "applied", "viewed", "responded", "rejected", "failed"],
      default: "queued"
    },
    appliedAt: {
      type: Date,
      default: null
    },
    failReason: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

applicationSchema.index({ candidateId: 1, jobId: 1 }, { unique: true });

const Application = mongoose.model("Application", applicationSchema);

export default Application;
