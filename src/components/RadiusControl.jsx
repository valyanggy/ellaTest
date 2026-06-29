import { useEffect, useMemo, useRef, useState } from "react";
import { AboutSlotText } from "../about/AboutSlotText";

const MIN_RADIUS = 18;
const MAX_RADIUS = 50;
const MAJOR_COUNT = 6;
const TRACK_INSET_PERCENT = 4.55;
const MINORS_PER_SEGMENT = 2;
const READER_HIDE_DELAY = 850;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function valueToPercent(value) {
  const rawPercent = ((value - MIN_RADIUS) / (MAX_RADIUS - MIN_RADIUS)) * 100;

  return TRACK_INSET_PERCENT + (rawPercent / 100) * (100 - TRACK_INSET_PERCENT * 2);
}

function valueToHue(value) {
  return ((value - MIN_RADIUS) / (MAX_RADIUS - MIN_RADIUS)) * 360;
}

function getStopStyle(value) {
  return {
    "--coquette-color": `hsl(${valueToHue(value)} 88% 52%)`,
    "--coquette-soft-color": `hsl(${valueToHue(value)} 82% 90%)`,
    left: `${valueToPercent(value)}%`
  };
}

function getReaderStyle(value) {
  const percent = valueToPercent(value);

  return {
    "--coquette-color": `hsl(${valueToHue(value)} 88% 52%)`,
    left: `${clamp(percent, 20, 80)}%`
  };
}

function getValueFromClientX(clientX, element) {
  const rect = element.getBoundingClientRect();
  const inset = rect.width * (TRACK_INSET_PERCENT / 100);
  const progress = clamp((clientX - rect.left - inset) / (rect.width - inset * 2), 0, 1);

  return MIN_RADIUS + progress * (MAX_RADIUS - MIN_RADIUS);
}

function getNearestStop(value, stops) {
  return stops.reduce((closestStop, currentStop) => {
    return Math.abs(currentStop.value - value) < Math.abs(closestStop.value - value) ? currentStop : closestStop;
  }, stops[0]);
}

function formatRadius(value) {
  return Math.round(value);
}

export function RadiusControl({ disabled, radius, setRadius, view }) {
  const [draftRadius, setDraftRadius] = useState(radius);
  const [hoverRadius, setHoverRadius] = useState(null);
  const [readerVisible, setReaderVisible] = useState(false);
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef(null);
  const readerHideTimeoutRef = useRef(null);

  const majorStops = useMemo(
    () =>
      Array.from({ length: MAJOR_COUNT }, (_, index) => {
        return {
          id: `major-${index}`,
          index,
          type: "major",
          value: MIN_RADIUS + (index / (MAJOR_COUNT - 1)) * (MAX_RADIUS - MIN_RADIUS)
        };
      }),
    []
  );
  const minorStops = useMemo(
    () =>
      majorStops.flatMap((startStop, index) => {
        const endStop = majorStops[index + 1];

        if (!endStop) {
          return [];
        }

        return Array.from({ length: MINORS_PER_SEGMENT }, (_, minorIndex) => ({
          id: `minor-${index}-${minorIndex}`,
          segmentIndex: index,
          type: "minor",
          value: startStop.value + ((minorIndex + 1) / (MINORS_PER_SEGMENT + 1)) * (endStop.value - startStop.value)
        }));
      }),
    [majorStops]
  );
  const stops = useMemo(() => [...majorStops, ...minorStops].sort((a, b) => a.value - b.value), [majorStops, minorStops]);
  const focusRadius = dragging ? draftRadius : hoverRadius ?? radius;
  const displayRadius = focusRadius;
  const selectedStop = useMemo(() => getNearestStop(radius, stops), [radius, stops]);
  const focusStop = useMemo(() => getNearestStop(focusRadius, stops), [focusRadius, stops]);
  const activeStopIds = useMemo(() => {
    const focusIndex = stops.findIndex((stop) => stop.id === focusStop.id);

    return new Set(stops.slice(Math.max(0, focusIndex - 1), focusIndex + 2).map((stop) => stop.id));
  }, [focusStop.id, stops]);

  useEffect(() => {
    if (!dragging) {
      setDraftRadius(radius);
    }
  }, [dragging, radius]);

  useEffect(() => {
    return () => {
      window.clearTimeout(readerHideTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (disabled) {
      setReaderVisible(false);
      setHoverRadius(null);
    }
  }, [disabled]);

  if (view !== "bouquet") {
    return null;
  }

  const showReader = () => {
    window.clearTimeout(readerHideTimeoutRef.current);
    setReaderVisible(true);
  };

  const hideReaderAfterDelay = () => {
    window.clearTimeout(readerHideTimeoutRef.current);
    readerHideTimeoutRef.current = window.setTimeout(() => {
      setReaderVisible(false);
      setHoverRadius(null);
    }, READER_HIDE_DELAY);
  };

  const updateDraftFromPointer = (event) => {
    if (!trackRef.current || disabled) {
      return;
    }

    showReader();
    const rawRadius = getValueFromClientX(event.clientX, trackRef.current);
    const nextRadius = getNearestStop(rawRadius, stops).value;
    setDraftRadius(nextRadius);
    setHoverRadius(nextRadius);
  };

  const commitRadius = (nextRadius = draftRadius) => {
    setRadius(nextRadius);
  };

  const handlePointerDown = (event) => {
    if (disabled) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    showReader();
    setDragging(true);
    updateDraftFromPointer(event);
  };

  const handlePointerMove = (event) => {
    if (disabled) {
      return;
    }

    if (dragging) {
      updateDraftFromPointer(event);
      return;
    }

    updateDraftFromPointer(event);
  };

  const handlePointerUp = (event) => {
    if (disabled) {
      return;
    }

    const nextRadius = trackRef.current ? getNearestStop(getValueFromClientX(event.clientX, trackRef.current), stops).value : draftRadius;
    setDragging(false);
    setDraftRadius(nextRadius);
    setHoverRadius(nextRadius);
    commitRadius(nextRadius);
  };

  const handleKeyDown = (event) => {
    if (disabled) {
      return;
    }

    showReader();
    const selectedIndex = stops.findIndex((stop) => stop.id === selectedStop.id);
    const keySteps = {
      ArrowLeft: -1,
      ArrowDown: -1,
      ArrowRight: 1,
      ArrowUp: 1,
      PageDown: -(MINORS_PER_SEGMENT + 1),
      PageUp: MINORS_PER_SEGMENT + 1
    };

    if (event.key === "Home") {
      event.preventDefault();
      setDraftRadius(stops[0].value);
      commitRadius(stops[0].value);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setDraftRadius(stops[stops.length - 1].value);
      commitRadius(stops[stops.length - 1].value);
      return;
    }

    if (!(event.key in keySteps)) {
      return;
    }

    event.preventDefault();
    const nextStop = stops[clamp(selectedIndex + keySteps[event.key], 0, stops.length - 1)];
    const nextRadius = nextStop.value;
    setDraftRadius(nextRadius);
    setHoverRadius(nextRadius);
    commitRadius(nextRadius);
  };

  return (
    <nav
      className="fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center justify-center bg-transparent px-2.5 py-1.5 max-md:w-[calc(100vw-20px)]"
      aria-label="Coquette control"
    >
      <div className={["coquette-control grid w-[min(220px,calc(100vw-72px))] text-center font-rag", disabled ? "is-about-muted pointer-events-none" : ""].join(" ")}>
        <div
          ref={trackRef}
          className={["coquette-track", readerVisible ? "is-reader-visible" : ""].join(" ")}
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-valuemin={MIN_RADIUS}
          aria-valuemax={MAX_RADIUS}
          aria-valuenow={radius}
          aria-label="Coquette"
          onFocus={showReader}
          onBlur={hideReaderAfterDelay}
          onKeyDown={handleKeyDown}
          onPointerEnter={showReader}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => {
            if (!dragging) {
              hideReaderAfterDelay();
            }
          }}
          onPointerUp={handlePointerUp}
        >
          <span aria-hidden="true" className="coquette-reader" style={getReaderStyle(displayRadius)}>
            <span>COQUETTE</span>
            <span className="coquette-reader-divider">|</span>
            <span className="coquette-reader-value">
              <AboutSlotText
                text={String(formatRadius(displayRadius)).padStart(2, " ")}
                label={String(formatRadius(displayRadius))}
                options={{
                  direction: "up",
                  duration: 280,
                  stagger: 18,
                  exitOffset: 0,
                  easing: "cubic-bezier(0.873, -0.003, 0, 1.002)",
                  bounce: 0.35,
                  color: "var(--coquette-color)",
                  colorFade: 260,
                  skipUnchanged: false
                }}
              />
            </span>
          </span>
          <span aria-hidden="true" className="coquette-reader-line" style={getStopStyle(displayRadius)} />
          <span className="coquette-pill" />
          {minorStops.map((stop) => {
            const isNearFocus = activeStopIds.has(stop.id);
            const isSelected = selectedStop.id === stop.id;

            return (
              <span
                aria-hidden="true"
                className={[
                  "coquette-dot coquette-dot-minor",
                  isNearFocus ? "is-visible" : "",
                  isSelected ? "is-selected" : ""
                ].join(" ")}
                key={stop.id}
                style={getStopStyle(stop.value)}
              />
            );
          })}
          {majorStops.map((stop) => {
            const isSelected = selectedStop.id === stop.id;
            const isNearFocus = activeStopIds.has(stop.id);

            return (
              <span
                aria-hidden="true"
                className={[
                  "coquette-dot coquette-dot-major",
                  isSelected ? "is-selected" : "",
                  isNearFocus ? "is-near" : ""
                ].join(" ")}
                key={stop.id}
                style={getStopStyle(stop.value)}
              />
            );
          })}
        </div>
      </div>
    </nav>
  );
}
