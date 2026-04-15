import Stripe from "stripe";
import { env } from "./env.js";

const stripeClient = env.stripeSecretKey
  ? new Stripe(env.stripeSecretKey, {
      apiVersion: "2024-06-20"
    })
  : null;

export default stripeClient;
