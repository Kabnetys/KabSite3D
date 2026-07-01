export type PerformanceTier = "high" | "low";

function getGpuTier(): PerformanceTier {
  if (typeof window === "undefined") return "high";
  try {
    const canvas = document.createElement("canvas");
    const gl =
      (canvas.getContext("webgl2") as WebGL2RenderingContext | null) ||
      (canvas.getContext("webgl") as WebGLRenderingContext | null);
    if (!gl) return "low";
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = debugInfo
      ? (gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string)
      : "";
    if (/swiftshader|llvmpipe|software/i.test(renderer)) return "low";
    return "high";
  } catch {
    return "low";
  }
}

export function detectPerformanceTier(): PerformanceTier {
  if (typeof window === "undefined") return "high";

  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const cores = navigator.hardwareConcurrency ?? 4;
  const isSmallViewport = window.innerWidth <= 480;
  const dpr = window.devicePixelRatio ?? 1;

  if (memory !== undefined && memory <= 4) return "low";
  if (cores <= 4 && isSmallViewport) return "low";
  if (dpr >= 3 && isSmallViewport) return "low";
  if (getGpuTier() === "low") return "low";

  return "high";
}
