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

// Real dice rule: opposite faces always sum to 7.
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

const STEPS = ["Seeing yourself in a comic book, because why not for a superhero like you?", 
                "Getting a glimpse into your future. We know you're nosy", 
                "Your life gets a theme song..haha", 
                "A personalised Netflix (and chill) documentary. Starring: You, etc"];

export default function Home() {
  return (
    <div className="space-y-16">
      <section className="text-center py-12">
        <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-md">ZEROTH WONDER</h1>
        <p className="text-lg text-white max-w-xl mx-auto mb-8 drop-shadow-sm">
          Welcome to wonderland.....for adults!
        </p>
        <Link to="/products" className="bg-blue text-white px-8 py-3 rounded-full font-semibold hover:opacity-90">
          Explore
        </Link>
      </section>

      <section>
        <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-white mb-8 drop-shadow-sm">
          Special attractions include:
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STEPS.map((step, i) => (
            <div
              key={step}
              style={{ animation: `dice-roll-in 0.6s ease-out ${i * 120}ms both` }}
              className="flex flex-col items-center gap-4"
            >
              <DiceCube front={i + 1} duration={8 + i} />
              <div className="font-semibold text-center text-white text-sm md:text-base drop-shadow">
                {step}
              </div>
            </div>
          ))}
        </div>
      </section>

      

      <section id="rules" className="bg-white rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-orange mb-4">Terms & Conditions</h2>
        <ul className="list-disc list-inside space-y-2 text-ink/80 text-sm">
          <li>One account per person. Multi-accounting to farm coins will be suspended.</li>
          <li>Every product is AI-generated from your prompt — outputs vary and are not guaranteed to match expectations exactly.</li>
          <li>Prompts may not target real private individuals without consent, and must follow our content policy.</li>
          <li>All downloads carry a Zeroth Wonder watermark or shout-out.</li>
          <li>Coins have no cash value and cannot be transferred or resold.</li>
        </ul>
      </section>
    </div>
  );
}