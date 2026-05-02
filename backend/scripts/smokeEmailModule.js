import { sendEmail } from "../services/emailService.js";

async function main() {
  const result = await sendEmail({
    to: "local-test@example.com",
    subject: "ResumeBuilder AI email smoke test",
    text: "Email service dry-run is working.",
    html: "<p>Email service dry-run is working.</p>"
  });

  console.log("Email result:", result);

  if (!result.skipped && !result.sent) {
    throw new Error("Email smoke test failed");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
