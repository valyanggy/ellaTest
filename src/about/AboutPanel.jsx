export function AboutPanel({ aboutOpen, disabled = false, onToggle }) {
  return (
    <section className={["fixed left-4 top-4 z-20 max-md:left-2.5", disabled ? "is-about-muted pointer-events-none" : ""].join(" ")}>
      <button
        className="about-wordmark h-auto min-w-36 cursor-pointer border-0 bg-transparent px-0 text-left font-normal leading-none text-black max-md:min-w-0 max-md:px-2"
        type="button"
        aria-expanded={aboutOpen}
        disabled={disabled}
        onClick={onToggle}
      >
        <span aria-hidden="true" className={aboutOpen ? "pr-1 text-[#e519e5]" : "hidden"}>
          *
        </span>
        Ella Varr Burgess
      </button>
    </section>
  );
}
