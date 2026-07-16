// Purely decorative — cartoonish "magic wisp" blobs + twinkling sparkle stars,
// built from CSS/SVG only (no image assets), themed off the site palette.
const SPARKLES = [
  { top: "12%", left: "6%",  size: 10, delay: "0s",    color: "#F2E2CF" },
  { top: "68%", left: "14%", size: 7,  delay: "0.6s",  color: "#EDC45A" },
  { top: "30%", left: "22%", size: 5,  delay: "1.4s",  color: "#65BCB5" },
  { top: "80%", left: "32%", size: 8,  delay: "0.3s",  color: "#F2E2CF" },
  { top: "18%", left: "42%", size: 6,  delay: "1.8s",  color: "#EDC45A" },
  { top: "55%", left: "52%", size: 9,  delay: "0.9s",  color: "#F2E2CF" },
  { top: "10%", left: "62%", size: 5,  delay: "2.2s",  color: "#65BCB5" },
  { top: "75%", left: "70%", size: 7,  delay: "1.1s",  color: "#EDC45A" },
  { top: "35%", left: "80%", size: 10, delay: "0.4s",  color: "#F2E2CF" },
  { top: "62%", left: "90%", size: 6,  delay: "1.6s",  color: "#65BCB5" },
  { top: "88%", left: "50%", size: 5,  delay: "2.5s",  color: "#EDC45A" },
  { top: "22%", left: "92%", size: 7,  delay: "0.7s",  color: "#F2E2CF" },
];

function Sparkle({ top, left, size, delay, color }) {
  return (
    <svg
      viewBox="0 0 24 24"
      style={{
        position: "absolute",
        top,
        left,
        width: size,
        height: size,
        animation: `sparkle-twinkle 3.4s ease-in-out ${delay} infinite`,
      }}
    >
      <path
        d="M12 0 C12 6 14 10 20 12 C14 14 12 18 12 24 C12 18 10 14 4 12 C10 10 12 6 12 0 Z"
        fill={color}
      />
    </svg>
  );
}

export default function MagicBackground() {
  return (
    <div className="magic-bg absolute inset-0 overflow-hidden pointer-events-none">
      {/* Mystical wisps */}
      <div
        className="absolute -top-16 -left-10 w-56 h-56 rounded-full blur-2xl opacity-30"
        style={{
          background: "radial-gradient(circle, #EDC45A 0%, transparent 70%)",
          animation: "wisp-swirl 18s linear infinite",
        }}
      />
      <div
        className="absolute -bottom-20 right-0 w-64 h-64 rounded-full blur-2xl opacity-25"
        style={{
          background: "radial-gradient(circle, #65BCB5 0%, transparent 70%)",
          animation: "wisp-swirl-reverse 22s linear infinite",
        }}
      />
      <div
        className="absolute top-1/3 left-1/2 w-40 h-40 rounded-full blur-2xl opacity-20"
        style={{
          background: "radial-gradient(circle, #F2E2CF 0%, transparent 70%)",
          animation: "wisp-swirl 26s linear infinite",
        }}
      />

      {/* Twinkling sparkles */}
      {SPARKLES.map((s, i) => (
        <Sparkle key={i} {...s} />
      ))}
    </div>
  );
}