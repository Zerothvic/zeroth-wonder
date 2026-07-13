import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore.js";
import { api } from "../api/client.js";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendStatus, setResendStatus] = useState(null);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setNeedsVerification(false);
    setResendStatus(null);
    try {
      await login(identifier, password);
      navigate("/products");
    } catch (err) {
      const message = err.response?.data?.error || "Login failed";
      if (message.toLowerCase().includes("verify")) {
        setNeedsVerification(true);
      } else {
        alert(message);
      }
    }
  };

  const resend = async () => {
    setResendStatus("sending");
    try {
      // resend-verification still expects an email specifically — if the
      // person logged in with their username, this may not match anything,
      // which is fine: the endpoint responds the same way either way.
      await api.post("/auth/resend-verification", { email: identifier });
      setResendStatus("sent");
    } catch {
      setResendStatus(null);
      alert("Something went wrong sending that email — try again in a moment.");
    }
  };

  return (
    <form onSubmit={submit} className="max-w-sm mx-auto bg-white rounded-2xl p-8 shadow-sm space-y-4">
      <h1 className="text-2xl font-bold text-orange">Log in</h1>
      <input
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        placeholder="Email or username"
        className="w-full border border-blue rounded-lg p-3"
      />

      <div className="relative">
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          className="w-full border border-blue rounded-lg p-3 pr-11"
        />
        <button
          type="button"
          onClick={() => setShowPassword((s) => !s)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/50 hover:text-ink transition"
        >
          <EyeIcon open={showPassword} />
        </button>
      </div>

      <button className="w-full bg-orange text-cream py-3 rounded-full font-semibold">Log in</button>

      {needsVerification && (
        <div className="bg-yellow/20 border border-yellow rounded-xl p-4 text-sm space-y-2">
          <p className="text-ink/80">
            Your email isn't verified yet. Check your inbox for the verification link, or resend it below.
          </p>
          {resendStatus === "sent" ? (
            <p className="text-blue font-semibold">
              If that account needs verifying, a new email has been sent — check your inbox.
            </p>
          ) : (
            <button
              type="button"
              onClick={resend}
              disabled={resendStatus === "sending" || !identifier}
              className="bg-orange text-cream px-4 py-2 rounded-full font-semibold text-sm disabled:opacity-50"
            >
              {resendStatus === "sending" ? "Sending…" : "Resend verification email"}
            </button>
          )}
        </div>
      )}
    </form>
  );
}

function EyeIcon({ open }) {
  return open ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0112 20c-7 0-10-8-10-8a18.6 18.6 0 015.06-5.94M9.9 4.24A10.4 10.4 0 0112 4c7 0 10 8 10 8a18.6 18.6 0 01-2.16 3.19M14.12 14.12a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s3-8 11-8 11 8 11 8-3 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}