import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(toEmail, verificationToken) {
  const verifyUrl = `${process.env.CLIENT_URL}/verify?token=${verificationToken}`;

  await transporter.sendMail({
    from: `"Zeroth Wonder" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: toEmail,
    subject: "Verify your Zeroth Wonder account",
    html: `
      <p>Welcome to Zeroth Wonder!</p>
      <p>Click below to verify your email and claim your sign-up coins:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>If you didn't create this account, you can ignore this email.</p>
    `,
  });
}