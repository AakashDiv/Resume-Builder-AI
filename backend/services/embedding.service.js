import OpenAI from "openai";
import openaiClient from "./openai.service.js";
import { env } from "../config/env.js";

const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = Number(process.env.OPENAI_EMBEDDING_DIMENSIONS || 0);
const EMBEDDING_MAX_CHARS = Math.max(200, Number(process.env.OPENAI_EMBEDDING_MAX_CHARS || 6000));
const FORCE_FALLBACK = process.env.OPENAI_EMBEDDING_PROVIDER === "fallback" || process.env.OPENAI_EMBEDDING_DISABLED === "true";
const FALLBACK_DIMENSIONS = 128;

function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 1);
}

function hashToken(token, seed = 0) {
  let hash = 2166136261 ^ seed;
  for (let index = 0; index < token.length; index += 1) {
    hash ^= token.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  if (!magnitude) {
    return vector;
  }
  return vector.map((value) => Number((value / magnitude).toFixed(6)));
}

function createFallbackEmbedding(text) {
  const tokens = tokenize(text);
  const vector = new Array(FALLBACK_DIMENSIONS).fill(0);

  for (const token of tokens) {
    const primary = hashToken(token) % FALLBACK_DIMENSIONS;
    const secondary = hashToken(token, 17) % FALLBACK_DIMENSIONS;
    const sign = hashToken(token, 31) % 2 === 0 ? 1 : -1;

    vector[primary] += 1;
    vector[secondary] += sign * 0.5;
  }

  return normalizeVector(vector);
}

export function buildJobEmbeddingText(job = {}) {
  return [
    job.title,
    job.company,
    job.location,
    job.description,
    Array.isArray(job.keywords) ? job.keywords.join(", ") : ""
  ]
    .filter(Boolean)
    .join("\n")
    .trim();
}

export async function getEmbedding(text) {
  const input = String(text || "").trim().slice(0, EMBEDDING_MAX_CHARS);
  if (!input) {
    return [];
  }

  if (FORCE_FALLBACK || !openaiClient) {
    return createFallbackEmbedding(input);
  }

  try {
    const request = {
      model: EMBEDDING_MODEL,
      input
    };

    if (EMBEDDING_DIMENSIONS > 0) {
      request.dimensions = EMBEDDING_DIMENSIONS;
    }

    const response = await openaiClient.embeddings.create({
      ...request
    });

    const embedding = response.data?.[0]?.embedding;
    if (!Array.isArray(embedding) || !embedding.length) {
      return createFallbackEmbedding(input);
    }

    return embedding.map((value) => Number(value));
  } catch (error) {
    if (error instanceof OpenAI.APIError && env.nodeEnv !== "production") {
      console.warn("[embedding] Falling back to deterministic embedding:", error.message);
    }
    return createFallbackEmbedding(input);
  }
}

export function cosineSimilarity(vectorA = [], vectorB = []) {
  if (!Array.isArray(vectorA) || !Array.isArray(vectorB) || !vectorA.length || !vectorB.length) {
    return 0;
  }

  const length = Math.min(vectorA.length, vectorB.length);
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let index = 0; index < length; index += 1) {
    const a = Number(vectorA[index] || 0);
    const b = Number(vectorB[index] || 0);
    dot += a * b;
    magA += a * a;
    magB += b * b;
  }

  if (!magA || !magB) {
    return 0;
  }

  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export function toPercentageScore(value) {
  return Math.max(0, Math.min(100, Math.round(Number(value || 0) * 100)));
}

export function hasUsableEmbedding(value) {
  return Array.isArray(value) && value.some((item) => Number.isFinite(Number(item)) && Number(item) !== 0);
}

export function getEmbeddingProviderStatus() {
  return {
    provider: !FORCE_FALLBACK && openaiClient ? "openai" : "fallback",
    model: !FORCE_FALLBACK && openaiClient ? EMBEDDING_MODEL : `deterministic-${FALLBACK_DIMENSIONS}d`,
    dimensions: !FORCE_FALLBACK && openaiClient ? EMBEDDING_DIMENSIONS || "model-default" : FALLBACK_DIMENSIONS,
    maxChars: EMBEDDING_MAX_CHARS
  };
}
