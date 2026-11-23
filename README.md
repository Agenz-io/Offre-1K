# Agenzio : page de vente « 1 site, 1 semaine, 1000 € »

Page statique (HTML, CSS, JS), sans build. GSAP, ScrollTrigger, Lenis et les polices sont hébergés dans le dépôt.

Voir en local :

```bash
python3 -m http.server 8000
```

## Fichiers
- `index.html` : la page (SEO, JSON-LD Organization + Service + FAQPage, Open Graph, modales légales)
- `css/style.css` : styles et intro du hero en CSS
- `js/main.js` : **réglages en haut du fichier** (`CRENEAUX_RESTANTS`, `FIN_OFFRE`, `CALENDRIER_URL`, `FORM_ENDPOINT`, `WEB3FORMS_ACCESS_KEY`, `TELEPHONE`), puis les animations
- `js/gsap.min.js`, `js/ScrollTrigger.min.js` (GSAP 3.12.5), `js/lenis.min.js` (Lenis 1.1.13) : en local
- `fonts/` : Archivo variable (graisse + largeur) et Inter variable, en local
- `img/` : captures des 6 sites démo (agenz-io.github.io) + photos Unsplash pour le hero et l'avant/après, en WebP
- `.htaccess` : compression gzip et cache pour un hébergement Apache

## Mettre à jour au quotidien
- Créneau pris : `const CRENEAUX_RESTANTS = 3;` dans `js/main.js` (0 affiche « Décembre complet »)
- Témoignages réels reçus : retirer `is-hidden` sur `<section class="... testimonials is-hidden">` et remplacer les textes
- Après modification du CSS ou du JS : passer `?v=1` à `?v=2` dans `index.html`

## Lighthouse mobile (simulation 4G lente, Chrome headless)
| Serveur | Perf | Access. | Bonnes pratiques | SEO | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| Avec gzip + cache (comme un vrai hébergeur) | 97-98 | 100 | 100 | 100 | 0,8 s | 2,4 s | 30-110 ms | 0 |
| Sans compression (serveur Python basique) | 91 | 100 | 100 | 100 | 1,2 s | 3,5 s | 50 ms | 0 |

## Placeholders restants (`grep "\[À" index.html js/main.js`)
**Offre**
- [À VALIDER : fiche Google Business créée et optimisée incluse ? oui/non]
- [À COMPLÉTER : ~X €/an] (hébergement + domaine, 3 endroits)
- [À COMPLÉTER : prix] (maintenance/mois et offre premium « à partir de », 4 endroits)
- [À COMPLÉTER : tarif] (modifications au-delà de l'aller-retour, CGV)
- [À COMPLÉTER : HT ou TTC, modalités de paiement]

**FAQ / politique**
- [À VALIDER : aide à la rédaction incluse ?]
- [À VALIDER : outil d'édition simple fourni ? oui/non]
- [À VALIDER : politique en cas d'insatisfaction] et [À VALIDER : politique] (CGV)
- [À VALIDER : zone d'intervention]

**Marque, personne**
- [À VALIDER : orthographe définitive Agenzio / Agencio] (commentaire en tête de `index.html`)
- [À COMPLÉTER : photo portrait] et [À VALIDER : texte de présentation]

**Réalisations**
- ~~Captures, liens et villes des réalisations~~ : fait, 6 démos agenz-io.github.io branchées
- [À COMPLÉTER : vraie réalisation avant/après]
- [À COMPLÉTER : remplacer par vos propres visuels]
- Témoignages : [TÉMOIGNAGE CLIENT À RÉCUPÉRER] et [Nom, métier, ville] ×3 (section masquée)

**Branchements techniques**
- [À COMPLÉTER : URL Cal.com ou Calendly] (`CALENDRIER_URL`)
- [FORM_ENDPOINT] (dans `js/main.js` ET dans l'attribut `action` du formulaire) + [À COMPLÉTER : clé Web3Forms]
- [À COMPLÉTER : téléphone] (`TELEPHONE`, footer, JSON-LD)
- [À COMPLÉTER : URL définitive du site] (canonical, og:url, JSON-LD : actuellement www.agenzio.fr)
- [À COMPLÉTER : image de partage 1200×630 dans img/og-image.jpg]

**Légal**
- [À COMPLÉTER : SIRET], [À COMPLÉTER : e-mail], [À COMPLÉTER : e-mail de contact], [À COMPLÉTER : e-mail, téléphone]
- [À COMPLÉTER : forme juridique, adresse]
- [À COMPLÉTER : nom, adresse et téléphone de l'hébergeur]
- [À COMPLÉTER : Web3Forms ou Formspree], [À COMPLÉTER : Cal.com ou Calendly], [À COMPLÉTER : durée] (confidentialité)
- [À COMPLÉTER : CGV complètes, à faire relire]
