import { useEffect, useMemo, useRef } from "react";
import { CATEGORY_COLORS, GROUP_COLORS } from "../config/site";

const TRAIL_MIN_DISTANCE = 8;
const TRAIL_MIN_INTERVAL = 12;
const TRAIL_MIN_VELOCITY = 0.9;

export function CalendarCursorTrail({ active }) {
  const containerRef = useRef(null);
  const cursorRef = useRef(null);
  const lastMoveRef = useRef({ time: 0, x: null, y: null });
  const lastTrailRef = useRef({ time: 0, x: null, y: null });
  const colorPalette = useMemo(() => {
    return [...Object.values(CATEGORY_COLORS), ...GROUP_COLORS.flat()].filter(Boolean);
  }, []);

  useEffect(() => {
    if (!active || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const container = containerRef.current;
    const cursor = cursorRef.current;

    if (!container || !cursor) {
      return undefined;
    }

    let colorIndex = 0;

    const addTrailDot = (event) => {
      if (event.pointerType === "touch") {
        return;
      }

      cursor.style.opacity = "1";
      cursor.style.transform = `translate(${event.clientX}px, ${event.clientY}px) translate(-50%, -50%)`;

      const now = performance.now();
      const lastMove = lastMoveRef.current;
      const moveDistance = lastMove.x === null ? 0 : Math.hypot(event.clientX - lastMove.x, event.clientY - lastMove.y);
      const moveTime = Math.max(1, now - lastMove.time);
      const velocity = lastMove.x === null ? 0 : moveDistance / moveTime;
      const lastTrail = lastTrailRef.current;
      const trailDistance = lastTrail.x === null ? Infinity : Math.hypot(event.clientX - lastTrail.x, event.clientY - lastTrail.y);

      lastMoveRef.current = { time: now, x: event.clientX, y: event.clientY };

      if (velocity < TRAIL_MIN_VELOCITY || trailDistance < TRAIL_MIN_DISTANCE || now - lastTrail.time < TRAIL_MIN_INTERVAL) {
        return;
      }

      lastTrailRef.current = { time: now, x: event.clientX, y: event.clientY };

      const dot = document.createElement("span");
      const size = 6 + ((colorIndex % 4) * 2);
      dot.className = "calendar-cursor-trail-dot";
      dot.style.left = `${event.clientX}px`;
      dot.style.top = `${event.clientY}px`;
      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;
      dot.style.background = colorPalette[colorIndex % colorPalette.length];
      colorIndex += 1;

      container.appendChild(dot);
      dot.addEventListener("animationend", () => dot.remove(), { once: true });
    };

    const hideCursor = () => {
      cursor.style.opacity = "0";
    };

    window.addEventListener("pointermove", addTrailDot, { passive: true });
    window.addEventListener("pointerleave", hideCursor);
    window.addEventListener("blur", hideCursor);

    return () => {
      window.removeEventListener("pointermove", addTrailDot);
      window.removeEventListener("pointerleave", hideCursor);
      window.removeEventListener("blur", hideCursor);
      container.replaceChildren();
      lastMoveRef.current = { time: 0, x: null, y: null };
      lastTrailRef.current = { time: 0, x: null, y: null };
    };
  }, [active, colorPalette]);

  return (
    <>
      <div ref={containerRef} className="calendar-cursor-trail" aria-hidden="true" />
      <span ref={cursorRef} className="calendar-custom-cursor" aria-hidden="true" />
    </>
  );
}
