import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api } from "../api/client.js";

export default function Verify() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("verifying"); // verifying | success | error

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    api
      .get(`/auth/verify?token=${token}`)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl p-8 shadow-sm text-center space-y-4">
      {status === "verifying" && (
        <>
          <h1 className="text-2xl font-bold text-orange">Verifying your email…</h1>
          <p className="text-ink/70 text-sm">Just a moment.</p>
        </>
      )}

      {status === "success" && (
        <>
          <h1 className="text-2xl font-bold text-orange">Email verified! 🎉</h1>
          <p className="text-ink/70 text-sm">
            Your account is confirmed and your sign-up coins have been credited.
          </p>
          <Link
            to="/login"
            className="inline-block bg-orange text-cream px-6 py-3 rounded-full font-semibold hover:opacity-90"
          >
            Log in now
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <h1 className="text-2xl font-bold text-orange">Verification link invalid or expired</h1>
          <p className="text-ink/70 text-sm">
            This link may have already been used, or has expired. Try logging in — if your account
            still needs verifying, you'll get an option to resend the email.
          </p>
          <Link
            to="/login"
            className="inline-block bg-orange text-cream px-6 py-3 rounded-full font-semibold hover:opacity-90"
          >
            Go to login
          </Link>
        </>
      )}
    </div>
  );
}