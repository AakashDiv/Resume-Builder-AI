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

async function setTestPlan(req, res, plan) {
  if (!env.allowTestProUpgrade || env.nodeEnv === "production") {
    throw new ApiError(403, "Test plan switching is only available in local development");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      plan
    },
    {
      new: true
    }
  ).select("_id name email plan autoApplyEnabled autoApplyLimit");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json({
    message: `Test ${plan} plan activated for local testing`,
    user
  });
}

export const activateTestProPlan = asyncHandler(async (req, res) => {
  await setTestPlan(req, res, "pro");
});

export const activateTestFreePlan = asyncHandler(async (req, res) => {
  await setTestPlan(req, res, "free");
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
