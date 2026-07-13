import { useEffect, useState } from "react";
import { api } from "../api/client.js";

export default function Profile() {
  const [data, setData] = useState(null);

  useEffect(() => { api.get("/profile").then(({ data }) => setData(data)); }, []);
  if (!data) return <p>Loading…</p>;

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
            <div key={item._id} className="bg-white rounded-xl p-4 shadow-sm flex justify-between">
              <span>{item.productId.title}</span>
              <span className="font-semibold">{item.productId.coinPrice} coins</span>
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
            <div key={job._id} className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center">
              <span>{job.productId?.title}</span>
              <span className="text-sm capitalize">{job.status}</span>
              {job.status === "ready" && (
                <a href={job.resultAssetUrl} className="text-blue font-semibold text-sm">Download</a>
              )}
            </div>
          ))}
          {data.purchases.length === 0 && <p className="text-ink/50 text-sm">No purchases yet.</p>}
        </div>
      </section>
    </div>
  );
}