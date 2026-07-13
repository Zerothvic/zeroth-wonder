import { useState } from "react";
import { api } from "../api/client.js";

export default function Signup() {
  const [form, setForm] = useState({ email: "", username: "", password: "", displayName: "" });
  const [sent, setSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/signup", form);
      setSent(true);
    } catch (err) {
      alert(err.response?.data?.error || "Signup failed");
    }
  };

  if (sent) return <p className="text-center">Check your email to verify your account and claim your sign-up coins.</p>;

  return (
    <form onSubmit={submit} className="max-w-sm mx-auto bg-white rounded-2xl p-8 shadow-sm space-y-4">
      <h1 className="text-2xl font-bold text-orange">Sign up</h1>
      <input placeholder="Display name" className="w-full border border-blue rounded-lg p-3"
        onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))} />
      <input placeholder="Username" className="w-full border border-blue rounded-lg p-3"
        onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
      <input placeholder="Email" className="w-full border border-blue rounded-lg p-3"
        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />

      <div className="relative">
        <input
          placeholder="Password"
          type={showPassword ? "text" : "password"}
          className="w-full border border-blue rounded-lg p-3 pr-11"
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

      <button className="w-full bg-orange text-cream py-3 rounded-full font-semibold">Sign up</button>
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