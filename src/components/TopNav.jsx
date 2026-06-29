import { useState } from "react";
import { CATEGORIES, CATEGORY_COLORS } from "../config/site";

export function TopNav({ activeCategory, disabled, onCategory }) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const handleCategoryClick = (category) => {
    onCategory(category);
    setFiltersOpen(false);
  };

  return (
    <nav
      className={[
        "filter-nav fixed left-1/2 top-4 z-50 w-[calc(100vw-180px)] max-w-[600px] -translate-x-1/2 font-kode text-[10px] font-normal max-md:top-14 max-md:w-[calc(100vw-20px)] max-md:max-w-[360px]",
        filtersOpen ? "is-open" : "",
        disabled ? "is-about-muted pointer-events-none" : ""
      ].join(" ")}
      aria-label="Project categories"
      aria-disabled={disabled}
    >
      <button
        className="filter-toggle cursor-pointer border-0 bg-transparent text-black"
        type="button"
        disabled={disabled}
        aria-expanded={filtersOpen}
        onClick={() => setFiltersOpen((open) => !open)}
      >
        Filter ({filtersOpen ? "-" : "+"})
      </button>
      <div className="filter-list">
        {activeCategory && (
          <button
            key="all"
            style={{ "--filter-color": "#000" }}
            className="filter-item filter-item-all cursor-pointer border-0 text-black transition"
            type="button"
            disabled={disabled}
            aria-label="Show all projects"
            onClick={() => handleCategoryClick(null)}
          >
            <span className="filter-item-dot" aria-hidden="true" />
            <span className="filter-item-label">All</span>
          </button>
        )}
        {CATEGORIES.map((category) => (
        <button
          key={category}
          style={{ "--filter-color": CATEGORY_COLORS[category] }}
          className={[
            "filter-item cursor-pointer border-0 text-black transition",
            activeCategory === category ? "is-active" : ""
          ].join(" ")}
          type="button"
          disabled={disabled}
          aria-pressed={activeCategory === category}
          onClick={() => handleCategoryClick(category)}
        >
          <span className="filter-item-dot" aria-hidden="true" />
          <span className="filter-item-label">{category}</span>
        </button>
        ))}
      </div>
    </nav>
  );
}
