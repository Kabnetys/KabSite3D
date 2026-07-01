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

export const CHAPTER_APPEARANCES: ChapterAppearance[] = [
  {
    fogColor: "#2a1a4a",
    lightColor: "#6a5acd",
    lightIntensity: 6,
    fogDensity: 0.01,
    terrainRoughness: 0.9,
    hasFog: true,
    hasStars: true,
    hasFilaments: false,
    gradeHue: -0.35,
    gradeSaturation: 0.35,
    gradeBrightness: -0.05,
    gradeContrast: 0.1,
    gradeTint: "#8a6adf",
  },
  {
    fogColor: "#4a1414",
    lightColor: "#ff5522",
    lightIntensity: 8,
    fogDensity: 0.0121,
    terrainRoughness: 1,
    hasFog: true,
    hasStars: true,
    hasFilaments: false,
    gradeHue: 0.05,
    gradeSaturation: 0.45,
    gradeBrightness: 0.0,
    gradeContrast: 0.18,
    gradeTint: "#ff6a33",
  },
  {
    fogColor: "#0a3a3a",
    lightColor: "#22e5ff",
    lightIntensity: 9,
    fogDensity: 0.0057,
    terrainRoughness: 0.35,
    hasFog: true,
    hasStars: true,
    hasFilaments: false,
    gradeHue: 0.5,
    gradeSaturation: 0.4,
    gradeBrightness: 0.02,
    gradeContrast: 0.14,
    gradeTint: "#2ee6ff",
  },
  {
    fogColor: "#020208",
    lightColor: "#2255ff",
    lightIntensity: 11,
    fogDensity: 0.0,
    terrainRoughness: 0.5,
    hasFog: false,
    hasStars: true,
    hasFilaments: true,
    gradeHue: 0.62,
    gradeSaturation: 0.5,
    gradeBrightness: -0.08,
    gradeContrast: 0.2,
    gradeTint: "#3366ff",
  },
  {
    fogColor: "#6a3f10",
    lightColor: "#ffb347",
    lightIntensity: 12,
    fogDensity: 0.0057,
    terrainRoughness: 0.75,
    hasFog: true,
    hasStars: true,
    hasFilaments: false,
    gradeHue: 0.02,
    gradeSaturation: 0.4,
    gradeBrightness: 0.04,
    gradeContrast: 0.12,
    gradeTint: "#ffb347",
  },
  {
    fogColor: "#05050a",
    lightColor: "#ffffff",
    lightIntensity: 5,
    fogDensity: 0.0021,
    terrainRoughness: 0.6,
    hasFog: true,
    hasStars: true,
    hasFilaments: false,
    gradeHue: 0.0,
    gradeSaturation: -0.25,
    gradeBrightness: 0.03,
    gradeContrast: 0.08,
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
