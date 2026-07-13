import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuthStore } from "../store/useAuthStore.js";
import { useCartStore } from "../store/useCartStore.js";

const PLATFORMS = ["facebook", "instagram", "twitter", "whatsapp", "linkedin"];

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();
  const [product, setProduct] = useState(null);
  const [comment, setComment] = useState("");

  const load = () => api.get(`/products/${id}`).then(({ data }) => setProduct(data));
  useEffect(() => { load(); }, [id]);

  if (!product) return <p>Loading…</p>;

  const like = async () => { await api.post("/engagements/like", { productId: id }); load(); };

  const submitComment = async () => {
    if (comment.trim().length < 8) return;
    await api.post("/engagements/comment", { productId: id, text: comment });
    setComment("");
    load();
  };

  const share = (platform) => {
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`,
      twitter: `https://twitter.com/intent/tweet?url=${window.location.href}&text=${product.title}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(product.title + " " + window.location.href)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`,
      instagram: window.location.href,
    };
    window.open(shareUrls[platform], "_blank", "noopener,noreferrer");
  };

  const confirmShare = async (platform) => {
    await api.post("/engagements/share/confirm", { productId: id, platform });
    load();
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 shadow-sm">
      <h1 className="text-3xl font-bold text-orange mb-2">{product.title}</h1>
      <img
        src={product.sampleAssetUrl || `https://placehold.co/600x400/ED802A/E9CEAF?text=${encodeURIComponent(product.title)}`}
        alt={product.title}
        className="w-full h-56 object-cover rounded-xl mb-4"
      />
      <p className="text-ink/70 mb-4">{product.description}</p>
      <p className="font-semibold text-blue mb-6">{product.coinPrice} coins</p>

      {product.progress && (
        <div className="mb-6 space-y-2 text-sm">
          <ProgressRow label="Likes" p={product.progress.likes} />
          <ProgressRow label="Comment" p={product.progress.comments} />
          <ProgressRow label="Sign up" p={product.progress.signup} />
          <ProgressRow label="Shares (3 platforms)" p={product.progress.shares} />
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        <button onClick={like} className="bg-yellow px-4 py-2 rounded-full font-semibold">Like</button>
        {PLATFORMS.map((pl) => (
          <div key={pl} className="flex gap-1">
            <button onClick={() => share(pl)} className="bg-cream border border-orange px-3 py-2 rounded-full text-sm">
              Share {pl}
            </button>
            {user && (
              <button onClick={() => confirmShare(pl)} className="bg-blue px-3 py-2 rounded-full text-sm">
                ✓ I shared it
              </button>
            )}
          </div>
        ))}
      </div>

      {user && (
        <div className="mb-6">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Leave a comment (min 8 characters) to earn coins…"
            className="w-full border border-blue rounded-lg p-3 text-sm"
          />
          <button onClick={submitComment} className="mt-2 bg-orange text-cream px-4 py-2 rounded-full text-sm">
            Comment
          </button>
        </div>
      )}

      <button
        disabled={!product.unlocked}
        onClick={() => addToCart(product._id)}
        className="w-full bg-ink text-cream py-3 rounded-full font-semibold disabled:opacity-40"
      >
        {product.unlocked ? "Add to cart" : "Locked — meet requirements above"}
      </button>
    </div>
  );
}

function ProgressRow({ label, p }) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <span className={p.met ? "text-blue font-semibold" : "text-ink/50"}>
        {p.have}/{p.need || 1} {p.met ? "✓" : ""}
      </span>
    </div>
  );
}