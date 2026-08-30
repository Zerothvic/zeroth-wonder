import { Link } from "react-router-dom";

const DICE_PATTERNS = {
  1: [4],
  2: [2, 6],
  3: [2, 4, 6],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function DiePips({ n }) {
  const active = DICE_PATTERNS[n] || [];
  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-1 w-10 h-10">
      {Array.from({ length: 9 }).map((_, i) => (
        <span
          key={i}
          className={`rounded-full ${
            active.includes(i) ? "bg-orange shadow-[0_0_6px_rgba(237,128,42,0.7)]" : ""
          }`}
        />
      ))}
    </div>
  );
}

function getFaces(front) {
  const back = 7 - front;
  const remaining = [1, 2, 3, 4, 5, 6].filter((n) => n !== front && n !== back);
  const [top, right, bottom, left] = remaining;
  return { front, back, top, right, bottom, left };
}

function DiceCube({ front, size = 96, duration = 9 }) {
  const half = size / 2;
  const faces = getFaces(front);
  const transforms = {
    front: `translateZ(${half}px)`,
    back: `rotateY(180deg) translateZ(${half}px)`,
    right: `rotateY(90deg) translateZ(${half}px)`,
    left: `rotateY(-90deg) translateZ(${half}px)`,
    top: `rotateX(90deg) translateZ(${half}px)`,
    bottom: `rotateX(-90deg) translateZ(${half}px)`,
  };

  return (
    <div style={{ width: size, height: size, perspective: 700 }} className="mx-auto">
      <div
        className="relative w-full h-full"
        style={{
          transformStyle: "preserve-3d",
          animation: `cube-tumble ${duration}s linear infinite`,
        }}
      >
        {Object.entries(transforms).map(([faceName, transform]) => (
          <div
            key={faceName}
            className="absolute inset-0 rounded-xl border border-yellow/50 bg-white/5 backdrop-blur-md flex items-center justify-center"
            style={{ transform }}
          >
            <DiePips n={faces[faceName]} />
          </div>
        ))}
      </div>
    </div>
  );
}

const STEPS = ["", "", "", ""];

export default function Home() {
  return (
    <div className="space-y-16">
      <section className="text-center py-10 px-4 sm:px-2 flex flex-col items-center">
        {/* Banner Section */}
        <div className="relative inline-flex flex-col items-center justify-center px-8 sm:px-20 py-12 sm:py-16 max-w-[96vw] mb-12">
          
          {/* Synchronized Paint Canvas Mask (Sweeps in from Left-to-Right) */}
          <div
            className="absolute -inset-x-8 -inset-y-10 sm:-inset-x-20 sm:-inset-y-16 -z-10 pointer-events-none select-none drop-shadow-md"
            style={{
              animation: "paint-reveal-sweep 30s cubic-bezier(0.2, 0, 0.4, 1) infinite",
            }}
          >
            <svg
              className="w-full h-full"
              viewBox="0 0 1000 500"
              preserveAspectRatio="none"
            >
              <defs>
                <filter id="distressedBrush" x="-10%" y="-10%" width="120%" height="120%">
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.07 0.012"
                    numOctaves="5"
                    result="noise"
                  />
                  <feDisplacementMap
                    in="SourceGraphic"
                    in2="noise"
                    scale="32"
                    xChannelSelector="R"
                    yChannelSelector="G"
                    result="textured"
                  />
                </filter>

                <filter id="fineBristles" x="-10%" y="-10%" width="120%" height="120%">
                  <feTurbulence
                    type="turbulence"
                    baseFrequency="0.22 0.018"
                    numOctaves="4"
                    result="bristles"
                  />
                  <feDisplacementMap
                    in="SourceGraphic"
                    in2="bristles"
                    scale="20"
                    xChannelSelector="R"
                    yChannelSelector="G"
                  />
                </filter>
              </defs>

              {/* Background Splatters */}
              <g fill="#FFFFFF" opacity="0.65">
                <circle cx="70" cy="340" r="4" />
                <circle cx="100" cy="380" r="2.5" />
                <circle cx="120" cy="360" r="5" />
                <circle cx="140" cy="410" r="2" />
                <circle cx="170" cy="390" r="3.5" />
                <circle cx="210" cy="405" r="3" />
                <circle cx="250" cy="425" r="4.5" />
                <circle cx="290" cy="395" r="2.5" />
                <circle cx="350" cy="410" r="3.5" />
                <circle cx="430" cy="420" r="2.5" />

                <circle cx="810" cy="70" r="3.5" />
                <circle cx="840" cy="110" r="4.5" />
                <circle cx="880" cy="90" r="2.5" />
                <circle cx="910" cy="130" r="3.5" />
                <circle cx="950" cy="110" r="3" />
              </g>

              {/* Layer 1: Bristle Feathering */}
              <g filter="url(#fineBristles)" opacity="0.75" fill="#FFFFFF">
                <path d="M 10,15 L 340,130 L 760,150 L 990,170 L 980,440 L 680,410 L 280,330 L 5,190 Z" />
              </g>

              {/* Layer 2: Main Heavy Textured Sweep Body */}
              <g filter="url(#distressedBrush)" fill="#FFFFFF">
                <path d="M 25,40 C 220,130 440,160 965,195 C 980,360 840,425 640,395 C 430,370 190,310 35,275 C 5,200 10,90 25,40 Z" />
                <path d="M 80,75 C 340,140 600,160 925,210 C 950,395 770,430 550,380 C 290,330 120,275 60,200 Z" />
              </g>

              {/* Layer 3: Dry Streak Lines */}
              <g stroke="#FFFFFF" strokeLinecap="round" opacity="0.95">
                <path d="M 5,20 L 350,145" strokeWidth="22" filter="url(#fineBristles)" />
                <path d="M 50,60 L 430,170" strokeWidth="18" filter="url(#fineBristles)" />
                <path d="M 100,95 L 500,190" strokeWidth="14" filter="url(#fineBristles)" />

                <path d="M 540,170 L 985,215" strokeWidth="26" filter="url(#fineBristles)" />
                <path d="M 600,205 L 990,280" strokeWidth="20" filter="url(#fineBristles)" />
                <path d="M 670,255 L 970,355" strokeWidth="16" filter="url(#fineBristles)" />
                <path d="M 720,310 L 940,435" strokeWidth="12" filter="url(#fineBristles)" />
              </g>
            </svg>
          </div>

          {/* Title */}
          <h1
            className="relative font-magic font-black uppercase whitespace-nowrap mb-1 select-none"
            style={{
              fontSize: "clamp(1.75rem, 8vw, 4.5rem)",
              letterSpacing: "0.05em",
            }}
          >
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #2B2118, #ED802A, #65BCB5, #ED802A, #2B2118)",
                backgroundSize: "300% auto",
                animation: "text-shimmer 10s linear infinite",
                filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.12))",
              }}
            >
              ZEROTH WONDER
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="font-elongated italic whitespace-nowrap mb-0 select-none"
            style={{ fontSize: "clamp(1rem, 3.5vw, 2.25rem)", letterSpacing: "0.03em" }}
          >
            <span
              className="bg-clip-text text-transparent font-bold"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #2B2118, #ED802A, #65BCB5, #2B2118)",
                backgroundSize: "300% auto",
                animation: "text-shimmer 10s linear infinite",
              }}
            >
              wonderland......for adults!
            </span>
          </p>
        </div>

        <Link
          to="/products"
          className="bg-blue text-white px-8 py-3 rounded-full font-semibold hover:opacity-90 transition shadow-md"
        >
          Explore
        </Link>
      </section>

      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6 md:gap-8">
          {STEPS.map((step, i) => (
            <div
              key={i}
              style={{ animation: `dice-roll-in 0.6s ease-out ${i * 120}ms both` }}
              className={`flex-col items-center gap-3 md:gap-4 ${
                i < 2 ? "flex" : "hidden md:flex"
              }`}
            >
              <div className="block md:hidden">
                <DiceCube front={i + 1} size={110} duration={8 + i} />
              </div>
              <div className="hidden md:block">
                <DiceCube front={i + 1} size={96} duration={8 + i} />
              </div>
              <div className="font-semibold text-center text-white text-sm md:text-base drop-shadow">
                {step}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="wonder-focus-row">
        <section className="wonder-panel bg-gradient-to-br from-orange to-blue rounded-2xl p-8 md:p-10 shadow-md text-center">
          <h2 className="text-2xl font-bold text-white mb-4 drop-shadow-sm">Welcome to Zeroth Wonder</h2>
          <p className="text-white/95 max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
            Trade your engagements for one-of-a-kind, AI-made things about you: a comic book, a peek at your fortune,
            a theme song for your exciting life, a mini-documentary starring YOU, even a chat with your past or future self. No payment, no
            subscription — just engage, earn coins, unlock your FREE gifts, and voila! It's yours!
          </p>
        </section>

        <section id="rules" className="wonder-panel bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-orange mb-4">Terms & Conditions</h2>
          <ul className="list-disc list-inside space-y-2 text-ink/80 text-sm">
            <li>One account per person. Multi-accounting to farm coins will be suspended.</li>
            <li>Every product is AI-generated from your prompt — outputs vary and are not guaranteed to match expectations exactly.</li>
            <li>Engagements include signing up, comments, sharing, and liking.</li>
            <li>Prompts may not target real private individuals without consent, and must follow our content policy.</li>
            <li>All downloads carry a Zeroth Wonder watermark or shout-out.</li>
            <li>Coins have no cash value and cannot be transferred or resold.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}