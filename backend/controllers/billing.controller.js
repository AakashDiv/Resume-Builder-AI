import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/User.js";
import { env } from "../config/env.js";
import {
  constructStripeEvent,
  createStripeCheckoutSession,
  handleStripeWebhookEvent
} from "../services/billing.service.js";

export const createCheckoutSession = asyncHandler(async (req, res) => {
  const result = await createStripeCheckoutSession({ userId: req.user._id.toString() });
  res.status(200).json(result);
});

export const activateTestProPlan = asyncHandler(async (req, res) => {
  if (!env.allowTestProUpgrade || env.nodeEnv === "production") {
    throw new ApiError(403, "Test Pro upgrade is only available in local development");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      plan: "pro"
    },
    {
      new: true
    }
  ).select("_id name email plan autoApplyEnabled autoApplyLimit");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json({
    message: "Test Pro plan activated for local testing",
    user
  });
});

export const stripeWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["stripe-signature"];
  if (!signature) {
    throw new ApiError(400, "Missing Stripe signature");
  }

  let event;
  try {
    event = constructStripeEvent(req.body, signature);
  } catch (_error) {
    throw new ApiError(400, "Invalid Stripe webhook signature");
  }

  await handleStripeWebhookEvent(event);
  res.status(200).json({ received: true });
});
