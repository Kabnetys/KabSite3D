export type SceneTheme = "dark" | "light";

export interface ThemePalette {
  background: string;
  ambientColor: string;
  ambientIntensity: number;
  hemisphereSky: string;
  hemisphereGround: string;
  hemisphereIntensity: number;
  sunColor: string;
  sunIntensity: number;
  fogColor: string;
  fogDensity: number;
  starOpacity: number;
  waterBase: string;
  waterCrest: string;
  waterEmissive: string;
  waterEmissiveIntensity: number;
  terrainTint: string;
  terrainTintStrength: number;
}

export const THEME_PALETTES: Record<SceneTheme, ThemePalette> = {
  dark: {
    background: "#040d1a",
    ambientColor: "#8a8478",
    ambientIntensity: 0.34,
    hemisphereSky: "#00b4ff",
    hemisphereGround: "#1a1712",
    hemisphereIntensity: 0.42,
    sunColor: "#dce8ff",
    sunIntensity: 2,
    fogColor: "#2a1a4a",
    fogDensity: 0.028,
    starOpacity: 1,
    waterBase: "#0a1c4a",
    waterCrest: "#1c4f9c",
    waterEmissive: "#123a7a",
    waterEmissiveIntensity: 0.1,
    terrainTint: "#ffffff",
    terrainTintStrength: 0.05,
  },
  light: {
    background: "#bfe3fb",
    ambientColor: "#ffffff",
    ambientIntensity: 0.85,
    hemisphereSky: "#bfe3fb",
    hemisphereGround: "#8a9a6a",
    hemisphereIntensity: 0.75,
    sunColor: "#fff6e0",
    sunIntensity: 3.2,
    fogColor: "#dcedf8",
    fogDensity: 0.004,
    starOpacity: 0,
    waterBase: "#1f7fb8",
    waterCrest: "#7fd6ea",
    waterEmissive: "#2a8fc4",
    waterEmissiveIntensity: 0.015,
    terrainTint: "#fff2dc",
    terrainTintStrength: 0.04,
  },
};
