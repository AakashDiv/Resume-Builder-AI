import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    sourceKey: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    externalId: {
      type: String,
      default: ""
    },
    platform: {
      type: String,
      trim: true,
      default: ""
    },
    title: {
      type: String,
      trim: true,
      required: true
    },
    company: {
      type: String,
      trim: true,
      default: ""
    },
    location: {
      type: String,
      trim: true,
      default: ""
    },
    description: {
      type: String,
      default: ""
    },
    embedding: {
      type: [Number],
      default: []
    },
    salary: {
      type: String,
      default: ""
    },
    applyUrl: {
      type: String,
      default: ""
    },
    source: {
      type: String,
      default: ""
    },
    keywords: {
      type: [String],
      default: []
    },
    datePosted: {
      type: Date,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    },
    scrapedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const Job = mongoose.model("Job", jobSchema);

export default Job;
