export default function Logo({ size = "md" }) {
  const badge = size === "sm" ? "w-9 h-9 text-sm" : "w-11 h-11 text-base";
  const wordmark = size === "sm" ? "text-base" : "text-lg md:text-xl";

  return (
    <span className="inline-flex items-center gap-3">
      <span
        className={`${badge} shrink-0 rounded-full bg-gradient-to-b from-[#F2E2CF] to-[#EDC45A]
            flex items-center justify-center font-display font-extrabold text-[#ED802A]
            shadow-md`}
      >
        ZW
      </span>
      <span className={`font-display font-bold tracking-tight leading-tight flex flex-col ${wordmark}`}>
        <span className="text-[#F2E2CF]">ZEROTH</span>
        <span className="text-yellow">WONDER</span>
      </span>
    </span>
  );
}