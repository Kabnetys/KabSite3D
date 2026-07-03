// The validated storyboard (CONCEPT.md section 4), presented hubtown.co.in
// style: text lives in a fixed screen-space HTML overlay (a real website
// layer) while the 3D valley travels behind it. Each beat fades in around
// its peakProgress and back out as the scroll continues, continuously.

export type BeatAlign = "left" | "right" | "center";

export interface ScenarioBeat {
  id: string;
  eyebrow?: string;
  /** Giant stat callout (renders as a huge number above the lines). */
  stat?: string;
  lines: string[];
  /** Small footnote line under the body (e.g. a source). */
  note?: string;
  peakProgress: number;
  fadeHalfWidth: number;
  align: BeatAlign;
}

export const SCENARIO_BEATS: ScenarioBeat[] = [
  // -- L'Aube : l'accroche (hero, centre ecran comme hubtown) --
  {
    id: "aube-1",
    eyebrow: "KabNetys — Développement sur mesure",
    lines: ["Pour chaque artisan,", "un outil sur mesure."],
    peakProgress: 0.04,
    fadeHalfWidth: 0.07,
    align: "center",
  },
  // -- La Friction : les points de douleur, un a la fois --
  {
    id: "friction-1",
    eyebrow: "01 — La Friction",
    lines: ["Excel en versions multiples."],
    peakProgress: 0.18,
    fadeHalfWidth: 0.04,
    align: "left",
  },
  {
    id: "friction-2",
    lines: ["Erreurs de saisie."],
    peakProgress: 0.23,
    fadeHalfWidth: 0.04,
    align: "right",
  },
  {
    id: "friction-3",
    lines: ["Temps perdu à recopier."],
    peakProgress: 0.28,
    fadeHalfWidth: 0.04,
    align: "left",
  },
  {
    id: "friction-4",
    lines: ["Des outils inadaptés."],
    peakProgress: 0.33,
    fadeHalfWidth: 0.04,
    align: "right",
  },
  // -- La Percee : une carte par service --
  {
    id: "percee-1",
    eyebrow: "02 — Nos services",
    lines: ["Applications métier"],
    note: "Multi-utilisateurs, sécurisée, évolutive.",
    peakProgress: 0.4,
    fadeHalfWidth: 0.045,
    align: "left",
  },
  {
    id: "percee-2",
    lines: ["Sites internet"],
    note: "Vitrine, portail client, espace admin.",
    peakProgress: 0.46,
    fadeHalfWidth: 0.045,
    align: "right",
  },
  {
    id: "percee-3",
    lines: ["Automatisation"],
    note: "Excel, Outlook connectés — zéro ressaisie.",
    peakProgress: 0.52,
    fadeHalfWidth: 0.045,
    align: "left",
  },
  // -- L'Intelligence : position + chiffres sources --
  {
    id: "intelligence-1",
    eyebrow: "03 — L'Intelligence",
    lines: ["L'IA propose,", "on dispose."],
    peakProgress: 0.58,
    fadeHalfWidth: 0.04,
    align: "center",
  },
  {
    id: "intelligence-stat-1",
    stat: "26%",
    lines: ["de productivité en plus par développeur"],
    note: "McKinsey, 2024",
    peakProgress: 0.63,
    fadeHalfWidth: 0.04,
    align: "left",
  },
  {
    id: "intelligence-stat-2",
    stat: "6h",
    lines: ["gagnées par équipe, chaque semaine"],
    note: "McKinsey, 2024",
    peakProgress: 0.68,
    fadeHalfWidth: 0.04,
    align: "right",
  },
  {
    id: "intelligence-stat-3",
    stat: "55%",
    lines: ["de code écrit plus vite avec l'IA"],
    note: "GitHub, 2024",
    peakProgress: 0.73,
    fadeHalfWidth: 0.04,
    align: "left",
  },
  // -- L'Equipe : portraits + vraies citations --
  {
    id: "equipe-1",
    eyebrow: "04 — L'Équipe",
    lines: ["Anthony Bonjour"],
    note: "Directeur Général — « Réseau, infrastructure, cybersécurité : j'interviens là où la technique fait la différence. »",
    peakProgress: 0.78,
    fadeHalfWidth: 0.04,
    align: "left",
  },
  {
    id: "equipe-2",
    lines: ["Kyllian Bletrix"],
    note: "Président — « Coder, transmettre, entreprendre : c'est ce qui me fait me lever chaque matin. »",
    peakProgress: 0.83,
    fadeHalfWidth: 0.04,
    align: "right",
  },
  // -- L'Horizon : la conclusion --
  {
    id: "horizon-1",
    eyebrow: "05 — L'Horizon",
    lines: ["Votre projet", "commence ici."],
    peakProgress: 0.9,
    fadeHalfWidth: 0.05,
    align: "center",
  },
  {
    id: "horizon-2",
    lines: ["Parlons-en."],
    note: "contact.kabnetys@gmail.com",
    peakProgress: 0.975,
    fadeHalfWidth: 0.05,
    align: "center",
  },
];
