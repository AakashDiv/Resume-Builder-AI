import OpenAI from "openai";
import { env } from "../config/env.js";

const openaiClient = env.openAiApiKey
  ? new OpenAI({ apiKey: env.openAiApiKey })
  : null;

export default openaiClient;
