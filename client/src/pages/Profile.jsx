import { useEffect, useState } from "react";
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

// A real shopping-cart glyph (body + wheels + handle), not a plain bag icon.
function CartIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="20" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="18" cy="20" r="1.4" fill="currentColor" stroke="none" />
      <path d="M2.5 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21 7H6" />
    </svg>
  );
}

function EmptyBasket() {
  return (
    <div className="text-center p-10">
      <CartIcon className="w-12 h-12 mx-auto text-ink/20 mb-3" />
      <p className="text-ink/50 text-sm">
        Your cart is empty. Unlock a product and add it here to get started.
      </p>
    </div>
  );
}

function BasketItems({ cart, removingCartId, onRemove }) {
  return (
    <div className="divide-y divide-cream/60">
      {cart.map((item) => (
        <div key={item._id} className="flex items-center gap-4 px-6 py-4">
          <img
            src={item.productId?.sampleAssetUrl || "https://placehold.co/100x100/ED802A/E9CEAF?text=?"}
            alt={item.productId?.title}
            className="w-14 h-14 rounded-lg object-cover shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{item.productId?.title}</p>
            <p className="text-xs text-ink/50 capitalize">{item.productId?.type}</p>
          </div>
          <span className="text-xs bg-cream text-ink/70 px-2 py-1 rounded-full font-semibold shrink-0">
            Qty 1
          </span>
          <span className="font-semibold text-orange whitespace-nowrap">{item.productId?.coinPrice} coins</span>
          <button
            onClick={() => onRemove(item.productId._id)}
            disabled={removingCartId === item.productId._id}
            className="text-xs text-ink/40 hover:text-orange font-semibold disabled:opacity-50"
          >
            {removingCartId === item.productId._id ? "…" : "Remove"}
          </button>
        </div>
      ))}
    </div>
  );
}

function BasketFooter({ total }) {
  return (
    <div className="px-6 py-5 bg-cream/40 border-t border-cream space-y-3">
      <div className="flex items-center justify-between text-sm text-ink/60">
        <span>Subtotal</span>
        <span>{total} coins</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-bold text-ink">Total</span>
        <span className="text-xl font-bold text-orange">{total} coins</span>
      </div>
      
      <a
        href="/checkout"
        className="flex items-center justify-center gap-2 w-full bg-blue py-3 rounded-full font-semibold hover:opacity-90 transition"
      >
        <CartIcon className="w-4 h-4" />
        Proceed to checkout
      </a>
    </div>
  );
}

function ReceiptBox({ job, deletingJobId, onDelete }) {
  return (
    <div className="flex items-center gap-14 p-5">
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
        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize mb-2 ${STATUS_STYLES[job.status] || "bg-cream text-ink"}`}>
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
            onClick={() => onDelete(job._id, job.productId?.title || "this item")}
            disabled={deletingJobId === job._id}
            className="text-orange font-semibold text-sm hover:underline disabled:opacity-50"
          >
            {deletingJobId === job._id ? "Deleting…" : "Delete"}
          </button>
        </div>
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

  const load = () => api.get("/profile").then(({ data }) => setData(data));
  useEffect(() => { load(); }, []);

  if (!data) return <p>Loading…</p>;

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
        remaining ? `Try again in ${formatRemaining(remaining)}.` : err.response?.data?.error || "Couldn't reset right now."
      );
    } finally {
      setResetting(false);
    }
  };

  const lastReset = data.user.lastEngagementResetAt ? new Date(data.user.lastEngagementResetAt).getTime() : 0;
  const elapsed = Date.now() - lastReset;
  const onCooldown = elapsed < RESET_COOLDOWN_MS;
  const basketTotal = data.cart.reduce((sum, item) => sum + (item.productId?.coinPrice || 0), 0);
  const hasItems = data.cart.length > 0;

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{data.user.displayName}</h1>
          <p className="text-ink/60 text-sm">{data.user.email}</p>
        </div>
        <div className="text-3xl font-bold text-orange">{data.user.coinBalance} coins</div>
      </div>

      <section className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold mb-2">Out of things to like or comment on?</h2>
        <p className="text-sm text-ink/60 mb-3">
          Reset your engagements to re-like, re-comment, and re-share — and keep earning coins.
          This doesn't affect coins you've already earned. Available once every 3 hours.
        </p>
        <button
          onClick={resetEngagements}
          disabled={resetting || onCooldown}
          className="bg-blue px-5 py-2 rounded-full font-semibold text-sm disabled:opacity-40"
        >
          {resetting ? "Resetting…" : onCooldown ? `Available in ${formatRemaining(RESET_COOLDOWN_MS - elapsed)}` : "Reset engagements"}
        </button>
        {resetMessage && <p className="text-sm text-ink/70 mt-2">{resetMessage}</p>}
      </section>

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

        {!hasItems && <EmptyBasket />}
        {hasItems && <BasketItems cart={data.cart} removingCartId={removingCartId} onRemove={removeFromCart} />}
        {hasItems && <BasketFooter total={basketTotal} />}
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">Your Purchases</h2>
        <div className="space-y-4">
          {data.purchases.map((job) => (
            <ReceiptBox key={job._id} job={job} deletingJobId={deletingJobId} onDelete={deletePurchase} />
          ))}
        </div>
        {data.purchases.length === 0 && (
          <p className="text-ink/50 text-sm bg-white rounded-2xl p-6 shadow-sm">No purchases yet.</p>
        )}
      </section>
    </div>
  );
}