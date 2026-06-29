import { useEffect, useRef } from "react";
import { animateSlotText, buildSlotText, clearSlotText } from "slot-text";

export function AboutSlotText({ label, options, text }) {
  const textRef = useRef(null);
  const previousTextRef = useRef(text);

  useEffect(() => {
    if (!textRef.current) {
      return undefined;
    }

    buildSlotText(textRef.current, text);
    previousTextRef.current = text;

    return () => {
      if (textRef.current) {
        clearSlotText(textRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!textRef.current || previousTextRef.current === text) {
      return;
    }

    animateSlotText(textRef.current, text, options);
    previousTextRef.current = text;
  }, [options, text]);

  return <span ref={textRef} aria-label={label} />;
}
