import { Color } from "three";
import { getChapterBlend } from "./chapters";

export interface ChapterAppearance {
  fogColor: string;
  lightColor: string;
  lightIntensity: number;
  fogDensity: number;
  terrainRoughness: number;
  hasFog: boolean;
  hasStars: boolean;
  hasFilaments: boolean;
  gradeHue: number;
  gradeSaturation: number;
  gradeBrightness: number;
  gradeContrast: number;
  gradeTint: string;
}

// A single graded family runs through all six chapters -- deep indigo/steel
// blues as the constant base, with only a restrained hint of each chapter's
// accent hue layered on top. This reads like film color-grading (one
// coherent night) rather than switching between saturated RGB mood lights.
export const CHAPTER_APPEARANCES: ChapterAppearance[] = [
  {
    fogColor: "#171c33",
    lightColor: "#8a92c9",
    lightIntensity: 5,
    fogDensity: 0.01,
    terrainRoughness: 0.9,
    hasFog: true,
    hasStars: true,
    hasFilaments: false,
    gradeHue: -0.2,
    gradeSaturation: 0.16,
    gradeBrightness: -0.04,
    gradeContrast: 0.08,
    gradeTint: "#7a86c2",
  },
  {
    fogColor: "#231b28",
    lightColor: "#c97a5f",
    lightIntensity: 6.5,
    fogDensity: 0.0121,
    terrainRoughness: 1,
    hasFog: true,
    hasStars: true,
    hasFilaments: false,
    gradeHue: 0.03,
    gradeSaturation: 0.2,
    gradeBrightness: 0.0,
    gradeContrast: 0.12,
    gradeTint: "#c17654",
  },
  {
    fogColor: "#132a30",
    lightColor: "#4fb9cf",
    lightIntensity: 7,
    fogDensity: 0.0057,
    terrainRoughness: 0.35,
    hasFog: true,
    hasStars: true,
    hasFilaments: false,
    gradeHue: 0.5,
    gradeSaturation: 0.18,
    gradeBrightness: 0.01,
    gradeContrast: 0.1,
    gradeTint: "#4fb9cf",
  },
  {
    fogColor: "#080b1a",
    lightColor: "#3f5fd6",
    lightIntensity: 9,
    fogDensity: 0.0,
    terrainRoughness: 0.5,
    hasFog: false,
    hasStars: true,
    hasFilaments: true,
    gradeHue: 0.62,
    gradeSaturation: 0.22,
    gradeBrightness: -0.06,
    gradeContrast: 0.14,
    gradeTint: "#3f5fd6",
  },
  {
    fogColor: "#26201a",
    lightColor: "#d9a869",
    lightIntensity: 9,
    fogDensity: 0.0057,
    terrainRoughness: 0.75,
    hasFog: true,
    hasStars: true,
    hasFilaments: false,
    gradeHue: 0.02,
    gradeSaturation: 0.18,
    gradeBrightness: 0.02,
    gradeContrast: 0.09,
    gradeTint: "#d9a869",
  },
  {
    fogColor: "#0b0d17",
    lightColor: "#eef1ff",
    lightIntensity: 5,
    fogDensity: 0.0021,
    terrainRoughness: 0.6,
    hasFog: true,
    hasStars: true,
    hasFilaments: false,
    gradeHue: 0.0,
    gradeSaturation: -0.12,
    gradeBrightness: 0.02,
    gradeContrast: 0.06,
    gradeTint: "#dfe8ff",
  },
];

const STAR_OPACITY_BY_CHAPTER = [0.35, 0.25, 0.4, 0.85, 0.45, 0.85];

export function getStarOpacityAt(progress: number): number {
  const { index, t } = getChapterBlend(progress);
  const next = Math.min(STAR_OPACITY_BY_CHAPTER.length - 1, index + 1);
  const a = STAR_OPACITY_BY_CHAPTER[index];
  const b = STAR_OPACITY_BY_CHAPTER[next];
  return a + (b - a) * t;
}

const colorA = new Color();
const colorB = new Color();
const mixed = new Color();

export function getFogColorAt(progress: number): Color {
  const { index, t } = getChapterBlend(progress);
  const next = Math.min(CHAPTER_APPEARANCES.length - 1, index + 1);
  colorA.set(CHAPTER_APPEARANCES[index].fogColor);
  colorB.set(CHAPTER_APPEARANCES[next].fogColor);
  return mixed.copy(colorA).lerp(colorB, t).clone();
}

export function getLightColorAt(progress: number): Color {
  const { index, t } = getChapterBlend(progress);
  const next = Math.min(CHAPTER_APPEARANCES.length - 1, index + 1);
  colorA.set(CHAPTER_APPEARANCES[index].lightColor);
  colorB.set(CHAPTER_APPEARANCES[next].lightColor);
  return mixed.copy(colorA).lerp(colorB, t).clone();
}

export function getLightIntensityAt(progress: number): number {
  const { index, t } = getChapterBlend(progress);
  const next = Math.min(CHAPTER_APPEARANCES.length - 1, index + 1);
  const a = CHAPTER_APPEARANCES[index].lightIntensity;
  const b = CHAPTER_APPEARANCES[next].lightIntensity;
  return a + (b - a) * t;
}

export function getFogDensityAt(progress: number): number {
  const { index, t } = getChapterBlend(progress);
  const next = Math.min(CHAPTER_APPEARANCES.length - 1, index + 1);
  const a = CHAPTER_APPEARANCES[index].fogDensity;
  const b = CHAPTER_APPEARANCES[next].fogDensity;
  return a + (b - a) * t;
}

export function getAppearanceAt(progress: number): ChapterAppearance {
  const { index } = getChapterBlend(progress);
  return CHAPTER_APPEARANCES[index];
}

export interface ColorGrade {
  hue: number;
  saturation: number;
  brightness: number;
  contrast: number;
  tint: Color;
}

const gradeTintA = new Color();
const gradeTintB = new Color();
const gradeTintMixed = new Color();

export function getColorGradeAt(progress: number): ColorGrade {
  const { index, t } = getChapterBlend(progress);
  const next = Math.min(CHAPTER_APPEARANCES.length - 1, index + 1);
  const a = CHAPTER_APPEARANCES[index];
  const b = CHAPTER_APPEARANCES[next];
  gradeTintA.set(a.gradeTint);
  gradeTintB.set(b.gradeTint);
  return {
    hue: a.gradeHue + (b.gradeHue - a.gradeHue) * t,
    saturation: a.gradeSaturation + (b.gradeSaturation - a.gradeSaturation) * t,
    brightness: a.gradeBrightness + (b.gradeBrightness - a.gradeBrightness) * t,
    contrast: a.gradeContrast + (b.gradeContrast - a.gradeContrast) * t,
    tint: gradeTintMixed.copy(gradeTintA).lerp(gradeTintB, t).clone(),
  };
}
