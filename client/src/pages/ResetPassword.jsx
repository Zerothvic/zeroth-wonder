import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { api } from "../api/client.js";

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

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password, confirmPassword });
      setSuccess(true);
    } catch (err) {
      alert(err.response?.data?.error || "Password reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="max-w-sm mx-auto bg-white rounded-2xl p-8 shadow-sm text-center space-y-3">
        <h1 className="text-xl font-bold text-orange">Invalid Link</h1>
        <p className="text-sm text-ink/70">No password reset token was found in the link.</p>
        <Link to="/login" className="inline-block text-sm font-semibold text-blue underline">
          Go to log in
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-sm mx-auto bg-white rounded-2xl p-8 shadow-sm text-center space-y-4">
        <h1 className="text-2xl font-bold text-orange">Password Reset!</h1>
        <p className="text-sm text-ink/70">Your password has been successfully updated.</p>
        <button
          onClick={() => navigate("/login")}
          className="w-full bg-blue text-ink py-3 rounded-full font-semibold hover:opacity-90 transition"
        >
          Log in with new password
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto bg-white rounded-2xl p-8 shadow-sm space-y-4">
      <h1 className="text-2xl font-bold text-orange">Set New Password</h1>

      <div>
        <label className="block text-xs font-semibold text-ink/70 mb-1">New Password</label>
        <div className="relative">
          <input
            required
            placeholder="At least 8 characters"
            type={showPassword ? "text" : "password"}
            value={password}
            className="w-full border border-blue rounded-lg p-3 pr-11 text-sm focus:outline-none focus:ring-1 focus:ring-orange"
            onChange={(e) => setPassword(e.target.value)}
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

      <div>
        <label className="block text-xs font-semibold text-ink/70 mb-1">Confirm New Password</label>
        <div className="relative">
          <input
            required
            placeholder="Re-enter your new password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            className="w-full border border-blue rounded-lg p-3 pr-11 text-sm focus:outline-none focus:ring-1 focus:ring-orange"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((s) => !s)}
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/50 hover:text-ink transition"
          >
            <EyeIcon open={showConfirmPassword} />
          </button>
        </div>
      </div>

      <button
        disabled={loading}
        className="w-full bg-orange text-cream py-3 rounded-full font-semibold hover:opacity-90 transition disabled:opacity-50"
      >
        {loading ? "Updating password…" : "Reset password"}
      </button>
    </form>
  );
}