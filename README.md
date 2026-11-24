# Agenzio : page de vente « 1 site, 1 semaine, 1000 € »

Page statique (HTML, CSS, JS), sans build. GSAP, ScrollTrigger, Lenis et les polices sont hébergés dans le dépôt.

Voir en local :

```bash
python3 -m http.server 8000
```

## Fichiers
- `index.html` : la page (SEO, JSON-LD Organization + Service + FAQPage, Open Graph, modales légales)
- `css/style.css` : styles et intro du hero en CSS
- `js/main.js` : **réglages en haut du fichier** (`CRENEAUX_RESTANTS`, `FIN_OFFRE`, `BANDEAU_ROTATION_MS`, `FORM_ENDPOINT`, `WEB3FORMS_ACCESS_KEY`), puis les animations
- `js/gsap.min.js`, `js/ScrollTrigger.min.js` (GSAP 3.12.5), `js/lenis.min.js` (Lenis 1.1.13) : en local
- `fonts/` : Archivo variable (graisse + largeur) et Inter variable, en local
- `img/` : captures des sites démo (agenz-io.github.io) pour le hero, les réalisations et l'avant/après, en WebP
- `.htaccess` : compression gzip et cache pour un hébergement Apache

## Mettre à jour au quotidien
- Créneau pris : `const CRENEAUX_RESTANTS = 3;` dans `js/main.js` (0 affiche « Décembre complet »)
- Témoignages réels reçus : retirer `is-hidden` sur `<section class="... testimonials is-hidden">` et remplacer les textes
- Prix « à partir de 1 490 € » des autres services : dans `index.html`, bandeau du haut, bloc « Pour aller plus loin », formulaire, FAQ (+ JSON-LD), CGV et meta description
- Après modification du CSS ou du JS : incrémenter `?v=` dans `index.html` (actuellement `style.css?v=5`, `main.js?v=4`)

## Lighthouse mobile (simulation 4G lente, Chrome headless)
| Serveur | Perf | Access. | Bonnes pratiques | SEO | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| Avec gzip + cache (comme un vrai hébergeur) | 97-98 | 100 | 100 | 100 | 0,8 s | 2,4 s | 30-110 ms | 0 |
| Sans compression (serveur Python basique) | 91 | 100 | 100 | 100 | 1,2 s | 3,5 s | 50 ms | 0 |

## Avant mise en ligne
**Bloquant**
- Formulaire : `[FORM_ENDPOINT]` dans `js/main.js` **et** l'attribut `action` du `<form>` (+ clé Web3Forms si Web3Forms). Sans ça, aucune demande n'arrive.
- Domaine : le site déclare `https://www.agenzio.fr/` (canonical, Open Graph, JSON-LD, `robots.txt`, `sitemap.xml`). Soit on pointe ce domaine vers GitHub Pages (fichier `CNAME` + DNS), soit on remplace par l'adresse finale.
- Mentions légales et CGV : adresse de l'entreprise, mention TVA.

**À valider (CGV, FAQ)**
- Modalités de paiement (proposition : 50 % à la commande, 50 % à la mise en ligne), politique d'annulation/insatisfaction, tarif des modifications supplémentaires
- FAQ : aide à la rédaction incluse ?, outil d'édition fourni ?, zone d'intervention
- Relecture des CGV par un professionnel du droit
- Témoignages : section masquée (`is-hidden`) tant qu'il n'y en a pas de réels

`grep -n "\[À\|\[FORM_ENDPOINT\]" index.html js/main.js` liste tout ce qui reste.
