import { useEffect, useMemo } from "react";
import { CalendarCursorTrail } from "./CalendarCursorTrail";

function getGalleryItems(projects, { reverseOrder = false } = {}) {
  return projects
    .flatMap((project, projectIndex) =>
      project.media.map((media, mediaItemIndex) => ({
        id: `${project.id}-${media.imageUrl || media.url}-${mediaItemIndex}`,
        image: media,
        imageIndex: mediaItemIndex,
        mediaIndex: media.globalIndex || mediaItemIndex + 1,
        project,
        projectIndex
      }))
    )
    .sort((a, b) => (reverseOrder ? b.mediaIndex - a.mediaIndex : a.mediaIndex - b.mediaIndex));
}

function getCalendarYears(items) {
  const years = new Map();

  items.forEach((item) => {
    const year = item.project.year || "Undated";

    if (!years.has(year)) {
      years.set(year, []);
    }

    years.get(year).push(item);
  });

  return [...years.entries()]
    .map(([year, yearItems]) => ({ year, items: yearItems }))
    .sort((a, b) => {
      const aYear = Number.parseInt(a.year, 10);
      const bYear = Number.parseInt(b.year, 10);

      if (Number.isNaN(aYear) && Number.isNaN(bYear)) {
        return String(a.year).localeCompare(String(b.year));
      }

      if (Number.isNaN(aYear)) {
        return 1;
      }

      if (Number.isNaN(bYear)) {
        return -1;
      }

      return bYear - aYear;
    });
}

function getVimeoEmbedUrl(url) {
  const match = url?.match(/vimeo\.com\/(?:video\/)?(\d+)/);

  if (!match) {
    return url;
  }

  return `https://player.vimeo.com/video/${match[1]}`;
}

export function GalleryView({ activeCategory, allProjects, projects, selected, onSelect, onSelectProject }) {
  const galleryItems = useMemo(() => getGalleryItems(projects, { reverseOrder: true }), [projects]);
  const viewerItems = useMemo(() => getGalleryItems(allProjects, { reverseOrder: true }), [allProjects]);
  const calendarSections = useMemo(
    () => (activeCategory ? [{ year: activeCategory, items: galleryItems }] : getCalendarYears(galleryItems)),
    [activeCategory, galleryItems]
  );
  const selectedIndex = selected
    ? viewerItems.findIndex((item) => item.project.id === selected.projectId && item.imageIndex === selected.imageIndex)
    : -1;
  const selectedItem = selectedIndex >= 0 ? viewerItems[selectedIndex] : null;
  const showPrevious = () => {
    if (!selectedItem || viewerItems.length === 0) {
      return;
    }

    const previousItem = viewerItems[(selectedIndex - 1 + viewerItems.length) % viewerItems.length];
    onSelectProject(previousItem.project.id, previousItem.imageIndex);
  };
  const showNext = () => {
    if (!selectedItem || viewerItems.length === 0) {
      return;
    }

    const nextItem = viewerItems[(selectedIndex + 1) % viewerItems.length];
    onSelectProject(nextItem.project.id, nextItem.imageIndex);
  };

  useEffect(() => {
    if (!selectedItem) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPrevious();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        showNext();
      }

      if (event.key === "Escape") {
        event.preventDefault();
        onSelect(null, null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedItem, selectedIndex, viewerItems, onSelect, onSelectProject]);

  return (
    <>
      <CalendarCursorTrail active={!selectedItem} />
      <section className="view-shell view-shell-calendar grid gap-22 px-5 pb-28 pt-44 text-[10px] leading-[1.1] max-md:gap-16 max-md:px-4 max-md:pt-36" aria-label="Calendar gallery">
        {calendarSections.map(({ year, items }) => (
          <article className="grid gap-18 max-md:gap-10" key={year}>
            <h2 className="m-0 text-center font-normal leading-none">
              <span className="calendar-year-label">{year}</span> <span className="calendar-year-count">({items.length})</span>
            </h2>
            <div className="grid grid-cols-7 gap-x-2 gap-y-16 max-md:grid-cols-2 max-md:gap-x-2 max-md:gap-y-10">
              {items.map((item, itemIndex) => (
                <button
                  className="calendar-item grid cursor-pointer content-start gap-1 border-0 bg-transparent p-0 text-left text-black"
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item.projectIndex, item.imageIndex)}
                >
                  <span className="mb-3 justify-self-end font-rag text-[10px] leading-none">{String(item.mediaIndex).padStart(2, "0")}</span>
                  <img className="calendar-thumb-image" src={item.image.imageUrl} alt={item.image.alt || item.image.title} loading="lazy" />
                  <span className="calendar-item-meta mt-5 grid grid-cols-[auto_auto] justify-between gap-x-2 text-[10px] leading-[1.15]">
                    <span>IMG_{String(item.mediaIndex).padStart(4, "0")}</span>
                    <span className="calendar-item-title">{item.image.title || item.project.title}</span>
                    {item.project.medium && <span className="col-span-2 opacity-50">{item.project.medium}</span>}
                  </span>
                </button>
              ))}
            </div>
          </article>
        ))}
      </section>
      {selectedItem && (
        <section className="media-viewer fixed inset-0 z-[15] h-[100dvh] overflow-hidden bg-white text-black" aria-label="Media viewer">
          <div className="media-viewer-heading fixed left-1/2 top-4 z-20 -translate-x-1/2 text-center font-kode text-[10px] font-normal leading-[1.15]">
            <div>{selectedItem.project.title}</div>
            {selectedItem.project.year && <div>{selectedItem.project.year}</div>}
          </div>

          <div className="media-viewer-stage pointer-events-none fixed bottom-18 left-0 right-0 top-20 z-10 grid place-items-end justify-items-center px-[22vw] max-md:bottom-24 max-md:px-6">
            {selectedItem.image.type === "video" ? (
              <iframe
                className="media-viewer-video pointer-events-auto"
                src={getVimeoEmbedUrl(selectedItem.image.url)}
                title={selectedItem.image.title || selectedItem.project.title}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <img
                className="media-viewer-image max-w-full object-contain"
                src={selectedItem.image.imageUrl}
                alt={selectedItem.image.alt || selectedItem.image.title}
              />
            )}
          </div>

          <button className="media-viewer-zone media-viewer-zone-left" type="button" aria-label="Previous image" onClick={showPrevious} />
          <button className="media-viewer-zone media-viewer-zone-right" type="button" aria-label="Next image" onClick={showNext} />

          <dl className="media-viewer-notes fixed bottom-7 left-7 z-20 grid max-w-[320px] grid-cols-[48px_1fr] gap-x-3 gap-y-0 font-kode text-[10px] leading-[1.15] max-md:bottom-5 max-md:left-5 max-md:max-w-[240px]">
            {selectedItem.project.medium && (
              <>
                <dt>Media</dt>
                <dd>{selectedItem.project.medium}</dd>
              </>
            )}
            {selectedItem.project.credits && (
              <>
                <dt>Credit</dt>
                <dd>{selectedItem.project.credits}</dd>
              </>
            )}
            {selectedItem.image.title && (
              <>
                <dt>Title</dt>
                <dd>{selectedItem.image.title}</dd>
              </>
            )}
          </dl>

          <div className="fixed bottom-7 right-7 z-20 font-kode text-[10px] leading-none max-md:bottom-5 max-md:right-5">
            {String(selectedIndex + 1).padStart(3, "0")} /{viewerItems.length}
          </div>
        </section>
      )}
    </>
  );
}
