import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    },
    plan: {
      type: String,
      enum: ["free", "pro"],
      default: "free"
    },
    stripeCustomerId: {
      type: String,
      default: null
    },
    stripeSubscriptionId: {
      type: String,
      default: null
    },
    stripePriceId: {
      type: String,
      default: null
    },
    autoApplyEnabled: {
      type: Boolean,
      default: false
    },
    autoApplyLimit: {
      type: Number,
      default: 10,
      min: 1,
      max: 100
    },
    notifyEmail: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: true }
  }
);

const User = mongoose.model("User", userSchema);

export default User;
