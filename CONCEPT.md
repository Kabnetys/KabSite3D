# KabSite3D — Concept créatif

> Site vitrine scroll-driven en 3D pour KabNetys, inspiré de hubtown.co.in.
> Ce document fixe l'idée avant tout code : la métaphore, le parcours, section par section.

---

## 1. La métaphore : la Cité KabNetys

Le visiteur ne "lit" pas une page, il **survole une ville numérique nocturne** en scrollant.
Une ville stylisée, bas-poly, aux lignes nettes, éclairée de bleu néon sur fond noir marine —
directement dérivée du logo (KAB en relief bleu électrique, circuits imprimés, "netys" en
contour lumineux).

Chaque section du site = un **quartier** ou un **bâtiment** de cette cité. Le scroll fait
avancer une caméra le long d'un rail à travers la ville, comme un travelling de drone au
crépuscule. Le texte et les interactions UI apparaissent en overlay au-dessus de la scène 3D,
jamais en dehors d'elle.

**Pourquoi cette métaphore et pas une autre (usine, vaisseau, forêt de circuits...) :**
- Une ville = plusieurs bâtiments distincts = mapping naturel 1 quartier ↔ 1 section de site
- Cohérent avec le logo (circuits = rues lumineuses, immeubles = blocs de code)
- Sombre + néon bleu = direction artistique déjà validée, sans l'inventer
- Emprunte le langage visuel de la "smart city" → résonne avec "TPE/PME qui digitalisent leurs outils"

---

## 2. Le parcours (scroll = trajet de caméra)

```
[00%] HERO — Entrée dans la cité
        │
[15%] QUARTIER 1 — Applications métier
        │
[35%] QUARTIER 2 — Sites internet
        │
[55%] QUARTIER 3 — Automatisation
        │
[70%] TOUR CENTRALE — La méthode (4 étages = 4 étapes)
        │
[85%] LES DEUX TOURS — L'équipe (Kyllian & Anthony)
        │
[100%] PLACE CENTRALE — Contact
```

La caméra ne recule jamais : c'est un vol continu vers l'avant, jamais un aller-retour —
métaphore du "on avance avec le client, pas de mauvaise surprise" (valeur n°2 : pédagogie).

---

## 3. Section par section

### 3.1 — HERO : l'entrée dans la cité (0%)

- Vue large, caméra en hauteur, la ville s'étend à l'horizon dans le brouillard bleu nuit
- Le logo KabNetys flotte en volume au premier plan (le "KAB" 3D en relief du logo existant,
  reproduit en géométrie 3D avec le même bleu électrique et le même glow)
- Accroche : *"Des outils métier, pas des bricolages."*
- Sous-titre : la phrase d'ouverture du dossier — développement sur mesure pour TPE/PME
- Un seul CTA discret : "Découvrir" (scroll indicator), pas de bouton contact ici —
  cohérent avec "étape 1 : échange terrain" avant de vendre quoi que ce soit

### 3.2 — Quartier Applications métier (15%)

- Un bâtiment modulaire, façades qui s'assemblent comme des blocs (évoque le "sur mesure,
  pas de package figé")
- Fenêtres allumées qui dessinent des icônes simples : suivi client, devis, planning, stock
- Texte overlay : description du Service 01, cas typiques
- Petit détail interactif : au survol d'une fenêtre, elle s'éclaire plus fort (micro-interaction,
  coût de dev faible, effet perçu élevé)

### 3.3 — Quartier Sites internet (35%)

- Bâtiment plus fin, plus "vitrine" — façade vitrée qui reflète la ville (jeu de matériaux :
  verre vs béton du quartier précédent, pour bien différencier visuellement les 3 services)
- Overlay : Service 02, avec la ligne "sobres, rapides, sans CMS bricolé"
- Un signe distinctif : une enseigne lumineuse minimaliste (pas de logo tiers, juste un
  pictogramme abstrait — évite de dater visuellement le site avec des références UI 2024)

### 3.4 — Quartier Automatisation (55%)

- Zone plus "industrielle" : passerelles, câbles lumineux reliant plusieurs petits bâtiments
  entre eux (Excel ↔ Outlook ↔ logiciel métier = les câbles qui relient les blocs)
- Overlay : Service 03, avec l'exemple "3 excel = 1 appli" comme accroche visuelle forte
  (on peut littéralement montrer 3 petits blocs qui fusionnent en un seul au scroll)

### 3.5 — Tour centrale : la Méthode (70%)

- Une tour unique à 4 étages visibles, la caméra monte le long de la façade au lieu de
  la traverser horizontalement (rupture de rythme volontaire — signale "on change de sujet",
  on passe du produit à la manière de travailler)
- Chaque étage = une étape (Échange terrain → Conception → Développement itératif → Livraison)
- Détail : l'étage "développement itératif" a des fenêtres qui clignotent en cadence régulière
  (métaphore discrète des livraisons toutes les 1-2 semaines)

### 3.6 — Les deux tours : l'Équipe (85%)

- Deux tours jumelles mais visuellement distinctes, comme les deux profils
  (une plus "codée"/anguleuse pour Kyllian, une plus "réseau"/à câblages visibles pour Anthony)
- Portraits intégrés en médaillon holographique bleu (traitement graphique unifié des 2 photos
  fournies — désaturé + teinte bleu néon pour rester dans la palette, PAS de photo brute en
  couleurs naturelles qui casserait l'ambiance)
- Citations de chacun affichées au passage
- Le texte "La rencontre" apparaît entre les deux tours, sur un pont lumineux qui les relie —
  représentation directe de la complémentarité des deux profils

### 3.7 — Place centrale : Contact (100%)

- La caméra se pose, fin du vol : une place ouverte, centre lumineux de la cité
- Formulaire de contact en overlay (visuel uniquement pour l'instant, pas de backend —
  confirmé avec le client)
- Rappel discret : localisation (Ecole-Valentin), email, pas de téléphone (formulaire only)
- Dernière ligne : *"L'IA propose, on dispose."* — signature de fin de parcours

---

## 4. Navigation — on ne subit pas le scroll, on pilote la ville

Le scroll linéaire seul ne suffit pas : le visiteur doit pouvoir **se repérer et sauter**
directement à un quartier, comme sur un GPS de ville, pas juste dérouler une bobine de film.

- **Minimap persistante** (coin d'écran, toujours visible) : plan stylisé de la cité vu du
  dessus, façon "plan de métro" lumineux. Les 6 quartiers y sont représentés comme des points
  reliés par les rues/circuits. Le quartier actif est surligné en temps réel pendant le scroll.
- **Navigation directe** : cliquer un point de la minimap déclenche un travelling automatique
  (fly-to caméra, pas un cut brutal) jusqu'au quartier choisi — on garde la cohérence "vol
  continu" du concept, même en navigation non-linéaire.
- **Ancres URL par section** (`/#applications`, `/#equipe`, etc.) : lien direct partageable
  vers un quartier précis, et ça sert aussi le SEO (sections indexables individuellement).
- **Navigation clavier** : flèches haut/bas ou Tab pour passer au quartier suivant/précédent,
  sans dépendre uniquement de la molette — accessibilité et confort desktop.
- **Bouton "passer en version texte"** toujours accessible : un mode liste simple, sans 3D,
  qui reprend les ancres ci-dessus — repli accessibilité + SEO + mobile bas de gamme, le site
  3D reste l'expérience "vitrine", pas l'unique porte d'entrée.

---

## 5. Ce que ce concept résout explicitement

| Exigence du dossier entreprise | Traduction dans le concept |
|---|---|
| "Sur mesure, pas de package figé" | Bâtiments modulaires assemblés, pas de temple générique |
| "Proximité, pas d'intermédiaire" | Caméra qui avance sans détour, jamais d'écran de chargement artificiel |
| "IA propose, on dispose" | Signature finale, pas de gadget IA visible ailleurs sur le site |
| Ton direct, sans jargon | Overlay textes courts, pas de blocs de texte marketing |
| Cible TPE/PME peu geek | Repère de progression + fallback texte : jamais perdu, jamais bloqué |

---

## 6. Prochaine étape (hors scope de ce document)

Une fois ce concept validé : découpage technique (composants Three.js par quartier,
timeline GSAP ScrollTrigger, budget polygonal par section pour la perf mobile) — pris en
charge par `game-developer` + `nextjs-developer` + `performance-engineer` au moment du code.
