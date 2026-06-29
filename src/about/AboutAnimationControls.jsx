import { useState } from "react";
import { DEFAULT_ABOUT_ANIMATION } from "./aboutAnimation";

function AnimationControlRow({ label, max, min, name, onChange, step = 1, value }) {
  return (
    <label className="grid gap-1">
      <span className="flex items-center justify-between gap-3">
        <span>{label}</span>
        <input
          className="w-17 border border-black/20 bg-white px-1 py-0.5 text-right"
          max={max}
          min={min}
          name={name}
          step={step}
          type="number"
          value={value}
          onChange={(event) => onChange(name, Number(event.target.value))}
        />
      </span>
      <input
        className="accent-[#e519e5]"
        max={max}
        min={min}
        name={name}
        step={step}
        type="range"
        value={value}
        onChange={(event) => onChange(name, Number(event.target.value))}
      />
    </label>
  );
}

export function AboutAnimationControls({ aboutAnimation, aboutOpen, setAboutAnimation, view }) {
  const [open, setOpen] = useState(false);

  if (view !== "bouquet" || aboutOpen) {
    return null;
  }

  const updateAnimation = (name, value) => {
    setAboutAnimation((currentAnimation) => ({
      ...currentAnimation,
      [name]: value
    }));
  };

  return (
    <aside className="fixed bottom-4 right-4 z-40 grid max-h-[calc(100vh-120px)] w-[min(280px,calc(100vw-28px))] gap-2 bg-white/85 p-2.5 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <button className="cursor-pointer border-0 bg-transparent p-0 text-left text-black" type="button" onClick={() => setOpen((value) => !value)}>
          {open ? "Hide" : "Tune"} About Motion
        </button>
        <button className="cursor-pointer border-0 bg-transparent p-0 text-black" type="button" onClick={() => setAboutAnimation(DEFAULT_ABOUT_ANIMATION)}>
          Reset
        </button>
      </div>
      {open && (
        <div className="grid max-h-[calc(100vh-176px)] gap-2 overflow-y-auto pr-1">
          <AnimationControlRow label="Text delay" min={0} max={3000} name="textEnterDelay" value={aboutAnimation.textEnterDelay} onChange={updateAnimation} />
          <AnimationControlRow label="Text enter" min={120} max={2200} name="textEnterDuration" value={aboutAnimation.textEnterDuration} onChange={updateAnimation} />
          <AnimationControlRow label="Text exit" min={120} max={3000} name="textExitDuration" value={aboutAnimation.textExitDuration} onChange={updateAnimation} />
          <AnimationControlRow label="Text stagger" min={0} max={80} name="textStagger" value={aboutAnimation.textStagger} onChange={updateAnimation} />
          <AnimationControlRow label="Exit offset" min={0} max={220} name="textExitOffset" value={aboutAnimation.textExitOffset} onChange={updateAnimation} />
          <AnimationControlRow label="Bounce" min={0} max={1} step={0.01} name="textBounce" value={aboutAnimation.textBounce} onChange={updateAnimation} />
          <AnimationControlRow label="Color fade" min={0} max={1600} name="textColorFade" value={aboutAnimation.textColorFade} onChange={updateAnimation} />
          <AnimationControlRow label="Hue start" min={0} max={360} name="hueFrom" value={aboutAnimation.hueFrom} onChange={updateAnimation} />
          <AnimationControlRow label="Hue spread" min={0} max={720} name="hueSpread" value={aboutAnimation.hueSpread} onChange={updateAnimation} />
          <AnimationControlRow label="Saturation" min={0} max={100} name="hueSaturation" value={aboutAnimation.hueSaturation} onChange={updateAnimation} />
          <AnimationControlRow label="Lightness" min={0} max={100} name="hueLightness" value={aboutAnimation.hueLightness} onChange={updateAnimation} />
          <AnimationControlRow label="Graph enter" min={200} max={5000} name="graphEnterDuration" value={aboutAnimation.graphEnterDuration} onChange={updateAnimation} />
          <AnimationControlRow label="Graph exit" min={200} max={6000} name="graphExitDuration" value={aboutAnimation.graphExitDuration} onChange={updateAnimation} />
        </div>
      )}
    </aside>
  );
}
