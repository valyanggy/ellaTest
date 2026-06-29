import { useEffect, useMemo, useState } from "react";
import { chromatic } from "slot-text";
import { ABOUT_PROFILE } from "../config/site";
import { AboutSlotText } from "./AboutSlotText";

export function AboutCenter({ aboutAnimation, aboutOpen }) {
  const [textOpen, setTextOpen] = useState(false);
  const [isPresent, setIsPresent] = useState(false);
  const exitSettleTime = aboutAnimation.textExitDuration + aboutAnimation.textExitOffset + aboutAnimation.textColorFade;
  const slotOptions = useMemo(
    () => ({
      direction: textOpen ? "up" : "down",
      duration: 420,
      stagger: 14,
      exitOffset: 18,
      easing: "cubic-bezier(0.873, -0.003, 0, 1.002)",
      bounce: 0.24,
      color: chromatic({
        from: 155,
        spread: 115,
        saturation: 88,
        lightness: 44
      }),
      colorFade: 180,
      skipUnchanged: false
    }),
    [textOpen]
  );
  const copyEmail = () => {
    navigator.clipboard?.writeText(ABOUT_PROFILE.email).catch(() => {});
  };
  const visibleText = (text) => (textOpen ? text : " ".repeat(text.length));
  const slot = (text) => <AboutSlotText label={text} options={slotOptions} text={visibleText(text)} />;

  useEffect(() => {
    if (aboutOpen) {
      setIsPresent(true);
      setTextOpen(false);

      const enterTimer = window.setTimeout(() => {
        setTextOpen(true);
      }, aboutAnimation.textEnterDelay);

      return () => {
        window.clearTimeout(enterTimer);
      };
    }

    setTextOpen(false);

    const exitTimer = window.setTimeout(() => {
      setIsPresent(false);
    }, exitSettleTime);

    return () => {
      window.clearTimeout(exitTimer);
    };
  }, [aboutAnimation.textEnterDelay, aboutOpen, exitSettleTime]);

  return (
    <section
      className={[
        "about-center fixed inset-0 z-30 font-kode text-[10px] leading-[1.15]",
        isPresent ? "opacity-100" : "opacity-0 pointer-events-none",
        textOpen ? "is-open" : ""
      ].join(" ")}
      aria-hidden={!isPresent}
    >
      <div className="about-typeset absolute left-1/2 top-1/2 grid w-[min(520px,calc(100vw-44px))] -translate-x-1/2 -translate-y-1/2">
        <p className="about-copy about-description">
          {slot("Ella Varr Burgess is a talented ")}
          <a className="about-plain-link" href="https://www.ellavarrburgess.com/" aria-label="Multimedia artist">
            {slot("multimedia")}
            <br />
            {slot("artist")}
          </a>
          {slot(", a ")}
          <a className="about-plain-link" href="https://www.instagram.com/varraway/">
            {slot("pâtissier")}
          </a>
          {slot(", and a good friend.")}
        </p>

        <div className="about-copy about-contact-grid">
          <p>
            <span>IG</span>
            <a href={ABOUT_PROFILE.instagramUrl}>{ABOUT_PROFILE.instagram}</a>
            <a href={ABOUT_PROFILE.instagramAltUrl}>{ABOUT_PROFILE.instagramAlt}</a>
          </p>
          <p>
            <span>Email</span>
            <a href={`mailto:${ABOUT_PROFILE.email}`} onClick={copyEmail}>
              {ABOUT_PROFILE.email}
            </a>
          </p>
        </div>

        <p className="about-copy about-credit">
          <span>Site by:</span>
          <br />
          <strong>{ABOUT_PROFILE.credit}</strong>
          (
          <a href={ABOUT_PROFILE.creditPeople[0].url}>{ABOUT_PROFILE.creditPeople[0].name}</a>
          {" & "}
          <a href={ABOUT_PROFILE.creditPeople[1].url}>{ABOUT_PROFILE.creditPeople[1].name}</a>
          )
        </p>
      </div>

      <p className="about-copy about-rights fixed bottom-5 left-1/2 m-0 -translate-x-1/2 text-center">
        {ABOUT_PROFILE.copyright}
        <br />
        {ABOUT_PROFILE.rights}
      </p>
    </section>
  );
}
