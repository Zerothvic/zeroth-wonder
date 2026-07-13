import "dotenv/config";
import nodemailer from "nodemailer";

console.log("Testing with:");
console.log("HOST:", process.env.SMTP_HOST);
console.log("PORT:", process.env.SMTP_PORT);
console.log("USER:", process.env.SMTP_USER);
console.log("PASS length:", process.env.SMTP_PASS?.length, "(should be 16 for Gmail app password)");
console.log("PASS has spaces:", /\s/.test(process.env.SMTP_PASS || ""));

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify((err, success) => {
  if (err) {
    console.error("❌ SMTP verify failed:", err.message);
  } else {
    console.log("✅ SMTP connection successful — credentials are valid.");
  }
});
