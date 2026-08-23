import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore.js";
import Logo from "./Logo.jsx";
import MagicBackground from "./MagicBackground.jsx";

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
              <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <Link to="/">
              <Logo />
            </Link>
          </div>

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
                <Link to="/profile" className="px-4 py-2 rounded-full bg-ink/10 hover:bg-ink/20 transition">
                  {user.coinBalance} coins
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

          {/* Mobile: auth entry points AND log out always stay visible outside the burger */}
          <div className="flex md:hidden items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold">
            {user ? (
              <button
                onClick={handleLogout}
                className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full border border-cream/40"
              >
                Log out
              </button>
            ) : (
              <>
                <Link to="/login" className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full border border-cream/40">
                  Log in
                </Link>
                <Link to="/signup" className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-blue text-[#F2E2CF] font-bold">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div
        onClick={close}
        className={`fixed inset-0 bg-ink/50 z-40 transition-opacity md:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-orange text-cream z-50 shadow-2xl transform transition-transform duration-300 md:hidden overflow-hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <MagicBackground />

        <div className="relative z-10 flex items-center justify-between px-5 py-6 border-b border-cream/20">
          <Logo size="sm" />
          <button onClick={close} aria-label="Close menu" className="p-2 rounded-lg hover:bg-cream/15 transition">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="5" y1="5" x2="19" y2="19" />
              <line x1="19" y1="5" x2="5" y2="19" />
            </svg>
          </button>
        </div>

        <nav className="relative z-10 flex flex-col p-5 gap-1 text-base font-semibold">
          <Link to="/" onClick={close} className="px-4 py-3 rounded-xl hover:bg-cream/15 hover:scale-105 origin-left transition-all">
            Home
          </Link>
          <Link to="/products" onClick={close} className="px-4 py-3 rounded-xl hover:bg-cream/15 hover:scale-105 origin-left transition-all">
            Products
          </Link>
          {user?.isAdmin && (
            <Link to="/admin" onClick={close} className="px-4 py-3 rounded-xl hover:bg-cream/15 hover:scale-105 origin-left transition-all">
              Admin
            </Link>
          )}
          {user && (
            <Link to="/profile" onClick={close} className="px-4 py-3 rounded-xl hover:bg-cream/15 hover:scale-105 origin-left transition-all">
              Profile · {user.coinBalance} coins
            </Link>
          )}
        </nav>
      </aside>
    </>
  );
}