import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore.js";
import Logo from "./Logo.jsx";
import MagicBackground from "./MagicBackground.jsx";

function SocialIcons() {
  return (
    <div className="flex items-center gap-3">
      {/* Facebook */}
      <a
        href="https://facebook.com"
        target="_blank"
        rel="noreferrer"
        aria-label="Facebook"
        className="w-9 h-9 rounded-full bg-cream/20 text-cream hover:bg-cream hover:text-orange flex items-center justify-center transition shadow-sm"
      >
        <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </a>

      {/* X / Twitter */}
      <a
        href="https://x.com"
        target="_blank"
        rel="noreferrer"
        aria-label="X (formerly Twitter)"
        className="w-9 h-9 rounded-full bg-cream/20 text-cream hover:bg-cream hover:text-orange flex items-center justify-center transition shadow-sm"
      >
        <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>

      {/* LinkedIn */}
      <a
        href="https://linkedin.com"
        target="_blank"
        rel="noreferrer"
        aria-label="LinkedIn"
        className="w-9 h-9 rounded-full bg-cream/20 text-cream hover:bg-cream hover:text-orange flex items-center justify-center transition shadow-sm"
      >
        <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      </a>

      {/* Instagram */}
      <a
        href="https://instagram.com"
        target="_blank"
        rel="noreferrer"
        aria-label="Instagram"
        className="w-9 h-9 rounded-full bg-cream/20 text-cream hover:bg-cream hover:text-orange flex items-center justify-center transition shadow-sm"
      >
        <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      </a>

      {/* Email */}
      <a
        href="mailto:hello@zerothwonder.app"
        aria-label="Email"
        className="w-9 h-9 rounded-full bg-cream/20 text-cream hover:bg-cream hover:text-orange flex items-center justify-center transition shadow-sm"
      >
        <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
        </svg>
      </a>
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const close = () => setOpen(false);

  const handleLogout = async () => {
    await logout();
    close();
    navigate("/");
  };

  return (
    <>
      <header className="bg-orange/70 backdrop-blur-md text-cream shadow-md relative z-30 overflow-hidden">
        <MagicBackground />
        <div className="max-w-6xl mx-auto px-3 py-3 sm:px-4 sm:py-5 md:py-7 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="md:hidden p-2 -ml-2 rounded-lg hover:bg-cream/15 transition"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <Link to="/">
              <Logo />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2 text-sm font-semibold">
            <Link to="/" className="px-4 py-2 rounded-full hover:bg-cream/15 transition">
              Home
            </Link>
            <Link to="/products" className="px-4 py-2 rounded-full hover:bg-cream/15 transition">
              Products
            </Link>
            {user?.isAdmin && (
              <Link to="/admin" className="px-4 py-2 rounded-full hover:bg-cream/15 transition">
                Admin
              </Link>
            )}
            {user ? (
              <>
                <Link to="/profile" className="px-4 py-2 rounded-full bg-ink/10 hover:bg-ink/20 transition flex items-center gap-2">
                  <img
                    src={
                      user.avatarUrl ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.username || "zeroth")}`
                    }
                    alt={user.username}
                    className="w-6 h-6 rounded-full object-cover border border-cream/50 bg-cream/30"
                  />
                  <span>{user.coinBalance} coins</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-full border border-cream/40 hover:bg-cream/15 transition"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 rounded-full border border-cream/40 hover:bg-cream/15 transition">
                  Log in
                </Link>
                <Link to="/signup" className="px-5 py-2 rounded-full bg-blue text-[#F2E2CF] font-bold hover:opacity-90 transition shadow-sm">
                  Sign up
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Profile Avatar / Login Icon Target */}
          <div className="flex md:hidden items-center">
            {user ? (
              <Link to="/profile" aria-label="Your Profile" className="relative block group">
                <img
                  src={
                    user.avatarUrl ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.username || "zeroth")}`
                  }
                  alt={user.username}
                  className="w-9 h-9 rounded-full object-cover border-2 border-cream/80 bg-cream/30 shadow-sm group-hover:scale-105 transition"
                />
              </Link>
            ) : (
              <Link
                to="/login"
                aria-label="Log in"
                className="w-9 h-9 rounded-full bg-cream/20 flex items-center justify-center text-cream border border-cream/30 hover:bg-cream/30 transition"
              >
                <svg className="w-5 h-5 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Backdrop */}
      <div
        onClick={close}
        className={`fixed inset-0 bg-ink/50 z-40 transition-opacity md:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Burger Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-orange text-cream z-50 shadow-2xl transform transition-transform duration-300 md:hidden flex flex-col justify-between overflow-y-auto ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <MagicBackground />

        <div className="relative z-10">
          <div className="flex items-center justify-between px-5 py-6 border-b border-cream/20">
            <Logo size="sm" />
            <button onClick={close} aria-label="Close menu" className="p-2 rounded-lg hover:bg-cream/15 transition">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="5" y1="5" x2="19" y2="19" />
                <line x1="19" y1="5" x2="5" y2="19" />
              </svg>
            </button>
          </div>

          <nav className="flex flex-col p-5 gap-1 text-base font-semibold">
            <Link to="/" onClick={close} className="px-4 py-3 rounded-xl hover:bg-cream/15 transition-all">
              Home
            </Link>
            <Link to="/products" onClick={close} className="px-4 py-3 rounded-xl hover:bg-cream/15 transition-all">
              Products
            </Link>
            {user?.isAdmin && (
              <Link to="/admin" onClick={close} className="px-4 py-3 rounded-xl hover:bg-cream/15 transition-all">
                Admin
              </Link>
            )}
            {user && (
              <Link to="/profile" onClick={close} className="px-4 py-3 rounded-xl hover:bg-cream/15 transition-all flex items-center justify-between">
                <span>Profile</span>
                <span className="text-xs bg-ink/20 px-2.5 py-1 rounded-full font-bold">{user.coinBalance} coins</span>
              </Link>
            )}

            {/* Mobile Auth Action Buttons */}
            <div className="pt-4 mt-2 border-t border-cream/20 flex flex-col gap-2.5">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full text-center py-2.5 rounded-full border border-cream/40 font-semibold hover:bg-cream/15 transition text-sm"
                >
                  Log out
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={close}
                    className="w-full text-center py-2.5 rounded-full border border-cream/40 font-semibold hover:bg-cream/15 transition text-sm"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={close}
                    className="w-full text-center py-2.5 rounded-full bg-blue text-[#F2E2CF] font-bold hover:opacity-90 transition text-sm shadow-sm"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>

        {/* Social Media Contact Channels */}
        <div className="relative z-10 px-6 py-6 border-t border-cream/20 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-yellow">Contact & Channels</p>
          <SocialIcons />
        </div>
      </aside>
    </>
  );
}