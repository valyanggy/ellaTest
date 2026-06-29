export function EmptyFilterState({ activeCategory }) {
  return (
    <section className="fixed inset-0 grid place-content-center px-6 text-center" aria-live="polite">
      <p>
        No projects tagged <strong>{activeCategory}</strong> yet.
      </p>
    </section>
  );
}
