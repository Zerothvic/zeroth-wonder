export default function Logo({ size = "md" }) {
  const badge = size === "sm" ? "w-8 h-8 text-xs" : "w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 text-xs sm:text-sm md:text-base";
  const wordmark = size === "sm" ? "text-sm" : "text-sm sm:text-base md:text-lg lg:text-xl";

  return (
    <span className="inline-flex items-center gap-2 sm:gap-3">
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