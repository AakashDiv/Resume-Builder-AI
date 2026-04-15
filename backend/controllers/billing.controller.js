import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import {
  constructStripeEvent,
  createStripeCheckoutSession,
  handleStripeWebhookEvent
} from "../services/billing.service.js";

export const createCheckoutSession = asyncHandler(async (req, res) => {
  const result = await createStripeCheckoutSession({ userId: req.user._id.toString() });
  res.status(200).json(result);
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
