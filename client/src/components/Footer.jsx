import { Link } from "react-router-dom";
import Logo from "./Logo.jsx";

export default function Footer() {
  return (
    <footer className="bg-ink/70 backdrop-blur-md text-cream mt-12">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-1 sm:col-span-2 md:col-span-1">
          <div className="mb-3"><Logo size="sm" dark /></div>
          <p className="text-sm text-cream/70 leading-relaxed">
            Trade engagement for one-of-a-kind, AI-made things about you.
            Every product on this site is generated just for you, from your own prompt.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-yellow mb-3">Explore</h4>
          <ul className="space-y-2 text-sm text-cream/70">
            <li><Link to="/" className="hover:text-cream transition">Home</Link></li>
            <li><Link to="/products" className="hover:text-cream transition">Products</Link></li>
            <li><Link to="/signup" className="hover:text-cream transition">Sign up</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-yellow mb-3">Site</h4>
          <ul className="space-y-2 text-sm text-cream/70">
            <li><a href="/#rules" className="hover:text-cream transition">Rules & Regulations</a></li>
            <li><a href="/#privacy" className="hover:text-cream transition">Privacy</a></li>
            <li><a href="/#" className="hover:text-cream transition">Content Policy</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-yellow mb-3">Contact</h4>
          <ul className="space-y-2 text-sm text-cream/70">
            <li>hello@zerothwonder.app</li>
            <li className="flex gap-3 pt-1">
              <a href="#" aria-label="Twitter / X" className="hover:text-orange transition">Twitter/X</a>
              <a href="#" aria-label="Instagram" className="hover:text-orange transition">Instagram</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/15">
        <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-cream/50">
          <span>© {new Date().getFullYear()} Zeroth Wonder. Coins have no cash value.</span>
          <span>All downloads carry a Zeroth Wonder watermark.</span>
        </div>
      </div>
    </footer>
  );
}