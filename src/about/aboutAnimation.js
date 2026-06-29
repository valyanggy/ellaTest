import { cubicBezierEase } from "../utils/easing";

export const ABOUT_FORCE_TRANSITION = {
  enterDuration: 1500,
  exitDuration: 3000,
  ease: cubicBezierEase(0.873, -0.003, 0, 1.002)
};

export const DEFAULT_ABOUT_ANIMATION = {
  textEnterDelay: 260,
  textEnterDuration: 680,
  textExitDuration: 1300,
  textStagger: 4,
  textExitOffset: 0,
  textBounce: 1,
  textColorFade: 789,
  hueFrom: 0,
  hueSpread: 720,
  hueSaturation: 92,
  hueLightness: 45,
  graphEnterDuration: 1500,
  graphExitDuration: 1500
};
