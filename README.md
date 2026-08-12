<div align="center">
  <img src="docs/app-icon.png" width="120" height="120" alt="Facture. icon" />

  # Facture.

  Générateur de factures rapide, élégant et 100 % privé — dans le navigateur ou en app de bureau.

</div>

<div style="display:flex; gap:1rem; flex-wrap:wrap;">
  <img src="docs/dashboard.png" alt="Tableau de bord" style="width:49%;" />
  <img src="docs/editor.png" alt="Éditeur de facture" style="width:49%;" />
</div>


## À propos

**Facture.** est une application de facturation pensée pour les indépendants et petites structures : on remplit une facture, on l'ajuste visuellement, on l'exporte en PDF. Tout est stocké en local (`localStorage`), il n'y a ni compte, ni serveur, ni base de données — les seuls appels externes sont ceux que vous configurez vous-même (envoi d'e-mail SMTP, liens de paiement Stripe/PayDunya/PayPal).

## Fonctionnalités

- **Édition en temps réel** — formulaire à gauche, aperçu fidèle au PDF à droite, mis à jour instantanément.
- **Export PDF vectoriel** — généré avec jsPDF.
- **3 mises en page** (éditorial, minimal, bold) et une couleur d'accent par facture, appliquées identiquement à l'écran et au PDF.
- **Sections à la carte** — logo, coordonnées, colonnes du tableau, remise, retenue à la source, signature, notes de bas de page : chaque bloc peut être affiché ou masqué.
- **Signature** — dessinée à la main (canvas) ou importée en image.
- **Éditeur de texte riche** pour la description des lignes (gras, italique, listes).
- **Retenue à la source** distincte de la TVA (calcul `brut × (1 − taux)`), en plus de la TVA classique.
- **Tableau de bord** — recherche, filtres par statut (brouillon, envoyée, payée, en retard, annulée), vues grille/liste.
- **Dupliquer, renommer, suivre le statut, annuler/rétablir** chaque facture.
- **Export / import** de toutes les factures en JSON (sauvegarde complète) ou CSV (tableur).
- **Paramètres** — thème clair/sombre/système, préférences par défaut pour les nouvelles factures (devise, langue, taux de TVA, mise en page).
- **Envoi par e-mail** directement depuis l'app via votre propre compte SMTP (app de bureau), avec objet/corps personnalisables et pièce jointe PDF.
- **Liens de paiement en ligne** (Stripe, PayDunya, PayPal) générés par facture, avec vérification du statut de paiement en un clic (met à jour automatiquement le statut de la facture).
- **Application de bureau** (macOS, avec support Windows/Linux via Tauri) en plus de la version web.

## Stack technique

- [Vue 3](https://vuejs.org/) (`<script setup>`) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) 7
- [Tailwind CSS](https://tailwindcss.com/) v4
- [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) pour la génération PDF
- [Tiptap](https://tiptap.dev/) pour l'édition de texte riche
- [Lucide](https://lucide.dev/) pour les icônes
- [Tauri](https://tauri.app/) v2 pour l'application de bureau (SMTP via `lettre`, paiements via `reqwest`, secrets via `keyring`)
- [Vitest](https://vitest.dev/) pour les tests

## Installation

### Prérequis

- [Node.js](https://nodejs.org/) 22+
- npm

### Développement (web)

```bash
git clone https://github.com/flrxnt/factures.git
cd factures
npm install
npm run dev
```

L'application est servie sur `http://localhost:5173`.

### Build web (production)

```bash
npm run build
npm run preview
```

Le résultat statique (`dist/`) peut être déployé sur n'importe quel hébergeur (Vercel, Netlify, Coolify, etc.) — c'est une pure application client, aucun serveur applicatif requis.

## Application de bureau

Facture. peut aussi être empaquetée en application native via [Tauri](https://tauri.app/), sur **macOS**, **Windows** et **Linux**.

### Prérequis supplémentaires

- [Rust](https://www.rust-lang.org/tools/install) (`rustup`)
- macOS : Xcode Command Line Tools
- Windows : [Microsoft C++ Build Tools](https://tauri.app/start/prerequisites/#windows) (via Visual Studio)
- Linux : dépendances webkit2gtk — voir le [guide officiel Tauri](https://tauri.app/start/prerequisites/#linux)

### Lancer en mode développement

```bash
npm run dev:desktop
```

### Construire l'application installable

```bash
npm run build:desktop
```

Cette commande compile pour l'OS courant (Tauri ne fait pas de cross-compilation) :

| OS | Sortie |
| --- | --- |
| macOS | `src-tauri/target/release/bundle/macos/Facture.app` et `bundle/dmg/*.dmg` |
| Windows | `src-tauri/target/release/bundle/msi/*.msi` (à builder depuis Windows) |
| Linux | `src-tauri/target/release/bundle/deb/*.deb` et `bundle/appimage/*.AppImage` (à builder depuis Linux) |

> Pour distribuer sur Windows ou Linux, il faut lancer `npm run build:desktop` depuis une machine (ou CI) de cet OS — seul le build macOS a été testé dans ce dépôt à ce jour.

L'app n'étant pas signée (pas de compte développeur Apple/Microsoft), le premier lancement peut nécessiter de contourner Gatekeeper (macOS : clic droit → Ouvrir) ou SmartScreen (Windows : "Informations complémentaires" → "Exécuter quand même").

## Tests

```bash
npx vitest run
```

## Confidentialité

Aucune donnée saisie (informations client, montants, signature) ne transite par un serveur tiers : tout reste dans le stockage local du navigateur ou de l'application. Seules exceptions, et uniquement si vous les configurez : l'envoi d'e-mail (via votre propre serveur SMTP) et la génération de liens de paiement (via l'API de Stripe/PayDunya/PayPal) — les identifiants correspondants sont alors stockés dans le trousseau macOS, jamais en clair. Le bouton *Exporter (JSON)* permet de sauvegarder l'ensemble de ses factures pour les transférer ou les archiver.

## Licence

MIT