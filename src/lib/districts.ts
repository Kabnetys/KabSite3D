export interface District {
  id: string;
  slug: string;
  label: string;
  placeholder: string;
  scrollProgress: number;
  position: [number, number, number];
}

export const DISTRICTS: District[] = [
  {
    id: "hero",
    slug: "hero",
    label: "Entree",
    placeholder: "Section : Accueil",
    scrollProgress: 0,
    position: [0, 6, 0],
  },
  {
    id: "applications",
    slug: "applications",
    label: "Applications metier",
    placeholder: "Section : Applications metier",
    scrollProgress: 0.15,
    position: [-18, 4, -60],
  },
  {
    id: "sites",
    slug: "sites",
    label: "Sites internet",
    placeholder: "Section : Sites internet",
    scrollProgress: 0.35,
    position: [16, 4, -140],
  },
  {
    id: "automatisation",
    slug: "automatisation",
    label: "Automatisation",
    placeholder: "Section : Automatisation",
    scrollProgress: 0.55,
    position: [-14, 4, -220],
  },
  {
    id: "methode",
    slug: "methode",
    label: "La methode",
    placeholder: "Section : La methode",
    scrollProgress: 0.7,
    position: [0, 4, -290],
  },
  {
    id: "equipe",
    slug: "equipe",
    label: "L'equipe",
    placeholder: "Section : L'equipe",
    scrollProgress: 0.85,
    position: [0, 6, -360],
  },
  {
    id: "contact",
    slug: "contact",
    label: "Contact",
    placeholder: "Section : Contact",
    scrollProgress: 1,
    position: [0, 3, -430],
  },
];

export function getDistrictBySlug(slug: string): District | undefined {
  return DISTRICTS.find((d) => d.slug === slug);
}

export function getActiveDistrictIndex(progress: number): number {
  let activeIndex = 0;
  for (let i = 0; i < DISTRICTS.length; i += 1) {
    if (progress >= DISTRICTS[i].scrollProgress) {
      activeIndex = i;
    }
  }
  return activeIndex;
}
