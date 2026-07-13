import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Products from "./pages/Products.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Profile from "./pages/Profile.jsx";
import Checkout from "./pages/Checkout.jsx";
import Admin from "./pages/Admin.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuthStore } from "./store/useAuthStore.js";

// Map each route to its own background image.
// Anything not listed here falls back to DEFAULT_BG.
const DEFAULT_BG = "/images/home-bg.jpg";
const BACKGROUNDS = [
  { match: (path) => path === "/", src: "/images/home-bg.png" },
  { match: (path) => path.startsWith("/products/"), src: "/images/products-bg.jpg" }, // product detail
  { match: (path) => path === "/products", src: "/images/products-bg.png" },
  { match: (path) => path === "/profile", src: "/images/Profile-bg.png" },
  { match: (path) => path === "/checkout", src: "/images/checkout-bg.jpg" },
  { match: (path) => path === "/admin", src: "/images/admin-bg.png" },
  { match: (path) => path === "/login" || path === "/signup", src: "/images/auth-bg.png" },
];

function getBackground(pathname) {
  const hit = BACKGROUNDS.find((b) => b.match(pathname));
  return hit ? hit.src : DEFAULT_BG;
}

export default function App() {
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const location = useLocation();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const bgSrc = getBackground(location.pathname);

  return (
  <div className="min-h-screen flex flex-col relative">
    <img
      key={bgSrc}
      src={bgSrc}
      alt=""
      aria-hidden="true"
      className="fixed inset-0 w-full h-full object-cover -z-10 transition-opacity duration-300"
    />
    <Navbar />
    <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
      </Routes>
    </main>
    <Footer />
  </div>
);
}