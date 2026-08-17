import { CalendarCursorTrail } from "./CalendarCursorTrail";

export function CursorTrailRecordingPage() {
  return (
    <main className="cursor-trail-recording fixed inset-0 grid place-items-center overflow-hidden bg-white text-black">
      <CalendarCursorTrail active dotScale={1.75} trailDurationMs={1180} />
      <h1 className="relative z-10 m-0 text-center font-junicode text-[clamp(72px,16vw,240px)] font-normal leading-none">
        Ella Varr
      </h1>
    </main>
  );
}
