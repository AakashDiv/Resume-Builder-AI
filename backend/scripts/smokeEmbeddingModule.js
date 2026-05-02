import { buildJobEmbeddingText, cosineSimilarity, getEmbedding, getEmbeddingProviderStatus, hasUsableEmbedding } from "../services/embedding.service.js";

const sampleJob = {
  title: "Frontend React Developer",
  company: "Acme Software",
  location: "Remote",
  description: "Build React dashboards.",
  keywords: ["react"]
};

const sampleCandidate = [
  "React frontend engineer",
  "Dashboard UI"
].join("\n");

async function main() {
  const provider = getEmbeddingProviderStatus();
  const jobText = buildJobEmbeddingText(sampleJob);
  const [jobEmbedding, candidateEmbedding] = await Promise.all([
    getEmbedding(jobText),
    getEmbedding(sampleCandidate)
  ]);

  const similarity = cosineSimilarity(candidateEmbedding, jobEmbedding);

  console.log("Embedding provider:", provider.provider);
  console.log("Embedding model:", provider.model);
  console.log("Requested dimensions:", provider.dimensions);
  console.log("Max input chars:", provider.maxChars);
  console.log("Job text length:", jobText.length);
  console.log("Job embedding dimensions:", jobEmbedding.length);
  console.log("Candidate embedding dimensions:", candidateEmbedding.length);
  console.log("Job embedding usable:", hasUsableEmbedding(jobEmbedding));
  console.log("Similarity:", Number(similarity.toFixed(4)));

  if (!hasUsableEmbedding(jobEmbedding) || !hasUsableEmbedding(candidateEmbedding)) {
    throw new Error("Embedding smoke test failed: generated embedding was empty.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
