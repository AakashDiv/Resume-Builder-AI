import stripeClient from "../config/stripe.js";
import { env } from "../config/env.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";

function assertStripeConfigured() {
  if (!stripeClient) {
    throw new ApiError(500, "Stripe is not configured. Set STRIPE_SECRET_KEY.");
  }
  if (!env.stripeProPriceId) {
    throw new ApiError(500, "Stripe Pro price is not configured. Set STRIPE_PRO_PRICE_ID.");
  }
}

async function resolveOrCreateCustomer(user) {
  if (user.stripeCustomerId) return user.stripeCustomerId;

  const customer = await stripeClient.customers.create({
    email: user.email,
    name: user.name,
    metadata: {
      userId: user._id.toString()
    }
  });

  user.stripeCustomerId = customer.id;
  await user.save();
  return customer.id;
}

export async function createStripeCheckoutSession({ userId }) {
  assertStripeConfigured();

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const customerId = await resolveOrCreateCustomer(user);

  const session = await stripeClient.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [
      {
        price: env.stripeProPriceId,
        quantity: 1
      }
    ],
    success_url: `${env.clientBaseUrl}/app/subscription?status=success`,
    cancel_url: `${env.clientBaseUrl}/app/subscription?status=cancelled`,
    client_reference_id: user._id.toString(),
    metadata: {
      userId: user._id.toString()
    }
  });

  return {
    url: session.url,
    sessionId: session.id
  };
}

async function setProByUserId(userId, sessionData = {}) {
  if (!userId) return;

  await User.findByIdAndUpdate(userId, {
    plan: "pro",
    stripeCustomerId: sessionData.customer || undefined,
    stripeSubscriptionId: sessionData.subscription || undefined,
    stripePriceId: env.stripeProPriceId || undefined
  });
}

async function setProByCustomerId(customerId, subscriptionId) {
  if (!customerId) return;

  await User.findOneAndUpdate(
    { stripeCustomerId: customerId },
    {
      plan: "pro",
      stripeSubscriptionId: subscriptionId || undefined,
      stripePriceId: env.stripeProPriceId || undefined
    }
  );
}

async function downgradeBySubscriptionId(subscriptionId) {
  if (!subscriptionId) return;

  await User.findOneAndUpdate(
    { stripeSubscriptionId: subscriptionId },
    {
      plan: "free",
      $unset: {
        stripeSubscriptionId: "",
        stripePriceId: ""
      }
    }
  );
}

export async function handleStripeWebhookEvent(event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session?.metadata?.userId || session?.client_reference_id;
      await setProByUserId(userId, {
        customer: session.customer,
        subscription: session.subscription
      });
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object;
      const activeStates = ["active", "trialing", "past_due"];
      if (activeStates.includes(subscription.status)) {
        await setProByCustomerId(subscription.customer, subscription.id);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      await downgradeBySubscriptionId(subscription.id);
      break;
    }

    default:
      break;
  }
}

export function constructStripeEvent(rawBody, signature) {
  if (!stripeClient) {
    throw new ApiError(500, "Stripe is not configured. Set STRIPE_SECRET_KEY.");
  }
  if (!env.stripeWebhookSecret) {
    throw new ApiError(500, "Stripe webhook secret is not configured. Set STRIPE_WEBHOOK_SECRET.");
  }

  return stripeClient.webhooks.constructEvent(rawBody, signature, env.stripeWebhookSecret);
}
