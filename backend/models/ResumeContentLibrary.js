import mongoose from "mongoose";

const resumeContentLibrarySchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    tags: {
      type: [String],
      default: []
    },
    experience: {
      type: [String],
      default: []
    },
    skills: {
      type: [String],
      default: []
    },
    summaries: {
      type: [{ title: String, text: String }],
      default: []
    },
    achievements: {
      type: [String],
      default: []
    },
    projects: {
      type: [String],
      default: []
    },
    certifications: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

resumeContentLibrarySchema.index({ tags: 1 });

export default mongoose.model("ResumeContentLibrary", resumeContentLibrarySchema);
