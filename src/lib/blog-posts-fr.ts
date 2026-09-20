// ─── Blog en français ───
// The French blog lives at /fr/blog/<slug> — deliberately the same slug as the
// English post so the hreflang pairing stays trivially correct, exactly like
// the Bengali and Hindi sides.
// These are real translations (not machine-swapped labels): they render as
// static, server-side HTML so Google indexes French text for French searches.
// Add new posts here newest-first, exactly like `blog-posts.ts`.

import type { BlogPost } from "./blog-posts";
import { assertSlugsMatchLocale } from "./blog-translated-slugs";

const FR_MONTHS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

/** 2026-09-18 → 18 septembre 2026 (no Intl, so the server output is stable). */
export function formatFrenchDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return `${day} ${FR_MONTHS[month - 1]} ${year}`;
}

export const BLOG_POSTS_FR: BlogPost[] = [
  {
    slug: "how-to-write-adobe-stock-titles-that-rank",
    title: "Comment rédiger des titres Adobe Stock qui se classent vraiment",
    description:
      "Votre titre est le signal de classement le plus puissant sur Adobe Stock. Voici la formule qu'utilisent les meilleurs contributeurs — avec de vraies réécritures avant/après à copier.",
    date: "2026-09-18",
    readingTime: "6 minutes de lecture",
    tags: ["Adobe Stock", "Titres", "SEO", "Mots-clés"],
    body: `Sur Adobe Stock, le titre n'est pas une simple étiquette — c'est le signal de classement le plus lourd de votre actif. Deux images presque identiques peuvent être séparées de plusieurs pages dans les résultats de recherche uniquement par la façon dont leurs titres sont rédigés. La bonne nouvelle : écrire un titre qui se classe est une formule, pas un talent. Voici la formule.

## La formule essentielle

> **[Sujet] + [en train de quoi] + [où/quand] + [style/technique], avec votre mot-clé le plus important en premier.**

Les propres consignes d'Adobe Stock disent que les titres doivent décrire l'image comme le ferait un collègue au téléphone — et leur moteur de recherche récompense les titres qui placent le sujet littéral en tête. Un titre qui se classe est :

- **Descriptif, pas décoratif** — il dit ce qui se trouve *dans* le cadre
- **Dense en mots-clés mais humain** — l'acheteur doit le lire comme une phrase
- **70 à 130 caractères** — assez long pour se classer, assez court pour rester net
- **Sans mots de remplissage** — ni « magnifique », « incroyable », « haute qualité », « meilleur »

## De vraies réécritures avant/après

**❌ Avant :**
> « Beau merveilleux équipe business travaillant dur dans bureau moderne pour le succès »

**✅ Après :**
> « Équipe business collaborant autour d'un ordinateur portable dans un bureau moderne lumineux, concept de travail d'équipe et planification financière »

Pourquoi ça gagne : commence par le mot-clé exact (« équipe business »), nomme l'action (« collaborant »), le décor (« bureau moderne ») et termine par des concepts d'intention d'achat (« travail d'équipe », « planification financière »). Zéro remplissage.

---

**❌ Avant :**
> « Paysage coucher de soleil fond d'écran 4K »

**✅ Après :**
> « Coucher de soleil doré sur l'horizon calme de l'océan avec des nuages dramatiques, paysage côtier serein, espace pour texte »

Pourquoi ça gagne : « paysage coucher de soleil » n'apprenait presque rien au moteur. La réécriture ajoute le sujet précis (horizon océan), l'ambiance (serein) et un cas d'usage que les acheteurs cherchent vraiment (espace pour texte).

---

**❌ Avant :**
> « Innovation technologique transformation digitale concept futur »

**✅ Après :**
> « Bras robotique IA futuriste assemblant une carte électronique dans une usine high-tech, concept d'automatisation et industrie 4.0 »

Pourquoi ça gagne : les titres à concepts abstraits ne se classent pour rien. La réécriture nomme les objets visibles (bras robot, carte électronique, usine) — exactement ce dont le moteur de correspondance a besoin — puis accroche les concepts par-dessus.

## Les règles derrière les réécritures

1. **Les 3–5 premiers mots = vos mots-clés de classement.** Le moteur pèse le début du titre le plus lourd. N'ouvrez jamais par « Un », « Une » ou un adjectif.
2. **Nommez ce qui est visible.** Si un humain regardant l'image ne dirait pas le mot, le moteur ne devrait pas se classer pour ce mot. Les concepts viennent *après* la description littérale.
3. **Un titre, un sujet.** N'entassez pas trois scènes dans un titre — l'algorithme ne peut pas dire ce que l'actif *est*, donc il ne se classe pour rien.
4. **Terminez par des cas d'usage.** « Espace pour texte », « fond de bannière », « bannière web », « template réseaux sociaux » sont constamment recherchés et presque jamais utilisés en ouverture.
5. **Accordez vos premiers mots-clés.** La phrase d'ouverture du titre doit réapparaître comme vos 2–3 premiers mots-clés. La cohérence entre champs se lit comme de la pertinence.

## Les mots de remplissage qui tuent le classement

On les retrouve dans des milliers de titres rejetés ou enterrés : *magnifique, incroyable, génial, époustouflant, haute qualité, meilleur, super, très, vraiment, hd, 4k, fond d'écran* (comme descripteur), *photo de, image de, picture of*.

Chaque mot de remplissage gaspille des caractères que le moteur pourrait utiliser pour la correspondance. Si supprimer un mot ne change rien pour la recherche d'un acheteur, supprimez-le.

## Noter vos propres titres

Le moyen le plus rapide d'intégrer tout cela est le feedback mécanique. Collez un brouillon dans un scoreur (le Title Optimizer de StockPulse donne une note de A+ à F avec détection des mots de remplissage et carte de poids des caractères), corrigez ce qu'il signale, et re-notez. Après une douzaine de cycles, vous écrirez des titres à 90+ par instinct.

## Le titre n'est que la moitié du duo

Un titre parfait avec des mots-clés paresseux sous-performe quand même — les deux champs sont lus ensemble. La phrase d'ouverture du titre doit être votre mot-clé n°1, les concepts du titre doivent apparaître dans votre liste de mots-clés, et rien ne doit se contredire. Écrivez d'abord le titre, puis dérivez l'ordre des mots-clés — pas l'inverse.

Rédigez le titre comme si le match en dépendait — car sur Adobe Stock, c'est le cas.`,
  },
  {
    slug: "how-many-keywords-stock-photo-adobe-stock",
    title: "Combien de mots-clés pour une photo stock ? (Bonnes pratiques Adobe Stock)",
    description:
      "La limite de 49 mots-clés est un piège si vous la remplissez aveuglément. Voici comment le nombre, l'ordre et la précision des mots-clés affectent réellement votre classement sur Adobe Stock (et Shutterstock).",
    date: "2026-09-18",
    readingTime: "5 minutes de lecture",
    tags: ["Mots-clés", "Adobe Stock", "SEO"],
    body: `Demandez à dix contributeurs combien de mots-clés il faut pour une photo stock et vous obtiendrez dix réponses. Les plateformes n'aident pas — Adobe Stock en autorise jusqu'à 49, Shutterstock jusqu'à 50, et aucune des deux n'explique comment ce nombre change votre visibilité. Voici ce qui compte vraiment.

## La réponse courte

**35 à 45 mots-clés pour Adobe Stock, les 10 premiers choisis comme s'ils étaient les seuls à exister.** En dessous d'environ 25 mots-clés, vous laissez de la découvrabilité sur la table. Au-delà d'environ 49, vous ne faites que du remplissage — et le remplissage peut activement vous nuire.

## Pourquoi l'ordre bat le nombre

Le moteur d'Adobe Stock pondère vos mots-clés selon leur position. Le premier mot-clé porte le plus de poids de classement, le dixième beaucoup moins, et le mot-clé n°40 est presque décoratif. Conséquence pratique que la plupart des contributeurs ignorent :

> Vos 10 premiers mots-clés doivent être les phrases exactes que taperait un acheteur — pas des variantes astucieuses.

Si votre photo est un chiot golden retriever endormi dans une pièce ensoleillée, les premiers mots-clés doivent être *golden retriever, chiot, chien, endormi, mignon* — pas *adorable, animal domestique, compagnon canin, bébé à fourrure*.

## La pyramide des mots-clés

Un actif bien mot-clé possède trois couches :

1. **Sujet central (1–8) :** la chose littérale dans le cadre — objets, personnes, actions. Ils correspondent aux recherches des acheteurs 1:1.
2. **Contexte et attributs (9–25) :** décor, ambiance, couleurs, style, composition — *coucher de soleil, plage, tropical, vacances, horizontal*.
3. **Concepts et cas d'usage (26–45) :** ce que l'image *signifie* — *liberté, nouveau départ, voyage d'été, espace pour texte, fond de bannière*. Ces termes de longue traîne ont moins de concurrence et accumulent silencieusement des téléchargements pendant des années.

Sauter la troisième couche est l'erreur la plus courante. Les mots-clés conceptuels sont ce qui permet à une simple photo de plage de se vendre pendant dix ans.

## Quand le « plus » devient « pire »

Le bourrage de mots-clés est détectable — et se retourne contre vous :

- **Les mots-clés hors sujet** violent les consignes des plateformes et peuvent faire rejeter des actifs ou signaler des comptes.
- **Le remplissage par variantes** (*chien, chiens, toutou, doggy*) dilue votre signal de classement au lieu de le renforcer.
- **Le spam mono-mot** dans les champs à mot-clé unique (le fonctionnement de Shutterstock) passe pour du bruit auprès du moteur.

Si un mot-clé n'aide pas un acheteur à *trouver* ou *choisir* votre image, il n'a pas sa place dans la liste.

## Les chiffres exacts par plateforme

| Plateforme | Recommandé | Limite stricte | Remarques |
| --- | --- | --- | --- |
| Adobe Stock | 35–45 | 49 | L'ordre compte ; les 10 premiers portent le plus de poids |
| Shutterstock | 25–50 | 50 | Mots-clés saisis un par un ; l'ordre compte moins |
| Freepik | 15–30 | 30 | Moins de termes, plus précis |
| Vecteezy | 15–25 | 15+ | Sujet d'abord |

## Faire cela à grande échelle

Écrire à la main 40 mots-clés ordonnés par fichier, c'est là que la plupart des contributeurs abandonnent — et où la qualité s'effondre. Un générateur de métadonnées IA qui *comprend la hiérarchie* (sujet → contexte → concept) et ordonne les mots-clés en conséquence change complètement l'équation. Générez le brouillon automatiquement, puis consacrez vos 30 secondes à relire le top 10 — c'est le 80/20 des métadonnées stock en 2026.

Les contributeurs qui traitent les mots-clés comme un système de classement — pas comme une corvée — sont ceux dont les envois vieux d'un an se vendent encore chaque semaine.`,
  },
  {
    slug: "seasonal-stock-content-upload-timing",
    title: "Contenu stock saisonnier : envoyez 3 mois à l'avance ou perdez la saison",
    description:
      "Les acheteurs cherchent le contenu de Noël en octobre et la Saint-Valentin en décembre. Voici le calendrier d'envoi complet que les contributeurs microstock devraient suivre, et pourquoi les envois tardifs ne valent rien.",
    date: "2026-09-18",
    readingTime: "5 minutes de lecture",
    tags: ["Saisonnier", "Stratégie", "Adobe Stock"],
    body: `Chaque année, des milliers de contributeurs envoient leurs meilleures images de Noël en décembre — et n'en tirent presque rien. Non pas parce que le contenu est mauvais, mais parce qu'ils ont déjà raté toute la fenêtre d'achat. Le stock saisonnier est un jeu d'avance, et l'avance est plus longue que vous ne le pensez.

## Pourquoi les acheteurs magasinent des mois à l'avance

Ceux qui achètent du stock ne sont pas des consommateurs — ce sont des designers, des marketeurs et des agences préparant des campagnes qui lancent *pendant* la fête. Une campagne de vente de Noël doit avoir ses visuels approuvés, imprimés et distribués avant le 1er décembre. Cela signifie que les designers cherchent et téléchargent des images de Noël en **octobre** — parfois en septembre.

Quand la fête arrive, les achats sont terminés. Le volume de recherche que vous voyez en décembre, ce sont les procrastinateurs ; le vrai argent a changé de mains des semaines plus tôt.

## Le calendrier de travail

Envoyez votre contenu environ **3 à 4 mois avant l'événement**. En remontant l'année :

- **Septembre–octobre** → Noël, Nouvel An, fêtes d'hiver
- **Octobre–novembre** → Saint-Valentin, visuels de Saint-Valentin
- **Décembre–janvier** → Pâques, printemps, Saint-Patrick
- **Février** → Fête des mères, Fête des pères, remise des diplômes
- **Mai–juin** → rentrée scolaire, concepts d'Halloween
- **Juin–juillet** → Action de grâce, Black Friday, Diwali
- **Août** → calendriers du Nouvel An de l'année suivante et contenu « 2027 » (oui, aussi tôt)

## N'ignorez pas les micro-célébrations

Les grandes fêtes sont un champ de bataille — des millions d'actifs concurrents. L'argent intéressant est dans les petites célébrations :

- **Journée mondiale des emojis, Journée nationale du café, Journée internationale du chat**
- **Jour de la Terre, Mois de la santé mentale, Journée mondiale de l'eau**

Elles ont une vraie demande d'acheteurs (les campagnes de sensibilisation ont besoin de visuels chaque année) pour une fraction de la concurrence. Un calendrier des célébrations — comme l'outil Événements de StockPulse — suffit pour bâtir un plan de contenu annuel.

## L'effet cumulatif

Les actifs saisonniers ne se vendent pas qu'une fois. Chaque année, votre set d'Halloween 2024 concurrence à nouveau en 2025 — fort de deux ans de téléchargements, d'avis et d'historique de recherche. Le contenu saisonnier ancien et bien mot-clé est une rente. Le contenu saisonnier neuf envoyé en retard est un ticket de loterie.

## Le flux de travail pratique

1. **Consultez le calendrier** pour les événements à 3–4 mois
2. **Recherchez les mots-clés** de ces événements maintenant (regardez ce qui s'est classé l'an dernier — tout est dans les résultats de recherche)
3. **Créez et envoyez tôt** — septembre pour Noël, pas novembre
4. **Actualisez chaque année** — mettez à jour les chiffres (« 2027 » au lieu de « 2026 »), renvoyez des variantes des best-sellers de l'an dernier

Les contributeurs qui gagnent régulièrement en novembre sont ceux qui ont travaillé en juillet. Le stock saisonnier, ce n'est pas travailler plus — c'est travailler *plus tôt* que tout le monde.`,
  },
  {
    slug: "ai-generated-content-rules-stock-platforms",
    title: "Contenu généré par IA sur les plateformes stock : les règles 2026 qui comptent vraiment",
    description:
      "Adobe Stock accepte l'IA, Getty l'interdit, Shutterstock tergiverse. Un décryptage en langage clair de la politique IA de chaque grande plateforme — et comment rester conforme.",
    date: "2026-09-18",
    readingTime: "6 minutes de lecture",
    tags: ["Contenu IA", "Règles", "Adobe Stock"],
    body: `L'imagerie générée par IA est passée de curiosité à un tiers des nouveaux envois stock en deux ans environ. Les réponses des plateformes vont de l'enthousiasme à l'hostilité — et les règles ne cessent de bouger. Voici l'état des lieux, et la liste de conformité qui protège votre compte sur chaque plateforme.

## Plateforme par plateforme

**Adobe Stock — Accepte l'IA, avec des règles strictes.** La plus grande place de marché friendly-IA exige :

- De marquer les envois comme **« Créé avec une IA générative »** pendant l'envoi
- Une désignation **« illustration »** (jamais envoyé comme photo/vidéo)
- **Aucune vraie personne, vrai lieu ou élément de marque déposée** dans l'image
- Une **décharge de modèle** seulement si la personne représentée est indiscernable d'une vraie personne
- Le respect de leurs **consignes de contenu** pour l'IA générative (pas de deepfakes, pas de contenu offensant)

**Getty Images / iStock — Rejette totalement l'IA.** N'y soumettez pas de contenu IA, point. Ils ont bâti leur marque sur la provenance et la certitude de licence.

**Shutterstock — Accepte l'IA via ses propres outils** et a des accords de licence avec des entreprises d'IA ; les envois IA directs des contributeurs ont été restreints. Vérifiez leurs conditions contributeur actuelles avant d'envoyer — cette politique a changé plus d'une fois.

**Freepik, Vecteezy, Pond5** — Freepik et Vecteezy acceptent le contenu IA avec des exigences d'étiquetage. Pond5 (orienté vidéo) suit une approche d'étiquetage similaire. Cochez toujours la case de divulgation IA si elle existe — le mauvais étiquetage est le moyen le plus rapide d'être rejeté.

## La liste de conformité universelle

Quelle que soit la plateforme friendly-IA où vous envoyez, ces cinq règles vous évitent les ennuis :

1. **Étiquetez.** Chaque plateforme acceptant l'IA exige la divulgation. Une case « IA » existe quelque part dans le flux d'envoi — trouvez-la et utilisez-la.
2. **Pas de vraies personnes sans décharge.** Un visage IA photoréaliste compte quand même comme une personne reconnaissable. Gardez les visages stylisés, génériques ou clairement illustrés — ou fournissez des décharges quand la plateforme le permet.
3. **Pas de marques, logos ou monuments.** Les modèles IA adorent générer de faux swoosh Nike et des iPhones. Recadrez, retouchez ou reformulez avant l'envoi — le rejet pour marque déposée est la raison n°1 de rejet du contenu IA.
4. **Corrigez les artefacts.** Mains à six doigts, texte déformé, géométrie impossible. Les relecteurs rejettent sur la qualité technique, comme en photographie.
5. **Des métadonnées comme tout autre actif.** Le contenu IA se bat selon les mêmes règles de recherche — titres précis, mots-clés honnêtes, catégories correctes.

## Les inconvénients honnêtes dont personne ne parle

- **Saturation.** Le contenu IA générique inonde chaque niché à l'heure. Se démarquer exige des concepts et des séries, pas de jolis rendus isolés.
- **Confiance des acheteurs.** Certains acheteurs entreprises filtrent le contenu IA. Vos actifs non-IA restent votre portfolio de crédibilité.
- **Dérive des règles.** Elles changent chaque trimestre. Relisez les consignes contributeur de chaque plateforme tous les quelques mois — surtout celles de Shutterstock.

## Où l'IA aide vraiment

Les contributeurs qui réussissent le mieux avec l'IA la traitent comme un *accélérateur de production dans un flux piloté par l'humain* : générez des brouillons, triez sans pitié (n'envoyez que 5 % de ce que vous rendez), corrigez les artefacts, puis appliquez un vrai travail de mots-clés — souvent avec des outils de métadonnées IA par-dessus. L'IA qui crée l'image est optionnelle ; l'IA qui assiste le pipeline est le vrai avantage en 2026.`,
  },
  {
    slug: "best-ai-tools-microstock-sellers-2026",
    title: "Les 7 meilleurs outils IA pour les vendeurs microstock en 2026",
    description:
      "Des générateurs de métadonnées IA à la prévision des tendances — les outils qui font vraiment gagner du temps et augmenter les téléchargements pour les contributeurs Adobe Stock, Shutterstock et Freepik.",
    date: "2026-09-18",
    readingTime: "6 minutes de lecture",
    tags: ["Outils IA", "Microstock", "Adobe Stock", "Mots-clés"],
    body: `Le microstock a un problème de débit. Les plateformes récompensent le volume — les contributeurs avec des milliers d'actifs gagnent exponentiellement plus que ceux qui en ont des centaines — mais chaque actif a besoin d'un titre, d'une description et de jusqu'à 50 mots-clés avant de rapporter quoi que ce soit. Écrire ces métadonnées à la main prend cinq à dix minutes par fichier.

C'est là que les outils IA ont discrètement changé l'économie du métier. Voici les sept catégories d'outils qui valent votre temps en 2026, et comment les enchaîner en un flux de travail.

## 1. Les générateurs de métadonnées IA (le plus important)

C'est la catégorie au meilleur retour sur investissement, point. Un générateur de métadonnées IA regarde votre image et écrit un titre, une description et une liste de mots-clés optimisés par plateforme en quelques secondes.

Ce qui distingue un bon outil d'un jouet :

- **Règles propres à chaque plateforme.** Adobe Stock veut un titre descriptif de 200 caractères ; le champ titre de Shutterstock fonctionne différemment ; Freepik a ses propres normes de mots-clés. Une sortie générique pour toutes les plateformes laisse des téléchargements sur la table.
- **Contrôle du nombre de mots-clés.** Adobe Stock indexe jusqu'à 49 mots-clés. Les 10 premiers portent le plus de poids, donc l'ordre compte autant que le nombre.
- **Traitement par lot.** S'il ne peut pas avaler 50 fichiers pendant votre café, il ne résout pas le problème de débit.

Le MetaGen de StockPulse fonctionne avec vos propres clés API (OpenAI, Gemini, Claude, Grok, Mistral ou OpenRouter), écrit des métadonnées par plateforme, note chaque résultat et exporte le format CSV exact attendu par chaque plateforme. Comme les clés sont les vôtres, un lot de 500 fichiers coûte quelques centimes.

## 2. Les suiveurs de téléchargements

On ne peut pas améliorer ce qu'on ne mesure pas. Un bon tracker interroge les compteurs de téléchargements en direct de vos ID d'actifs et garde un historique, pour voir quelles nichés convertissent vraiment au lieu de deviner.

La fonctionnalité tueuse est le suivi des concurrents : entrez n'importe quel ID de contributeur et vous voyez tout son portfolio avec les vrais compteurs de téléchargements. Quand vous trouvez un contributeur qui gagne régulièrement dans une niché, vous avez trouvé une niché qui vaut le coup.

## 3. Les outils de recherche de mots-clés

Les moteurs de recherche stock sont des moteurs de correspondance de mots-clés. Avant de photographier ou générer quoi que ce soit, vérifiez le ratio demande/concurrence de vos mots-clés cibles. Le point idéal : volume de recherche en hausse avec une concurrence moyenne — ces mots-clés sont là où les nouveaux envois peuvent vraiment se classer.

## 4. Les prévisionnistes de tendances

La demande saisonnière est prévisible des mois à l'avance : les acheteurs cherchent le contenu de Noël en octobre et l'imagerie de la saison des impôts en janvier. Les outils de tendances qui font remonter ce qui monte maintenant vous permettent d'envoyer *avant* la vague de saturation, pas après.

## 5. Les optimiseurs de titres

Un titre qui se lit naturellement pour les humains et densément en mots-clés pour les algorithmes est une compétence. Les optimiseurs notent votre brouillon (mots de remplissage, longueur, placement des mots-clés) et montrent exactement quels mots portent le poids du classement — transformant un jeu de devinettes en liste de contrôle.

## 6. Les utilitaires créatifs

Effets de dithering et de trame, extraction de palettes, mockups d'appareils, grilles bento — ils comblent des manques de contenu précis qui se vendent régulièrement : textures, fonds abstraits, mockups tech. Ils différencient aussi votre portfolio du énième rendu IA générique.

## 7. Les convertisseurs vectoriels

La conversion SVG vers EPS est une corvée quotidienne pour les contributeurs vectoriels, car les plateformes veulent de l'EPS prêt pour l'impression. Les convertisseurs dans le navigateur qui n'envoient jamais vos fichiers sont plus rapides et plus sûrs pour le travail client.

## Tout enchaîner en un flux de travail

L'effet cumulatif vient de l'enchaînement :

1. **Prévisionniste de tendances** → choisissez une niché montante
2. **Analyseur de mots-clés** → trouvez les mots-clés à faible concurrence de cette niché
3. **Créez** du contenu ciblant ces mots-clés
4. **Générateur de métadonnées IA** → titres et mots-clés parfaits par plateforme
5. **Optimiseur de titres** → poussez chaque titre au-dessus de 80
6. **Tracker** → après 60 jours, redoublez sur ce qui convertit

Dix minutes de recherche avant de créer valent mieux que dix heures de re-mot-clé après. Les contributeurs qui gagnent en 2026 ne sont pas forcément plus talentueux — ils sont outillés.`,
  },
];

export function getFrPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS_FR.find((post) => post.slug === slug);
}

// Development tripwire — keep this in sync whenever posts are added.
assertSlugsMatchLocale("fr", BLOG_POSTS_FR.map((post) => post.slug));
