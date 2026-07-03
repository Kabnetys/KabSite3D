// The validated storyboard (CONCEPT.md section 4), presented hubtown.co.in
// style: one complete section block per chapter (eyebrow + headline +
// supporting content shown TOGETHER, like a real website section), rendered
// in the fixed screen-space HTML overlay while the 3D valley plays behind.
// Each section fades in around its chapter and out toward the next.

export type BeatAlign = "left" | "right" | "center";

export interface ScenarioStat {
  value: string;
  label: string;
  source: string;
}

export interface ScenarioItem {
  title: string;
  desc?: string;
  /** Expanded on click (team members): role, full quote, skill chips. */
  details?: {
    role: string;
    quote: string;
    skills: string[];
  };
}

export interface ScenarioSection {
  id: string;
  eyebrow?: string;
  title: string[];
  paragraph?: string;
  /** Bullet-less content list (pain points, services, team members). */
  items?: ScenarioItem[];
  /** Row of big glowing stat callouts, displayed side by side. */
  stats?: ScenarioStat[];
  cta?: { label: string; href: string };
  peakProgress: number;
  fadeHalfWidth: number;
  align: BeatAlign;
}

export const SCENARIO_SECTIONS: ScenarioSection[] = [
  {
    id: "aube",
    eyebrow: "KabNetys — Développement sur mesure",
    title: ["Pour chaque artisan,", "un outil sur mesure."],
    paragraph:
      "Développement sur mesure pour les TPE et PME qui veulent enfin des solutions qui leur ressemblent.",
    cta: { label: "Démarrer un projet", href: "mailto:contact.kabnetys@gmail.com" },
    peakProgress: 0.05,
    fadeHalfWidth: 0.09,
    align: "center",
  },
  {
    id: "friction",
    eyebrow: "01 — La Friction",
    title: ["Le quotidien", "qui coince."],
    items: [
      { title: "Excel en versions multiples" },
      { title: "Erreurs de saisie" },
      { title: "Temps perdu à recopier" },
      { title: "Des outils inadaptés" },
    ],
    peakProgress: 0.25,
    fadeHalfWidth: 0.09,
    align: "left",
  },
  {
    id: "percee",
    eyebrow: "02 — Nos services",
    title: ["Ce qu'on construit", "pour vous."],
    items: [
      { title: "Applications métier", desc: "Multi-utilisateurs, sécurisée, évolutive." },
      { title: "Sites internet", desc: "Vitrine, portail client, espace admin." },
      { title: "Automatisation", desc: "Excel, Outlook connectés — zéro ressaisie." },
    ],
    peakProgress: 0.46,
    fadeHalfWidth: 0.09,
    align: "right",
  },
  {
    id: "intelligence",
    eyebrow: "03 — L'Intelligence",
    title: ["L'IA propose,", "on dispose."],
    stats: [
      { value: "26%", label: "de productivité en plus par développeur", source: "McKinsey, 2024" },
      { value: "6h", label: "gagnées par équipe, chaque semaine", source: "McKinsey, 2024" },
      { value: "55%", label: "de code écrit plus vite avec l'IA", source: "GitHub, 2024" },
    ],
    peakProgress: 0.64,
    fadeHalfWidth: 0.09,
    align: "center",
  },
  {
    id: "equipe",
    eyebrow: "04 — L'Équipe",
    title: ["Deux profils.", "Un spectre complet."],
    items: [
      {
        title: "Anthony Bonjour",
        desc: "La technique, là où elle fait la différence.",
        details: {
          role: "Directeur Général · Co-fondateur",
          quote:
            "« Réseau, infrastructure, développement, cybersécurité — j'interviens là où la technique fait la différence. »",
          skills: ["Réseau N1/N2", "Infrastructure SI", "Cybersécurité", "C#", "SQL"],
        },
      },
      {
        title: "Kyllian Bletrix",
        desc: "Coder, transmettre, entreprendre.",
        details: {
          role: "Président · Co-fondateur",
          quote: "« Coder, transmettre, entreprendre — c'est ce qui me fait me lever chaque matin. »",
          skills: ["Laravel", "C# / POO", "SQL", "Power BI", "Git"],
        },
      },
    ],
    peakProgress: 0.8,
    fadeHalfWidth: 0.08,
    align: "left",
  },
  {
    id: "horizon",
    eyebrow: "05 — L'Horizon",
    title: ["Votre projet", "commence ici."],
    paragraph: "On vous répond sous 24h.",
    cta: { label: "Parlons-en", href: "mailto:contact.kabnetys@gmail.com" },
    peakProgress: 0.94,
    fadeHalfWidth: 0.08,
    align: "center",
  },
];
