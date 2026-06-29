export function ViewSwitcher({ disabled, view, setView }) {
  const options = [
    { id: "bouquet", label: "Bow", color: "#e519e5", labelWidth: "28px" },
    { id: "gallery", label: "Calendar", color: "#0ce5d7", labelWidth: "58px" }
  ];

  return (
    <nav
      className={[
        "view-switcher fixed right-4 top-4 z-20 flex h-auto items-start bg-transparent max-md:right-2.5",
        disabled ? "is-about-muted pointer-events-none" : ""
      ].join(" ")}
      aria-label="View switcher"
      aria-disabled={disabled}
    >
      <span className="view-switcher-bar" aria-hidden="true" />
      {options.map((option) => {
        const isActive = view === option.id;

        return (
          <div className="contents" key={option.id}>
            <button
              className={["view-switcher-item cursor-pointer border-0 bg-transparent", isActive ? "is-active" : ""].join(" ")}
              style={{ "--view-switcher-color": option.color, "--view-switcher-label-width": option.labelWidth }}
              type="button"
              disabled={disabled}
              aria-pressed={isActive}
              onClick={() => setView(option.id)}
            >
              <span className="view-switcher-dot" aria-hidden="true" />
              <span className="view-switcher-label">{option.label}</span>
            </button>
            <span className="view-switcher-bar" aria-hidden="true" />
          </div>
        );
      })}
    </nav>
  );
}
