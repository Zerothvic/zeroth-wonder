// Uses Brevo's REST API over HTTPS (port 443), NOT SMTP — this deliberately
// avoids ports 25/465/587, which Render's free tier blocks outbound.

export async function sendVerificationEmail(toEmail, verificationToken) {
  const verifyUrl = `${process.env.CLIENT_URL}/verify?token=${verificationToken}`;

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: "Zeroth Wonder", email: process.env.SMTP_FROM },
      to: [{ email: toEmail }],
      subject: "Verify your Zeroth Wonder account",
      htmlContent: `
        <p>Welcome to Zeroth Wonder!</p>
        <p>Click below to verify your email and claim your sign-up coins:</p>
        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
        <p>If you didn't create this account, you can ignore this email.</p>
      `,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Brevo API error ${res.status}: ${errorBody}`);
  }
}

export async function sendPasswordResetEmail(toEmail, resetToken) {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: "Zeroth Wonder", email: process.env.SMTP_FROM },
      to: [{ email: toEmail }],
      subject: "Reset your Zeroth Wonder password",
      htmlContent: `
        <p>You requested a password reset for Zeroth Wonder.</p>
        <p><a href="${resetUrl}">Click here to reset your password</a></p>
        <p>This link expires in 1 hour.</p>
      `,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Brevo API error ${res.status}: ${errorBody}`);
  }
}