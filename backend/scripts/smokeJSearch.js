import { fetchJobsFromJSearch } from "../services/scraper.service.js";

async function main() {
  const result = await fetchJobsFromJSearch({
    role: "developer",
    location: "chicago",
    timeFilter: "all"
  });

  console.log("Skipped:", Boolean(result.skipped));
  if (result.reason) console.log("Reason:", result.reason);
  console.log("Request:", result.request || null);
  console.log("Jobs returned:", result.jobs.length);

  for (const job of result.jobs.slice(0, 3)) {
    console.log(`${job.title} | ${job.company || "Unknown"} | ${job.location || "Unknown"} | ${job.externalId || "no-id"}`);
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
