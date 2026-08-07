import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client.js";

export default function Checkout() {
  const [cart, setCart] = useState([]);
  const [prompts, setPrompts] = useState({});
  const [removingId, setRemovingId] = useState(null);
  const navigate = useNavigate();

  const loadCart = () => api.get("/cart").then(({ data }) => setCart(data));
  useEffect(() => { loadCart(); }, []);

  const total = cart.reduce((sum, i) => sum + i.productId.coinPrice, 0);

  const removeItem = async (productId) => {
    setRemovingId(productId);
    try {
      await api.delete(`/cart/${productId}`);
      await loadCart();
    } catch (err) {
      alert(err.response?.data?.error || "Couldn't remove item");
    } finally {
      setRemovingId(null);
    }
  };

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
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">{item.productId.title}</span>
            <div className="flex items-center gap-3">
              <span>{item.productId.coinPrice} coins</span>
              <button
                onClick={() => removeItem(item.productId._id)}
                disabled={removingId === item.productId._id}
                className="text-sm text-orange font-semibold hover:underline disabled:opacity-50"
              >
                {removingId === item.productId._id ? "Removing…" : "Remove"}
              </button>
            </div>
          </div>
          <textarea
            placeholder="Describe what you want generated…"
            className="w-full border border-blue rounded-lg p-3 text-sm"
            onChange={(e) => setPrompts((p) => ({ ...p, [item.productId._id]: e.target.value }))}
          />
        </div>
      ))}
      {cart.length === 0 && <p className="text-ink/50 text-sm">Your cart is empty.</p>}
      <div className="flex justify-between font-bold text-lg">
        <span>Total</span>
        <span>{total} coins</span>
      </div>
      <button
        onClick={submit}
        disabled={cart.length === 0}
        className="w-full bg-ink text-cream py-3 rounded-full font-semibold disabled:opacity-40"
      >
        Confirm & Generate
      </button>
    </div>
  );
}