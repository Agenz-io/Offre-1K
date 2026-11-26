# Agenzio : page de vente « 1 site, 1 semaine, 1000 € »

Page statique (HTML, CSS, JS), sans build. GSAP, ScrollTrigger, Lenis et les polices sont hébergés dans le dépôt.

Voir en local :

```bash
python3 -m http.server 8000
```

## Fichiers
- `index.html` : la page (SEO, JSON-LD Organization + Service + FAQPage, Open Graph, modales légales)
- `css/style.css` : styles et intro du hero en CSS
- `js/main.js` : **réglages en haut du fichier** (`SLOTS_LEFT`, `OFFER_END`, `CALENDLY_URL`, `PHONE`, `OFFER_END_DATE`, `FORM_ENDPOINT`, `WEB3FORMS_ACCESS_KEY`), injectés partout dans la page, puis les animations
- `js/gsap.min.js`, `js/ScrollTrigger.min.js` (GSAP 3.12.5), `js/lenis.min.js` (Lenis 1.1.13) : en local
- `fonts/` : Archivo variable (graisse + largeur) et Inter variable, en local
- `img/` : captures des sites démo (agenz-io.github.io) pour le hero, les réalisations et l'avant/après, en WebP
- `.htaccess` : compression gzip et cache pour un hébergement Apache

## Mettre à jour au quotidien
- Créneau pris : `const SLOTS_LEFT = 3;` dans `js/main.js` (0 affiche « Décembre complet »)
- Suivi des sources : ajouter `?src=linkedin`, `?src=youtube`, `?src=mail`… au lien partagé ; la valeur arrive dans l'e-mail Web3Forms et dans Calendly (utm_source)
- Témoignages réels reçus : retirer `is-hidden` sur `<section class="... testimonials is-hidden">` et remplacer les textes
- Après modification du CSS ou du JS : incrémenter `?v=` dans `index.html` (actuellement `style.css?v=9`, `main.js?v=7`)

## Lighthouse mobile (simulation 4G lente, Chrome headless)
| Serveur | Perf | Access. | Bonnes pratiques | SEO | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| Avec gzip + cache (comme un vrai hébergeur) | 97-98 | 100 | 100 | 100 | 0,8 s | 2,4 s | 30-110 ms | 0 |
| Sans compression (serveur Python basique) | 91 | 100 | 100 | 100 | 1,2 s | 3,5 s | 50 ms | 0 |

## En ligne
- Adresse : https://agenz-io.github.io/Offre-1K/ (page de vente temporaire)
- Non indexée par Google (`<meta name="robots" content="noindex, follow">`), aperçu de partage (image 1200×630) actif
- Formulaire : Web3Forms, réception sur contact@agenzio.fr ; popup Calendly chargé au premier clic seulement
- Le jour d'un passage sur agenzio.fr : remplacer `https://agenz-io.github.io/Offre-1K/` dans `index.html`, `robots.txt` et `sitemap.xml`, et retirer `noindex` si la page doit être trouvée sur Google
- Conseillé : faire relire les CGV par un professionnel du droit
- Témoignages : section masquée (`is-hidden`) tant qu'il n'y en a pas de réels
