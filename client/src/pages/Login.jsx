import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuthStore } from "../store/useAuthStore.js";

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

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore?.() || {};

  const [form, setForm] = useState({ identifier: "", password: "" });
  const [forgotEmail, setForgotEmail] = useState("");
  const [isForgotView, setIsForgotView] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      if (setUser) setUser(data.user);
      navigate("/profile");
    } catch (err) {
      alert(err.response?.data?.error || "Invalid username/email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: forgotEmail });
      setForgotSent(true);
    } catch (err) {
      alert(err.response?.data?.error || "Unable to process request");
    } finally {
      setLoading(false);
    }
  };

  if (isForgotView) {
    return (
      <div className="max-w-sm mx-auto bg-white rounded-2xl p-8 shadow-sm space-y-4">
        <h1 className="text-2xl font-bold text-orange">Forgot Password</h1>
        {forgotSent ? (
          <div className="space-y-4">
            <p className="text-sm text-ink/70">
              If an account with that email exists, we've sent instructions to reset your password.
            </p>
            <button
              type="button"
              onClick={() => {
                setIsForgotView(false);
                setForgotSent(false);
              }}
              className="w-full bg-blue text-ink py-2.5 rounded-full font-semibold text-sm"
            >
              Back to log in
            </button>
          </div>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <p className="text-xs text-ink/60">
              Enter your registered email address and we'll send you a password reset link.
            </p>
            <div>
              <label className="block text-xs font-semibold text-ink/70 mb-1">Email</label>
              <input
                required
                type="email"
                placeholder="name@example.com"
                value={forgotEmail}
                className="w-full border border-blue rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-orange"
                onChange={(e) => setForgotEmail(e.target.value)}
              />
            </div>
            <button
              disabled={loading}
              className="w-full bg-orange text-cream py-3 rounded-full font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Sending link…" : "Send reset link"}
            </button>
            <button
              type="button"
              onClick={() => setIsForgotView(false)}
              className="w-full text-center text-xs text-ink/60 font-semibold hover:underline block"
            >
              Cancel and return to log in
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleLogin} className="max-w-sm mx-auto bg-white rounded-2xl p-8 shadow-sm space-y-4">
      <h1 className="text-2xl font-bold text-orange">Log in</h1>

      <div>
        <label className="block text-xs font-semibold text-ink/70 mb-1">Username or Email</label>
        <input
          required
          type="text"
          placeholder="Username or email address"
          value={form.identifier}
          className="w-full border border-blue rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-orange"
          onChange={(e) => setForm((f) => ({ ...f, identifier: e.target.value }))}
        />
      </div>

      <div>
        <div className="flex justify-between items-baseline mb-1">
          <label className="text-xs font-semibold text-ink/70">Password</label>
          <button
            type="button"
            onClick={() => setIsForgotView(true)}
            className="text-xs text-blue font-semibold hover:underline"
          >
            Forgot password?
          </button>
        </div>
        <div className="relative">
          <input
            required
            placeholder="Enter your password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            className="w-full border border-blue rounded-lg p-3 pr-11 text-sm focus:outline-none focus:ring-1 focus:ring-orange"
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
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
      </div>

      <button
        disabled={loading}
        className="w-full bg-orange text-cream py-3 rounded-full font-semibold hover:opacity-90 transition disabled:opacity-50"
      >
        {loading ? "Logging in…" : "Log in"}
      </button>

      <p className="text-xs text-center text-ink/60">
        Don't have an account?{" "}
        <Link to="/signup" className="text-blue font-semibold hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}