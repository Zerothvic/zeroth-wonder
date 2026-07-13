import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import ProductCard from "../components/ProductCard.jsx";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api.get("/products").then(({ data }) => setProducts(data));
  }, []);

  const visible = filter === "unlocked" ? products.filter((p) => p.unlocked) : products;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-orange">Products</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-blue rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All products</option>
          <option value="unlocked">Available to me now</option>
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {visible.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  );
}