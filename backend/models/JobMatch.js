import mongoose from "mongoose";

const jobMatchSchema = new mongoose.Schema(
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
    embeddingScore: {
      type: Number,
      default: 0
    },
    skillScore: {
      type: Number,
      default: 0
    },
    matchedSkills: {
      type: [String],
      default: []
    },
    missingSkills: {
      type: [String],
      default: []
    },
    highlights: {
      type: [String],
      default: []
    },
    computedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

jobMatchSchema.index({ candidateId: 1, jobId: 1 }, { unique: true });

const JobMatch = mongoose.model("JobMatch", jobMatchSchema);

export default JobMatch;
