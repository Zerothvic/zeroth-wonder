import { useEffect, useState } from "react";
import { api } from "../api/client.js";

export default function Profile() {
  const [data, setData] = useState(null);
  const [removingCartId, setRemovingCartId] = useState(null);
  const [deletingJobId, setDeletingJobId] = useState(null);

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

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{data.user.displayName}</h1>
          <p className="text-ink/60 text-sm">{data.user.email}</p>
        </div>
        <div className="text-3xl font-bold text-orange">{data.user.coinBalance} coins</div>
      </div>

      <section>
        <h2 className="text-xl font-bold mb-3">Cart</h2>
        <div className="grid gap-3">
          {data.cart.map((item) => (
            <div key={item._id} className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center">
              <span>{item.productId.title}</span>
              <div className="flex items-center gap-4">
                <span className="font-semibold">{item.productId.coinPrice} coins</span>
                <button
                  onClick={() => removeFromCart(item.productId._id)}
                  disabled={removingCartId === item.productId._id}
                  className="text-sm text-orange font-semibold hover:underline disabled:opacity-50"
                >
                  {removingCartId === item.productId._id ? "Removing…" : "Remove"}
                </button>
              </div>
            </div>
          ))}
          {data.cart.length === 0 && <p className="text-ink/50 text-sm">Nothing in cart yet.</p>}
        </div>
        {data.cart.length > 0 && (
          <a href="/checkout" className="inline-block mt-4 bg-blue px-5 py-2 rounded-full font-semibold">
            Go to checkout
          </a>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">Purchases</h2>
        <div className="grid gap-3">
          {data.purchases.map((job) => (
            <div key={job._id} className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center gap-3">
              <span className="flex-1">{job.productId?.title}</span>
              <span className="text-sm capitalize text-ink/60">{job.status}</span>
              {job.status === "ready" && (
                <a href={job.resultAssetUrl} className="text-blue font-semibold text-sm">Download</a>
              )}
              <button
                onClick={() => deletePurchase(job._id, job.productId?.title || "this item")}
                disabled={deletingJobId === job._id}
                className="text-sm text-orange font-semibold hover:underline disabled:opacity-50"
              >
                {deletingJobId === job._id ? "Deleting…" : "Delete"}
              </button>
            </div>
          ))}
          {data.purchases.length === 0 && <p className="text-ink/50 text-sm">No purchases yet.</p>}
        </div>
      </section>
    </div>
  );
}