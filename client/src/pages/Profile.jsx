import { useEffect, useState, useRef } from "react";
import { api } from "../api/client.js";

const RESET_COOLDOWN_MS = 3 * 60 * 60 * 1000;

function formatRemaining(ms) {
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  return `${hours}h ${minutes}m`;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const STATUS_STYLES = {
  queued: "bg-yellow/30 text-ink",
  processing: "bg-blue/30 text-ink animate-pulse",
  ready: "bg-blue text-ink",
  failed: "bg-orange/30 text-orange",
};

function CartIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="20" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="18" cy="20" r="1.4" fill="currentColor" stroke="none" />
      <path d="M2.5 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21 7H6" />
    </svg>
  );
}

function EditProfileModal({ user, onClose, onUpdated }) {
  const [form, setForm] = useState({
    username: user.username || "",
    email: user.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await api.put("/profile", form);
      alert("Profile updated successfully!");
      onUpdated();
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-lg space-y-4">
        <h2 className="text-xl font-bold text-orange">Edit Profile</h2>
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-ink/70 mb-1">Username</label>
            <input
              type="text"
              required
              value={form.username}
              className="w-full border border-blue rounded-lg p-2.5 text-sm"
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink/70 mb-1">Email</label>
            <input
              type="email"
              required
              value={form.email}
              className="w-full border border-blue rounded-lg p-2.5 text-sm"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <hr className="border-cream my-2" />

          <p className="text-xs text-ink/50">Change password (optional):</p>

          <div>
            <label className="block text-xs font-semibold text-ink/70 mb-1">Current Password</label>
            <input
              type="password"
              placeholder="Required to change password"
              value={form.currentPassword}
              className="w-full border border-blue rounded-lg p-2.5 text-sm"
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink/70 mb-1">New Password</label>
            <input
              type="password"
              placeholder="At least 8 characters"
              value={form.newPassword}
              className="w-full border border-blue rounded-lg p-2.5 text-sm"
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink/70 mb-1">Confirm New Password</label>
            <input
              type="password"
              placeholder="Re-enter new password"
              value={form.confirmPassword}
              className="w-full border border-blue rounded-lg p-2.5 text-sm"
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange text-cream py-2 rounded-full font-semibold text-sm disabled:opacity-50"
            >
              {loading ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-ink/60 font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Profile() {
  const [data, setData] = useState(null);
  const [removingCartId, setRemovingCartId] = useState(null);
  const [deletingJobId, setDeletingJobId] = useState(null);
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const load = () => api.get("/profile").then(({ data }) => setData(data));

  useEffect(() => {
    load();
  }, []);

  if (!data) return <p>Loading…</p>;

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    setUploadingAvatar(true);
    try {
      await api.post("/profile/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await load();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const removeFromCart = async (productId) => {
    setRemovingCartId(productId);
    try {
      await api.delete(`/cart/${productId}`);
      await load();
    } catch (err) {
      alert(err.response?.data?.error || "Couldn't remove item");
    } finally {
      setRemovingCartId(null);
    }
  };

  const deletePurchase = async (jobId, title) => {
    if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return;
    setDeletingJobId(jobId);
    try {
      await api.delete(`/profile/purchases/${jobId}`);
      await load();
    } catch (err) {
      alert(err.response?.data?.error || "Couldn't delete item");
    } finally {
      setDeletingJobId(null);
    }
  };

  const resetEngagements = async () => {
    setResetting(true);
    setResetMessage(null);
    try {
      const { data: res } = await api.post("/engagements/reset");
      setResetMessage(res.message);
      await load();
    } catch (err) {
      const remaining = err.response?.data?.remainingMs;
      setResetMessage(
        remaining
          ? `Try again in ${formatRemaining(remaining)}.`
          : err.response?.data?.error || "Couldn't reset right now."
      );
    } finally {
      setResetting(false);
    }
  };

  const lastReset = data.user.lastEngagementResetAt
    ? new Date(data.user.lastEngagementResetAt).getTime()
    : 0;
  const elapsed = Date.now() - lastReset;
  const onCooldown = elapsed < RESET_COOLDOWN_MS;
  const basketTotal = data.cart.reduce(
    (sum, item) => sum + (item.productId?.coinPrice || 0),
    0
  );
  const hasItems = data.cart.length > 0;

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative group shrink-0">
            <img
              src={
                data.user.avatarUrl ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.user.username)}`
              }
              alt={data.user.username}
              className="w-16 h-16 rounded-full object-cover border-2 border-orange bg-cream/50"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute inset-0 bg-ink/40 rounded-full flex items-center justify-center text-cream text-[10px] font-bold opacity-0 group-hover:opacity-100 transition"
            >
              {uploadingAvatar ? "…" : "Change"}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="min-w-0">
            <h1 className="text-2xl font-bold truncate text-ink">@{data.user.username}</h1>
            <p className="text-ink/60 text-sm truncate">{data.user.email}</p>
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-blue font-semibold hover:underline mt-1 block"
            >
              Edit profile
            </button>
          </div>
        </div>

        <div className="text-3xl font-bold text-orange shrink-0">{data.user.coinBalance} coins</div>
      </div>

      {isEditing && (
        <EditProfileModal
          user={data.user}
          onClose={() => setIsEditing(false)}
          onUpdated={load}
        />
      )}

      {/* Engagement Reset Section */}
      <section className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold mb-2">Out of things to like or comment on?</h2>
        <p className="text-sm text-ink/60 mb-3">
          Reset your engagements to re-like, re-comment, and re-share — and keep earning coins[cite: 1].
          This doesn't affect coins you've already earned. Available once every 3 hours[cite: 1].
        </p>
        <button
          onClick={resetEngagements}
          disabled={resetting || onCooldown}
          className="bg-blue px-5 py-2 rounded-full font-semibold text-sm disabled:opacity-40"
        >
          {resetting
            ? "Resetting…"
            : onCooldown
              ? `Available in ${formatRemaining(RESET_COOLDOWN_MS - elapsed)}`
              : "Reset engagements"}
        </button>
        {resetMessage && <p className="text-sm text-ink/70 mt-2">{resetMessage}</p>}
      </section>

      {/* Basket Section */}
      <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-ink text-cream px-6 py-4 flex items-center gap-3">
          <CartIcon className="w-6 h-6" />
          <h2 className="font-bold">Your Cart</h2>
          {hasItems && (
            <span className="ml-auto text-xs bg-blue text-ink px-2.5 py-1 rounded-full font-bold">
              {data.cart.length}
            </span>
          )}
        </div>

        {hasItems ? (
          <div className="divide-y divide-cream/60">
            {data.cart.map((item) => (
              <div
                key={item._id}
                className="grid grid-cols-[auto_minmax(0,1fr)] sm:flex sm:items-center gap-x-3 gap-y-3 sm:gap-4 px-4 sm:px-6 py-4"
              >
                <img
                  src={item.productId?.sampleAssetUrl || "https://placehold.co/100x100/ED802A/E9CEAF?text=?"}
                  alt={item.productId?.title}
                  className="w-14 h-14 rounded-lg object-cover shrink-0"
                />
                <div className="min-w-0 self-center sm:flex-1">
                  <p className="font-semibold truncate">{item.productId?.title}</p>
                  <p className="text-xs text-ink/50 capitalize truncate">{item.productId?.type}</p>
                </div>
                <div className="col-span-2 flex items-center justify-between gap-2 sm:contents">
                  <span className="text-xs bg-cream text-ink/70 px-2 py-1 rounded-full font-semibold shrink-0">
                    Qty 1
                  </span>
                  <span className="font-semibold text-orange whitespace-nowrap">
                    {item.productId?.coinPrice} coins
                  </span>
                  <button
                    onClick={() => removeFromCart(item.productId._id)}
                    disabled={removingCartId === item.productId._id}
                    className="text-xs text-ink/40 hover:text-orange font-semibold disabled:opacity-50 shrink-0"
                  >
                    {removingCartId === item.productId._id ? "…" : "Remove"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-10">
            <CartIcon className="w-12 h-12 mx-auto text-ink/20 mb-3" />
            <p className="text-ink/50 text-sm">
              Your cart is empty. Unlock a product and add it here to get started.
            </p>
          </div>
        )}

        {hasItems && (
          <div className="px-4 sm:px-6 py-5 bg-cream/40 border-t border-cream space-y-3">
            <div className="flex items-center justify-between text-sm text-ink/60 gap-4">
              <span>Subtotal</span>
              <span className="whitespace-nowrap">{basketTotal} coins</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="font-bold text-ink">Total</span>
              <span className="text-xl font-bold text-orange whitespace-nowrap">{basketTotal} coins</span>
            </div>
            <a
              href="/checkout"
              className="flex items-center justify-center gap-2 w-full bg-blue py-3 rounded-full font-semibold hover:opacity-90 transition"
            >
              <CartIcon className="w-4 h-4" />
              Proceed to checkout
            </a>
          </div>
        )}
      </section>

      {/* Purchases Section */}
      <section>
        <h2 className="text-xl font-bold mb-3">Your Purchases</h2>
        <div className="space-y-4">
          {data.purchases.map((job) => (
            <div key={job._id} className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-14 p-5">
              <div className="wonder-box3d shrink-0">
                <div className="box-top" />
                <div className="box-side" />
                <div className="box-front">
                  <img
                    src={job.productId?.sampleAssetUrl || "https://placehold.co/400x400/ED802A/E9CEAF?text=?"}
                    alt={job.productId?.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0 bg-white rounded-2xl shadow-sm p-5">
                <h3 className="font-bold text-ink leading-snug mb-1">{job.productId?.title}</h3>
                <span
                  className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize mb-2 ${
                    STATUS_STYLES[job.status] || "bg-cream text-ink"
                  }`}
                >
                  {job.status}
                </span>
                <p className="text-xs text-ink/50 mb-3">
                  {formatDate(job.createdAt)} · {job.productId?.coinPrice ?? "—"} coins
                </p>
                <div className="flex items-center gap-4">
                  {job.status === "ready" && (
                    <a href={job.resultAssetUrl} className="text-blue font-semibold text-sm hover:underline">
                      Download
                    </a>
                  )}
                  <button
                    onClick={() => deletePurchase(job._id, job.productId?.title || "this item")}
                    disabled={deletingJobId === job._id}
                    className="text-orange font-semibold text-sm hover:underline disabled:opacity-50"
                  >
                    {deletingJobId === job._id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {data.purchases.length === 0 && (
          <p className="text-ink/50 text-sm bg-white rounded-2xl p-6 shadow-sm">No purchases yet.</p>
        )}
      </section>
    </div>
  );
}