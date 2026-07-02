export interface Chapter {
  id: string;
  slug: string;
  label: string;
  placeholder: string;
  scrollProgress: number;
  position: [number, number, number];
}

export const CHAPTERS: Chapter[] = [
  {
    id: "aube",
    slug: "aube",
    label: "L'Aube",
    placeholder: "Pour chaque artisan, un outil sur mesure.",
    scrollProgress: 0,
    position: [0, 4, 0],
  },
  {
    id: "friction",
    slug: "friction",
    label: "La Friction",
    placeholder: "Excel en versions multiples, erreurs de saisie, temps perdu.",
    scrollProgress: 0.15,
    position: [6, 3, -70],
  },
  {
    id: "percee",
    slug: "percee",
    label: "La Percee",
    placeholder: "Applications metier, sites internet, automatisation.",
    scrollProgress: 0.35,
    position: [-8, 4, -150],
  },
  {
    id: "intelligence",
    slug: "intelligence",
    label: "L'Intelligence",
    placeholder: "L'IA propose, on dispose.",
    scrollProgress: 0.55,
    position: [4, 5, -230],
  },
  {
    id: "equipe",
    slug: "equipe",
    label: "L'Equipe",
    placeholder: "Kyllian & Anthony.",
    scrollProgress: 0.7,
    position: [0, 4, -300],
  },
  {
    id: "horizon",
    slug: "horizon",
    label: "L'Horizon",
    placeholder: "Votre projet commence ici.",
    scrollProgress: 0.85,
    position: [0, 6, -370],
  },
];

export function getChapterBySlug(slug: string): Chapter | undefined {
  return CHAPTERS.find((c) => c.slug === slug);
}

export function getActiveChapterIndex(progress: number): number {
  let activeIndex = 0;
  for (let i = 0; i < CHAPTERS.length; i += 1) {
    if (progress >= CHAPTERS[i].scrollProgress) {
      activeIndex = i;
    }
  }
  return activeIndex;
}

export function getChapterZRange(): { min: number; max: number } {
  const zs = CHAPTERS.map((chapter) => chapter.position[2]);
  return { min: Math.min(...zs), max: Math.max(...zs) };
}

export function getChapterBlend(progress: number): { index: number; t: number } {
  const activeIndex = getActiveChapterIndex(progress);
  const nextIndex = Math.min(CHAPTERS.length - 1, activeIndex + 1);
  if (activeIndex === nextIndex) return { index: activeIndex, t: 0 };
  const start = CHAPTERS[activeIndex].scrollProgress;
  const end = CHAPTERS[nextIndex].scrollProgress;
  const span = end - start;
  const t = span > 0 ? Math.min(1, Math.max(0, (progress - start) / span)) : 0;
  return { index: activeIndex, t };
}
