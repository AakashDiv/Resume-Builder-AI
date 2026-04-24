import mongoose from "mongoose";

const extractedProfileSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
      default: ""
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ""
    },
    phone: {
      type: String,
      trim: true,
      default: ""
    },
    targetRole: {
      type: String,
      trim: true,
      default: ""
    },
    skills: {
      type: [String],
      default: []
    },
    experienceYears: {
      type: Number,
      default: 0
    },
    location: {
      type: String,
      trim: true,
      default: ""
    },
    preferredLocations: {
      type: [String],
      default: []
    },
    salaryMin: {
      type: Number,
      default: 0
    },
    salaryMax: {
      type: Number,
      default: 0
    },
    educationLevel: {
      type: String,
      trim: true,
      default: ""
    }
  },
  { _id: false }
);

const candidateProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },
    rawResumeText: {
      type: String,
      default: ""
    },
    resumeMarkdown: {
      type: String,
      default: ""
    },
    summary: {
      type: String,
      default: ""
    },
    embedding: {
      type: [Number],
      default: []
    },
    extractedProfile: {
      type: extractedProfileSchema,
      default: () => ({})
    },
    lastSource: {
      type: String,
      enum: ["manual", "upload", "builder", "generated", "improved"],
      default: "manual"
    }
  },
  {
    timestamps: true
  }
);

const CandidateProfile = mongoose.model("CandidateProfile", candidateProfileSchema);

export default CandidateProfile;
