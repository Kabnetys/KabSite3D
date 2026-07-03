// Three example applications surfaced by the interactive nodes on the light
// trail (services chapter). Illustrative examples of what KabNetys builds --
// clearly artisan/TPE-PME oriented, matching the services copy.

export interface AppExample {
  id: string;
  name: string;
  tagline: string;
  description: string;
  features: string[];
  accent: string;
  /** Position along the light trail (same 0..1 param as scrollProgress). */
  trailProgress: number;
}

export const APP_EXAMPLES: AppExample[] = [
  {
    id: "chantier",
    name: "Suivi de chantier",
    tagline: "Le chantier dans la poche, du devis à la réception.",
    description:
      "Pensée pour les artisans du bâtiment : chaque chantier suit son avancement en temps réel, photos et heures pointées depuis le téléphone, rapport prêt à envoyer au client.",
    features: [
      "Planning des équipes en un coup d'œil",
      "Pointage mobile sur le terrain",
      "Photos et notes rattachées au chantier",
      "Rapport PDF généré automatiquement",
    ],
    accent: "#39c8ff",
    trailProgress: 0.4,
  },
  {
    id: "devis",
    name: "Devis & facturation",
    tagline: "Un devis en trois clics, une relance jamais oubliée.",
    description:
      "Fini les devis refaits dans Word et les factures en retard : catalogue de prestations, TVA gérée, relances automatiques et suivi des paiements au même endroit.",
    features: [
      "Devis en trois clics depuis le catalogue",
      "Facturation et TVA sans ressaisie",
      "Relances client automatiques",
      "Tableau de bord des paiements",
    ],
    accent: "#5aa2ff",
    trailProgress: 0.46,
  },
  {
    id: "stock",
    name: "Gestion d'atelier",
    tagline: "Le stock juste, les commandes au bon moment.",
    description:
      "L'inventaire se met à jour en scannant, les seuils d'alerte préviennent avant la rupture, et les commandes fournisseurs partent en un clic.",
    features: [
      "Inventaire par scan code-barres",
      "Alertes de seuil avant rupture",
      "Commandes fournisseurs en un clic",
      "Historique et traçabilité complète",
    ],
    accent: "#2f7fe8",
    trailProgress: 0.52,
  },
];
