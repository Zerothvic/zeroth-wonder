import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";

export default function Checkout() {
  const [cart, setCart] = useState([]);
  const [prompts, setPrompts] = useState({});
  const navigate = useNavigate();

  useEffect(() => { api.get("/cart").then(({ data }) => setCart(data)); }, []);

  const total = cart.reduce((sum, i) => sum + i.productId.coinPrice, 0);

  const submit = async () => {
    const items = cart.map((i) => ({ productId: i.productId._id, prompt: prompts[i.productId._id] || "" }));
    try {
      await api.post("/checkout", { items });
      navigate("/profile");
    } catch (err) {
      alert(err.response?.data?.error || "Checkout failed");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-orange">Checkout</h1>
      {cart.map((item) => (
        <div key={item._id} className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex justify-between mb-2">
            <span className="font-semibold">{item.productId.title}</span>
            <span>{item.productId.coinPrice} coins</span>
          </div>
          <textarea
            placeholder="Describe what you want generated…"
            className="w-full border border-blue rounded-lg p-3 text-sm"
            onChange={(e) => setPrompts((p) => ({ ...p, [item.productId._id]: e.target.value }))}
          />
        </div>
      ))}
      <div className="flex justify-between font-bold text-lg">
        <span>Total</span>
        <span>{total} coins</span>
      </div>
      <button onClick={submit} className="w-full bg-ink text-cream py-3 rounded-full font-semibold">
        Confirm & Generate
      </button>
    </div>
  );
}