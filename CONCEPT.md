# KabSite3D — Concept créatif (v2 : la Vallée cinématique)

> Site vitrine scroll-driven en 3D pour KabNetys, inspiré de hubtown.co.in et sidewave.it.
> Ce document fixe l'idée avant tout code : la métaphore, le parcours, chapitre par chapitre.
>
> **Historique** : la v1 (métaphore "Cité KabNetys" à quartiers/bâtiments) a été testée et
> abandonnée — des bâtiments assemblés à partir de primitives ont besoin de proportions
> architecturales très précises pour ne pas ressembler à un diagramme de réseau flottant. Une
> vallée procédurale (terrain continu déformé) se lit naturellement comme "un vrai lieu",
> même en style stylisé — c'est le principe qui a fait le succès visuel de hubtown.co.in.

---

## 1. La métaphore : la Vallée KabNetys

Le visiteur voyage **vers l'avant, le long d'une vallée**, comme un travelling continu au fil
du récit. Ce n'est plus un site qu'on "quartier par quartier" — c'est un **voyage narratif en
6 chapitres**, chacun avec sa propre atmosphère (couleur de brume, lumière, relief du terrain).

Une seule lumière phare (point light) précède la caméra tout au long du voyage — c'est le fil
conducteur visuel : elle change de couleur à chaque chapitre, comme une guide qui traverse
différentes humeurs du récit.

**Pourquoi ce changement par rapport à la Cité (v1) :**
- Une surface continue déformée par bruit se lit immédiatement comme un terrain/paysage,
  sans effort de lecture — contrairement à des primitives empilées qui ont besoin d'un travail
  de proportion architecturale que le procédural pur ne sait pas bien restituer
- Le voyage narratif (douleur → solution → équipe → contact) colle davantage à l'histoire
  qu'on raconte qu'un simple survol géographique de "quartiers de services"
- Cohérent avec la référence explicitement demandée : hubtown.co.in (vallée + lumière qui
  se promène) et sidewave.it (interaction souris douce, jamais brutale)

---

## 2. Le parcours (scroll = voyage le long de la vallée)

```
[0-15%]   CHAPITRE 0 — L'Aube (Hero)
              │
[15-35%]  CHAPITRE 1 — La Friction (douleur du client)
              │
[35-55%]  CHAPITRE 2 — La Percée (les 3 services)
              │
[55-70%]  CHAPITRE 3 — L'Intelligence (l'approche IA)
              │
[70-85%]  CHAPITRE 4 — L'Équipe (Kyllian & Anthony)
              │
[85-100%] CHAPITRE 5 — L'Horizon (contact)
```

La caméra suit une `CatmullRomCurve3` tracée au fond de la vallée ; `scrollProgress` pilote la
position sur la courbe. Comme en v1 : jamais de recul, un seul sens de lecture.

---

## 3. Architecture technique de la scène

| Élément | Solution |
|---|---|
| Terrain | Deux `PlaneGeometry(400, 400, 200, 200)` (sol + "ciel" inversé), déplacement Y par bruit simplex (CPU, via une lib de noise npm) |
| Forme de la vallée | `Y = noise(x,z) × hauteur − profondeur × exp(−x²/largeur²)` — creux au centre, crêtes sur les côtés |
| Caméra | `CatmullRomCurve3` au fond de la vallée, position dérivée de `scrollProgress` |
| Lumière phare | `PointLight` qui reste ~30 unités devant la caméra — couleur interpolée par chapitre |
| Brume | `FogExp2`, couleur interpolée par chapitre — porte l'essentiel de l'atmosphère |
| Souris | `lookAt` de la caméra dérive doucement (±4°, lerp très lent) vers la position souris ; la lumière phare dérive aussi latéralement (±1.5 unité) ; léger displacement du terrain réactif à la souris — jamais de mouvement brutal (référence sidewave.it) |
| Matériau sol | `MeshStandardMaterial`, couleur variant selon la hauteur du vertex |

---

## 4. Les 6 chapitres — storyboard

### Chapitre 0 — L'Aube (Hero, 0–15%)
- Nuit finissante, brume violette-indigo dense, vallée étroite
- Lumière phare bleu-violet doux, halo large (lune basse)
- Sol : roches sombres, reflets mauves
- Mouvement très lent — entrée en douceur dans le voyage
- Texte : *"Pour chaque artisan, un outil sur mesure."* — émerge de la brume

### Chapitre 1 — La Friction (douleur, 15–35%)
- Brume qui épaissit, teinte rouge-bordeaux, terrain qui se craquelle
- Lumière phare vire au rouge-orangé, pulse légèrement à chaque point de douleur affiché
- Sol : crevasses, terrain tourmenté
- Texte : les points de douleur du dossier entreprise (Excel en versions multiples, erreurs
  de saisie, temps perdu à recopier, outils inadaptés) — une phrase à la fois

### Chapitre 2 — La Percée (les 3 services, 35–55%)
- La vallée s'élargit d'un coup, la brume se dissipe, teinte cyan électrique
- Lumière phare cyan brillant, avance plus vite
- Sol plus lisse, quasi cristallin, quelques reliefs géométriques
- Transition d'entrée : flash blanc
- Texte : les 3 services du dossier (Applications métier, Sites internet, Automatisation),
  une carte par service

### Chapitre 3 — L'Intelligence (approche IA, 55–70%)
- Nuit totale, pas de brume, visibilité totale, étoiles (particules fixes en hauteur)
- Lumière phare bleu électrique intense, éclaire un tunnel rocheux
- Sol noir absolu avec filaments lumineux bleu (écho direct du logo — circuits recyclés
  comme des veines dans la roche, seul reliquat visuel de la v1 "Cité")
- Texte : la position "L'IA propose, on dispose" du dossier entreprise

### Chapitre 4 — L'Équipe (70–85%)
- Heure dorée, brume chaude ambrée-orangée, vallée large et douce
- Lumière phare or-ambre, longue traîne — chaleur humaine après les chapitres froids
- Sol : terrain arrondi, couleurs chaudes
- La caméra ralentit nettement — on prend le temps de voir les gens
- Portraits de Kyllian et Anthony (traitement graphique unifié, teinté pour rester dans
  l'ambiance du chapitre plutôt qu'en couleurs naturelles brutes), avec leurs citations

### Chapitre 5 — L'Horizon (contact, 85–100%)
- Ciel étoilé pur, la vallée s'ouvre sur un panorama, lointain lumineux
- Lumière phare blanc pur, très loin — une destination atteinte
- Sol sombre mais propre, horizon lumineux
- Texte : *"Votre projet commence ici."* + formulaire de contact (visuel uniquement,
  pas de backend pour l'instant — confirmé)

---

## 5. Transitions entre chapitres

| # | Entre | Effet |
|---|---|---|
| T1 | Aube → Friction | Fondu noir scrub, la brume rouge commence à filtrer sous le noir |
| T2 | Friction → Percée | Flash blanc, la lumière phare "explose" en avant |
| T3 | Percée → Intelligence | Flash blanc |
| T4 | Intelligence → Équipe | Overlay doré progressif derrière le texte ("mais derrière l'IA, il y a nous") |
| T5 | Équipe → Horizon | La lumière phare converge puis explose |
| T6 | Horizon → fin | Vague noire puis clarté |

---

## 6. Navigation — inchangée dans son principe, adaptée aux chapitres

Le principe validé en v1 reste : le visiteur doit pouvoir se repérer et sauter directement à
un chapitre, pas seulement dérouler le scroll de façon linéaire.

- **Minimap persistante** : les 6 chapitres comme points sur un tracé (au lieu du plan de
  métro "quartiers", un profil de vallée stylisé) ; chapitre actif surligné en temps réel
- **Navigation directe** : cliquer un point déclenche un scroll animé, jamais un cut brutal
- **Ancres URL par chapitre** (`/#friction`, `/#equipe`, etc.) — partage direct + SEO
- **Navigation clavier** : flèches haut/bas pour chapitre suivant/précédent
- **Bouton "Version texte"** toujours accessible, reprend les mêmes ancres — accessibilité,
  SEO, repli mobile bas de gamme

---

## 7. Ce que ce concept résout explicitement

| Exigence du dossier entreprise | Traduction dans le concept |
|---|---|
| "Sur mesure, pas de package figé" | Chapitre 0 : "Pour chaque artisan, un outil sur mesure" en accroche direct |
| "Proximité, pas d'intermédiaire" | Voyage continu, jamais d'écran de chargement artificiel |
| "IA propose, on dispose" | Chapitre 3 dédié entièrement à cette position |
| Ton direct, sans jargon | Textes courts, une phrase par écran, jamais un bloc |
| Cible TPE/PME peu geek | Minimap + fallback texte : jamais perdu, jamais bloqué |
| Complémentarité des 2 associés | Chapitre 4 : heure dorée, ralenti volontaire, chaleur humaine |

---

## 8. Contrainte technique constante

Tout reste procédural (bruit + géométrie + shaders), aucun asset 3D externe ni photo réaliste
importée telle quelle — cohérent avec le positionnement "sobre et rapide" et la contrainte de
performance mobile déjà validée. Les photos de Kyllian et Anthony seront traitées
graphiquement (teinte, désaturation) pour s'intégrer à l'ambiance de chaque chapitre plutôt
que d'être insérées brutes.

---

## 9. Prochaine étape (hors scope de ce document)

Réécriture complète de la scène existante : remplacement des composants "Cité" (districts,
bâtiments procéduraux) par le nouveau système de terrain/vallée, conservation du système de
navigation (minimap, ancres, clavier, fallback WebGL/texte, prefers-reduced-motion) adapté aux
6 chapitres. Pris en charge par `game-developer` + `performance-engineer`.
