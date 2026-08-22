import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuthStore } from "../store/useAuthStore.js";
import { useCartStore } from "../store/useCartStore.js";

const PLATFORMS = ["facebook", "instagram", "twitter", "whatsapp", "linkedin"];

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();
  const [product, setProduct] = useState(null);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [postingComment, setPostingComment] = useState(false);

  const load = () => api.get(`/products/${id}`).then(({ data }) => setProduct(data));
  const loadComments = () => api.get(`/engagements/comments/${id}`).then(({ data }) => setComments(data));

  useEffect(() => {
    load();
    loadComments();
  }, [id]);

  if (!product) return <p>Loading…</p>;

  const like = async () => { await api.post("/engagements/like", { productId: id }); load(); };

  const submitComment = async () => {
    if (comment.trim().length < 8) return;
    setPostingComment(true);
    try {
      await api.post("/engagements/comment", { productId: id, text: comment });
      setComment("");
      await Promise.all([load(), loadComments()]);
    } finally {
      setPostingComment(false);
    }
  };

  const share = (platform) => {
    // Share the server-rendered /share/product/:id URL, not the raw React
    // app URL — only the server route has real Open Graph tags for social
    // crawlers to read, so this is what makes thumbnails show up correctly.
    const shareUrl = `${import.meta.env.VITE_API_URL?.replace(/\/api$/, "") || ""}/share/product/${product._id}`;
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(product.title)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(product.title + " " + shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      instagram: shareUrl,
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
        className="w-full aspect-square object-cover rounded-xl mb-4"
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
          <button
            onClick={submitComment}
            disabled={postingComment || comment.trim().length < 8}
            className="mt-2 bg-orange text-cream px-4 py-2 rounded-full text-sm disabled:opacity-50"
          >
            {postingComment ? "Posting…" : "Comment"}
          </button>
        </div>
      )}

      <div className="mb-6 space-y-3">
        <h2 className="font-semibold text-ink">
          Comments {comments.length > 0 && <span className="text-ink/40">({comments.length})</span>}
        </h2>
        {comments.length === 0 && <p className="text-sm text-ink/50">No comments yet — be the first.</p>}
        {comments.map((c) => (
          <div key={c.id} className="bg-cream/40 rounded-lg p-3 text-sm">
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-semibold text-ink">{c.displayName}</span>
              <span className="text-xs text-ink/40">{timeAgo(c.createdAt)}</span>
            </div>
            <p className="text-ink/80">{c.text}</p>
          </div>
        ))}
      </div>

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