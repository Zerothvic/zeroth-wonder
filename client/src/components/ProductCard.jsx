import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/products/${product._id}`}
      className="block bg-white rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden border-2 border-transparent hover:border-blue"
    >
      <img
        src={product.sampleAssetUrl || `https://placehold.co/600x400/ED802A/E9CEAF?text=${encodeURIComponent(product.title)}`}
        alt={product.title}
        className="w-full h-40 object-cover"
      />
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-orange">
            {product.type}
          </span>
          {product.unlocked ? (
            <span className="text-xs bg-blue text-ink px-2 py-1 rounded-full">Unlocked</span>
          ) : (
            <span className="text-xs bg-yellow text-ink px-2 py-1 rounded-full">Locked</span>
          )}
        </div>
        <h3 className="font-display text-lg font-semibold mb-1">{product.title}</h3>
        <p className="text-sm text-ink/70 mb-3">{product.description}</p>
        <span className="text-sm font-bold text-orange">{product.coinPrice} coins</span>
      </div>
    </Link>
  );
}