import { useEffect, useState, useRef } from "react";

export default function MagicWand() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [sparkles, setSparkles] = useState([]);
  const [stardust, setStardust] = useState([]);

  const sparkleIdRef = useRef(0);
  const lastPosRef = useRef({ x: -100, y: -100, time: Date.now() });

  useEffect(() => {
    const updatePosition = (clientX, clientY) => {
      const now = Date.now();
      const dt = Math.max(1, now - lastPosRef.current.time);
      const vx = (clientX - lastPosRef.current.x) / dt;
      const vy = (clientY - lastPosRef.current.y) / dt;

      lastPosRef.current = { x: clientX, y: clientY, time: now };
      setPos({ x: clientX, y: clientY });
      setVelocity({ x: vx, y: vy });
      setVisible(true);

      // Celestial dust trail
      if (Math.random() < 0.45) {
        const id = sparkleIdRef.current++;
        const newDust = {
          id,
          x: clientX,
          y: clientY,
          size: Math.random() * 3 + 1,
          color: ["#65BCB5", "#EDC45A", "#F2E2CF", "#E9CEAF"][Math.floor(Math.random() * 4)],
          dx: (Math.random() - 0.5) * 12 - vx * 2.5,
          dy: (Math.random() - 0.5) * 12 - vy * 2.5,
        };
        setStardust((prev) => [...prev.slice(-15), newDust]);

        setTimeout(() => {
          setStardust((prev) => prev.filter((d) => d.id !== id));
        }, 500);
      }
    };

    const triggerBurst = (clientX, clientY, target) => {
      const isClickable = target?.closest?.(
        "button, a, input, select, textarea, [role='button'], .clickable, label"
      );

      setIsCasting(true);
      setTimeout(() => setIsCasting(false), 240);

      const count = isClickable ? 12 : 6;
      const newSparkles = Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        const speed = isClickable ? Math.random() * 70 + 35 : Math.random() * 35 + 15;
        return {
          id: sparkleIdRef.current++,
          x: clientX,
          y: clientY,
          dx: Math.cos(angle) * speed,
          dy: Math.sin(angle) * speed,
          color: ["#65BCB5", "#EDC45A", "#F2E2CF", "#E9CEAF", "#FFFFFF"][
            Math.floor(Math.random() * 5)
          ],
          size: Math.random() * 4 + 2,
        };
      });

      setSparkles((prev) => [...prev, ...newSparkles]);
      setTimeout(() => {
        setSparkles((prev) => prev.filter((s) => !newSparkles.some((ns) => ns.id === s.id)));
      }, 600);
    };

    // Desktop pointer handlers
    const handlePointerMove = (e) => {
      if (e.pointerType === "touch") return; // Let touch events handle mobile
      updatePosition(e.clientX, e.clientY);
    };

    const handlePointerDown = (e) => {
      if (e.pointerType === "touch") return;
      triggerBurst(e.clientX, e.clientY, e.target);
    };

    const handlePointerLeave = () => setVisible(false);

    // Mobile touch handlers
    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      if (!touch) return;
      updatePosition(touch.clientX, touch.clientY);
      triggerBurst(touch.clientX, touch.clientY, e.target);
    };

    const handleTouchMove = (e) => {
      const touch = e.touches[0];
      if (!touch) return;
      updatePosition(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = () => {
      // Fade out wand shortly after finger lifts off screen
      setTimeout(() => setVisible(false), 800);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown);
    document.body.addEventListener("pointerleave", handlePointerLeave);

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      document.body.removeEventListener("pointerleave", handlePointerLeave);

      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, []);

  if (!visible) return null;

  const tilt = Math.max(-18, Math.min(18, velocity.x * 8));

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* Floating Stardust Particles */}
      {stardust.map((d) => (
        <span
          key={d.id}
          className="fixed rounded-full pointer-events-none transition-all duration-500 ease-out"
          style={{
            left: `${d.x}px`,
            top: `${d.y}px`,
            width: `${d.size}px`,
            height: `${d.size}px`,
            backgroundColor: d.color,
            boxShadow: `0 0 5px ${d.color}`,
            transform: `translate(${d.dx}px, ${d.dy}px) scale(0)`,
            opacity: 0.9,
          }}
        />
      ))}

      {/* Wand Assembly */}
      <div
        className="fixed top-0 left-0 transition-transform duration-75 ease-out will-change-transform"
        style={{
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0px)`,
        }}
      >
        <div
          className={`relative origin-top-left transition-transform duration-180 ${
            isCasting ? "scale-110 -rotate-6" : ""
          }`}
          style={{
            transform: `rotate(${tilt}deg)`,
            filter: "drop-shadow(0 6px 12px rgba(43, 33, 24, 0.35))",
          }}
        >
          {/* Soft Ethereal Glow */}
          <div
            className={`absolute -top-4 -left-4 w-8 h-8 rounded-full bg-gradient-to-tr from-teal-300 via-yellow-200 to-cream blur-sm transition-all duration-300 ${
              isCasting ? "scale-140 opacity-100" : "scale-100 opacity-60 animate-pulse"
            }`}
          />

          {/* 5-Point Star Head */}
          <div className="absolute -top-3 -left-3 w-6 h-6 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              className={`w-5 h-5 drop-shadow-[0_0_6px_#EDC45A] transition-transform duration-300 ${
                isCasting ? "scale-125 rotate-45" : "scale-100 rotate-0"
              }`}
            >
              <defs>
                <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="45%" stopColor="#EDC45A" />
                  <stop offset="100%" stopColor="#65BCB5" />
                </linearGradient>
              </defs>
              <polygon
                points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                fill="url(#starGrad)"
                stroke="#F2E2CF"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Compact Wand Shaft & Handle Structure */}
          <div
            className="relative flex flex-col items-center"
            style={{
              marginLeft: "-1.5px",
              marginTop: "2px",
              transform: "rotate(-32deg)",
              transformOrigin: "top center",
            }}
          >
            {/* Slender Upper Stem */}
            <div
              className="w-1 h-10 rounded-t-full relative backdrop-blur-sm"
              style={{
                background: "linear-gradient(180deg, #FFFFFF 0%, #F2E2CF 30%, #65BCB5 80%, #EDC45A 100%)",
                boxShadow: "inset 0.5px 0.5px 1px rgba(255,255,255,0.9), inset -0.5px -0.5px 1px rgba(43,33,24,0.3)",
              }}
            >
              <div className="absolute top-2.5 left-0 right-0 h-0.5 bg-white/90 rounded-full" />
              <div className="absolute top-6 left-0 right-0 h-0.5 bg-[#EDC45A]/90 rounded-full" />
            </div>

            {/* Transition Collar */}
            <div
              className="w-2.5 h-1.5 rounded-full relative z-10 -my-0.5"
              style={{
                background: "linear-gradient(135deg, #F2E2CF 0%, #EDC45A 60%, #ED802A 100%)",
                boxShadow: "0 1px 2px rgba(0,0,0,0.25), inset 0.5px 0.5px 0.5px rgba(255,255,255,0.8)",
              }}
            />

            {/* Handle Section */}
            <div
              className="w-2 h-9 rounded-b-md relative overflow-hidden flex flex-col justify-evenly py-0.5 items-center"
              style={{
                background: "linear-gradient(180deg, #2B2118 0%, #4A3B30 40%, #2B2118 100%)",
                boxShadow: "inset 0.5px 0.5px 1px rgba(255,255,255,0.2), inset -0.5px -0.5px 1px rgba(0,0,0,0.8)",
              }}
            >
              <div className="w-1.5 h-[1px] bg-[#EDC45A]/80 rounded-full shadow-sm" />
              <div className="w-1.5 h-[1px] bg-[#65BCB5]/80 rounded-full shadow-sm" />
              <div className="w-1.5 h-[1px] bg-[#F2E2CF]/80 rounded-full shadow-sm" />
            </div>

            {/* Pommel Tip */}
            <div
              className="w-1.5 h-1.5 -mt-0.5 rounded-full border border-[#EDC45A]/70"
              style={{
                background: "radial-gradient(circle at 35% 35%, #F2E2CF 0%, #65BCB5 50%, #2B2118 100%)",
                boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Click Sparkles */}
      {sparkles.map((s) => (
        <span
          key={s.id}
          className="fixed rounded-full pointer-events-none transition-all duration-500 ease-out"
          style={{
            left: `${s.x}px`,
            top: `${s.y}px`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            backgroundColor: s.color,
            boxShadow: `0 0 8px ${s.color}`,
            transform: `translate(${s.dx}px, ${s.dy}px) scale(0)`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}