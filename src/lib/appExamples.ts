// Three example applications surfaced by the interactive nodes on the light
// trail (services chapter). Illustrative examples of what KabNetys builds --
// clearly artisan/TPE-PME oriented, matching the services copy.

export type DemoBadge = "ok" | "warn" | "info";

export interface DemoRow {
  label: string;
  value?: string;
  badge?: DemoBadge;
}

export interface DemoScreen {
  id: string;
  label: string;
  rows: DemoRow[];
}

export interface AppExample {
  id: string;
  name: string;
  tagline: string;
  description: string;
  features: string[];
  accent: string;
  /** Position along the light trail (same 0..1 param as scrollProgress). */
  trailProgress: number;
  /** Interactive demo: navigable screens shown in the mock window. */
  screens: DemoScreen[];
  /** Primary action of the demo (adds a live row when clicked). */
  action: { label: string; resultRow: DemoRow };
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
    screens: [
      {
        id: "chantiers",
        label: "Chantiers",
        rows: [
          { label: "Rénovation Maison Perrin", value: "72%", badge: "ok" },
          { label: "Extension atelier Morel", value: "38%", badge: "info" },
          { label: "Toiture Ferme des Lilas", value: "12%", badge: "warn" },
        ],
      },
      {
        id: "equipes",
        label: "Équipes",
        rows: [
          { label: "Équipe A — Julien, Marc", value: "Perrin", badge: "ok" },
          { label: "Équipe B — Sofiane", value: "Morel", badge: "ok" },
          { label: "Intérim — à planifier", value: "—", badge: "warn" },
        ],
      },
      {
        id: "rapports",
        label: "Rapports",
        rows: [
          { label: "Rapport hebdo Perrin", value: "PDF", badge: "info" },
          { label: "Pointage semaine 27", value: "PDF", badge: "info" },
        ],
      },
    ],
    action: {
      label: "+ Nouveau chantier",
      resultRow: { label: "Nouveau chantier créé", value: "0%", badge: "ok" },
    },
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
    screens: [
      {
        id: "devis",
        label: "Devis",
        rows: [
          { label: "Devis #2041 — Perrin", value: "4 250 €", badge: "info" },
          { label: "Devis #2040 — Morel", value: "12 800 €", badge: "ok" },
          { label: "Devis #2038 — Lilas", value: "2 130 €", badge: "warn" },
        ],
      },
      {
        id: "factures",
        label: "Factures",
        rows: [
          { label: "Facture F-887 — payée", value: "4 250 €", badge: "ok" },
          { label: "Facture F-886 — en attente", value: "1 920 €", badge: "warn" },
        ],
      },
      {
        id: "relances",
        label: "Relances",
        rows: [
          { label: "Relance auto — F-886", value: "J+7", badge: "info" },
          { label: "Relance auto — F-882", value: "J+14", badge: "warn" },
        ],
      },
    ],
    action: {
      label: "+ Nouveau devis",
      resultRow: { label: "Devis #2042 — brouillon", value: "0 €", badge: "info" },
    },
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
    screens: [
      {
        id: "stock",
        label: "Stock",
        rows: [
          { label: "Visserie inox 4x40", value: "1 240", badge: "ok" },
          { label: "Panneaux OSB 18mm", value: "8", badge: "warn" },
          { label: "Peinture blanche 10L", value: "26", badge: "ok" },
        ],
      },
      {
        id: "alertes",
        label: "Alertes",
        rows: [
          { label: "OSB 18mm sous le seuil", value: "8 / 20", badge: "warn" },
          { label: "Joint silicone bientôt épuisé", value: "5 / 12", badge: "warn" },
        ],
      },
      {
        id: "commandes",
        label: "Commandes",
        rows: [
          { label: "CMD-118 — Sté Bois & Cie", value: "Expédiée", badge: "ok" },
          { label: "CMD-117 — Quincaillerie Est", value: "Reçue", badge: "ok" },
        ],
      },
    ],
    action: {
      label: "+ Commander",
      resultRow: { label: "CMD-119 — OSB 18mm x20", value: "Envoyée", badge: "info" },
    },
  },
];
