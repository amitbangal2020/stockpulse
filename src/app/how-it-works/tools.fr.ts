/**
 * French copy for the expanded card body on /how-it-works.
 *
 * Kept in its own file (the English source stays inside `TOOLS` in page.tsx) so
 * a translator only ever touches this one list. Keyed by tool id: any tool
 * missing from here simply keeps its English text, so a half-finished pass
 * never breaks the page.
 *
 * Deliberate choices: product names, file formats, code identifiers and chart
 * jargon (MP4, CSV, RSI, MACD, API key, Adobe Stock…) stay in Latin script —
 * that is how they are written and searched in French technical writing.
 */
export interface ToolBodyFr {
  features: string[];
  steps: { title: string; detail: string }[];
  output: string;
  tips: string[];
}

export const TOOL_BODY_FR: Record<string, ToolBodyFr> = {
  generator: {
    features: [
      "6 fournisseurs d'IA : OpenAI, Gemini, Claude, Grok, Mistral et OpenRouter",
      "Plusieurs clés API par fournisseur avec rotation round-robin, validation et import en masse",
      "Import en lot d'images, vidéos, EPS, AI, PDF et SVG — miniatures extraites automatiquement",
      "Détection automatique des fonds transparents pour les fichiers PNG/SVG/EPS",
      "6 plateformes : Adobe Stock, Shutterstock, Freepik, Vecteezy, iStock et Pond5",
      "7 langues de sortie, dont anglais, espagnol, allemand, français, japonais et chinois",
      "Plages ajustables : titre (74–135 caractères), mots-clés (35–45) et description (184–238)",
      "7 styles de prompt : Highly Optimized, Keyword Priority, SEO Focus, Adobe Stock Special, Shutterstock Special, Human Search Psychology + personnalisé",
      "Préfixe/suffixe de titre, mots-clés personnalisés, mots interdits et filtre IP",
      "Passe de pré-analyse Vision AI pour des métadonnées conscientes de l'image",
      "Génération en double passe A/B avec score de qualité automatique et bascule de version",
      "Génération parallèle avec concurrence configurable (1 à 10 requêtes)",
      "Score de qualité par fichier avec points forts et points faibles",
      "Onglet Prompt : prompts de génération d'images IA avec paramètres caméra et prompts négatifs",
      "Export CSV au format parfait pour chaque plateforme — ou ZIP multi-plateformes",
      "Téléchargement automatique du CSV dès la fin du lot",
    ],
    steps: [
      { title: "Ajouter une clé API", detail: "Cliquez sur « Add API Key », choisissez un fournisseur (OpenAI, Gemini, Claude, Grok, Mistral, OpenRouter) et collez votre clé. Ajoutez-en plusieurs — elles tournent automatiquement. Le bouton « Validate All APIs » les vérifie toutes en un clic, ou importez une liste en masse. « Save Settings » enregistre votre configuration et « Load Settings » la restaure plus tard." },
      { title: "Choisir les plateformes", detail: "Cochez les plateformes cibles (Adobe Stock, Shutterstock, Freepik, Vecteezy, iStock, Pond5). Plusieurs plateformes produisent des CSV au format propre à chacune, regroupés dans un ZIP." },
      { title: "Téléverser les fichiers", detail: "Glissez-déposez des images (JPG, PNG, WEBP), des vidéos (MP4, MOV, AVI…), des fichiers EPS/AI/PDF ou SVG. Les vignettes vidéo et les aperçus EPS sont extraits automatiquement, et la transparence est détectée pour vous." },
      { title: "Régler les paramètres", detail: "Définissez les plages de longueur titre/mots-clés/description, la langue de sortie, le ton, le style de prompt, le préfixe et le suffixe de titre, les mots-clés personnalisés, les mots interdits et la concurrence de génération parallèle." },
      { title: "Générer les métadonnées", detail: "Cliquez sur « Generate All ». L'IA analyse d'abord chaque fichier en mode vision, puis rédige titre, description et mots-clés. Un minuteur en direct et le statut par fichier suivent la progression." },
      { title: "Générer aussi des prompts d'images", detail: "Passez à l'onglet « Prompt » pour créer des prompts de génération d'images IA (style Midjourney/DALL-E) à partir des mêmes fichiers — avec en option paramètres caméra, préfixe/suffixe de prompt et prompts négatifs." },
      { title: "Vérifier et copier", detail: "Consultez le score de qualité de chaque fichier, copiez les champs un par un, comparez et basculez entre les versions A/B, puis relancez les fichiers en échec." },
      { title: "Exporter le CSV", detail: "Cliquez sur « Download CSV » pour une plateforme ou récupérez un ZIP avec un CSV correctement formaté par plateforme. Activez le téléchargement automatique pour l'obtenir dès la fin de la génération." },
    ],
    tips: [
      "Activez la génération parallèle avec une concurrence de 3 à 5 pour les lots les plus rapides",
      "Utilisez la passe simple pour diviser par deux la consommation de tokens quand vous n'avez pas besoin de test A/B",
      "L'onglet Prompt transforme n'importe quel actif existant en brief de génération IA tout neuf",
      "Essayez le style « Adobe Stock Special » pour les envois centrés sur Adobe",
    ],
    output: "Fichiers CSV propres à chaque plateforme (titre, description, mots-clés, catégorie) + prompts d'images IA",
  },

  tracker: {
    features: [
      "3 modes de recherche : mot-clé, ID contributeur et ID d'actif",
      "Compteurs de téléchargements en direct, directement depuis Adobe Stock",
      "Scan de portfolio contributeur — jusqu'à 300 actifs avec nom du créateur et totaux",
      "Filtre de contenu IA : Tout / Exclure l'IA / IA uniquement (filtre gentech côté serveur)",
      "Filtre par type de média : photos, vecteurs et vidéos",
      "5 ordres de tri : meilleures performances, plus/moins de téléchargements, plus récents/anciens",
      "Vues grille et tableau avec barres de performance relative",
      "Barre de stats : résultats, téléchargements totaux, moyenne et meilleure performance",
      "Badge de contenu généré par IA sur chaque actif",
      "Export CSV en un clic de n'importe quel jeu de résultats",
      "Cliquez sur un titre ou un contributeur pour approfondir instantanément",
      "Liens directs « Voir sur Adobe Stock »",
    ],
    steps: [
      { title: "Choisir un mode de recherche", detail: "Choisissez Mot-clé (découvrir ce qui se vend dans une niché), ID contributeur (analyser un portfolio entier) ou ID d'actif (téléchargements exacts d'un fichier)." },
      { title: "Rechercher", detail: "Saisissez un mot-clé (ex. « summer travel icons »), un ID contributeur pris dans l'URL Adobe Stock, ou un ID d'actif (ex. 2050460487) puis lancez la recherche." },
      { title: "Filtrer et trier", detail: "Affinez avec le filtre IA et le filtre de type de média, puis triez par performance, téléchargements ou date pour faire émerger vite les gagnants." },
      { title: "Analyser les résultats", detail: "Lisez la barre de stats pour les téléchargements totaux, la moyenne et la meilleure performance. Chaque carte affiche téléchargements, date d'envoi, catégorie et badge IA le cas échéant." },
      { title: "Approfondir ou exporter", detail: "Cliquez sur un titre pour rechercher cet actif, sur un nom de contributeur pour ouvrir son portfolio, ou exportez tout en CSV pour l'analyser dans un tableur." },
    ],
    tips: [
      "L'ID d'actif = nombre exact de téléchargements d'un fichier précis",
      "L'ID contributeur = espionner les portfolios et la stratégie de mots-clés des concurrents",
      "Le filtre IA uniquement / Exclure l'IA révèle la part d'une niché déjà générée par IA",
    ],
    output: "Compteurs de téléchargements en direct, analyse de portfolio, insights concurrentiels, export CSV",
  },

  dashboard: {
    features: [
      "4 stats phares : total suivi, téléchargements totaux, nombre en hausse et moyenne",
      "Graphique de tendance global des téléchargements sur tous les actifs suivis",
      "Graphique à barres des meilleurs actifs",
      "L'actualisation en un clic récupère les données en direct de chaque actif suivi",
      "Historique d'instantanés stocké par actif — voyez les téléchargements grandir avec le temps",
      "Horodatage de la dernière actualisation",
      "Guide d'état vide renvoyant directement vers Adobe Tracker",
    ],
    steps: [
      { title: "Suivre des actifs d'abord", detail: "Cherchez un ID d'actif sur la page Adobe Tracker pour commencer à le suivre — les actifs suivis apparaissent ici automatiquement." },
      { title: "Consulter vos stats", detail: "Voyez le total d'actifs suivis, les téléchargements totaux, combien sont en hausse et votre moyenne par actif." },
      { title: "Lire les tendances", detail: "Le graphique de tendance global agrège vos téléchargements dans le temps ; le graphique à barres classe vos 5 meilleurs actifs." },
      { title: "Actualiser les données", detail: "Cliquez sur « Refresh Data » pour récupérer les derniers compteurs de téléchargements de tous les actifs suivis et enregistrer un nouvel instantané." },
    ],
    tips: [
      "Actualisez régulièrement — plus d'instantanés donnent des courbes de tendance plus lisses",
      "La stat « en hausse » montre combien d'actifs ont gagné des téléchargements depuis la dernière vérification",
    ],
    output: "Vue d'ensemble du portfolio, courbe de tendance agrégée, meilleures performances",
  },

  portfolio: {
    features: [
      "Cartes d'actifs avec miniatures et badges de type de média",
      "Filtre : tout / image / vecteur / vidéo",
      "Tri par plus de téléchargements, performance ou plus récents",
      "Stats d'en-tête : total d'actifs, téléchargements totaux et performance moyenne",
      "Par actif : tags, date d'envoi, nombre de téléchargements et score de performance",
      "Score de performance codé couleur (vert 80+, jaune 50+, rouge en dessous)",
    ],
    steps: [
      { title: "Ouvrir votre portfolio", detail: "Tous vos actifs apparaissent dans une grille de cartes responsive avec miniatures et badges." },
      { title: "Filtrer par type", detail: "Basculez entre Tout, Image, Vecteur et Vidéo pour vous concentrer sur un type d'actif." },
      { title: "Trier", detail: "Classez par plus de téléchargements, score de performance ou date d'envoi (plus récents d'abord)." },
      { title: "Examiner les actifs", detail: "Chaque carte affiche tags, date d'envoi, téléchargements et un score de performance sur 100." },
    ],
    tips: [
      "Triez par performance pour repérer les actifs à la traîne qui méritent de nouveaux mots-clés",
      "Comparez vos envois les plus récents à votre moyenne pour mesurer la traction initiale",
    ],
    output: "Grille d'actifs organisée avec scores de performance",
  },

  watchlist: {
    features: [
      "Étoilez n'importe quel actif depuis les résultats de recherche pour l'enregistrer ici",
      "Liste persistante liée à votre compte connecté",
      "Tri par téléchargements ou performance",
      "Suppression en un clic avec le bouton corbeille au survol",
      "Fonctionne entièrement hors ligne grâce au stockage local",
    ],
    steps: [
      { title: "Se connecter", detail: "La liste de suivi demande un compte (gratuit) — connectez-vous pour la débloquer." },
      { title: "Ajouter des favoris", detail: "Trouvez des actifs via Adobe Tracker et étoilez-les pour les ajouter à votre liste." },
      { title: "Surveiller et trier", detail: "Triez vos actifs enregistrés par téléchargements ou performance pour garder un œil sur ceux qui comptent." },
      { title: "Retirer à tout moment", detail: "Survolez une carte et cliquez sur l'icône corbeille pour la retirer de la liste." },
    ],
    tips: [
      "Utilisez-la comme un moodboard des best-sellers de vos concurrents que vous voulez battre",
    ],
    output: "Liste de suivi personnelle de vos actifs favoris",
  },

  "svg-video": {
    features: [
      "Formats d'export : MP4 (encodeur FFmpeg), WebM et GIF",
      "MP4 se sélectionne automatiquement quand l'encodeur est disponible ; WebM fonctionne partout",
      "Résolutions : 720p, 1080p, 4K Ultra HD, carré 1:1 et vertical 9:16 (Story)",
      "Fréquence d'images jusqu'à 60 FPS pour un mouvement ultra fluide",
      "Durée détectée automatiquement depuis la timeline d'animation du SVG",
      "Fonds possibles : transparent, couleur unie ou dégradé",
      "Filtres de canevas : flou, luminosité, contraste, rotation de teinte, sépia et inversion",
      "Bande-son — importez un MP3/WAV et elle est mixée dans la vidéo",
      "Filigrane textuel avec contrôle de la taille, de l'opacité et de la position",
      "Encodage avancé : bitrate personnalisé et profil de codec H.264 (High/Main/Baseline)",
      "File d'attente par lot pour convertir de nombreux SVG en une seule passe",
      "Collez du code SVG brut ou glissez-déposez un fichier avec aperçu en direct instantané",
    ],
    steps: [
      { title: "Téléverser ou coller le SVG", detail: "Glissez-déposez un SVG animé ou collez son code XML. L'aperçu en direct se rend immédiatement — les animations SMIL et CSS sont prises en charge." },
      { title: "Choisir format et qualité", detail: "Choisissez MP4, WebM ou GIF, réglez la résolution (jusqu'à 4K), les FPS (jusqu'à 60) et éventuellement un bitrate et un profil de codec personnalisés." },
      { title: "Styliser le canevas", detail: "Définissez un fond transparent, coloré ou en dégradé, ajustez les filtres (flou, luminosité, contraste, teinte, sépia, inversion) et ajoutez un filigrane." },
      { title: "Ajouter le son (facultatif)", detail: "Importez une bande-son MP3/WAV — elle est mixée dans la vidéo exportée." },
      { title: "Convertir et exporter", detail: "Cliquez sur « Convert & Export ». Une barre de progression suit les images et la taille estimée, puis votre vidéo se télécharge automatiquement." },
    ],
    tips: [
      "60 FPS + 1080p est le point idéal pour le motion design",
      "Les fonds transparents sont parfaits pour les incrustations",
      "Utilisez l'onglet File d'attente pour convertir tout un dossier de SVG",
      "MP4 n'apparaît que lorsque l'encodeur est en ligne — sinon WebM est présélectionné",
    ],
    output: "Fichiers vidéo MP4 / WebM / GIF avec audio et filigrane",
  },

  dither: {
    features: [
      "Dithering ordonné (Bayer) : matrices 2×2, 4×4, 8×8 et 16×16",
      "Algorithmes de diffusion d'erreur : Floyd-Steinberg, Atkinson, Jarvis-Judice-Ninke, Stucki et Burkes",
      "Préréglages en un clic : Game Boy, Commodore 64 et plus",
      "Réglages de seuil, grain, postérisation et pixelisation",
      "Palettes de couleurs personnalisées avec nombre de couleurs ajustable (sortie bicolore)",
      "Sélection de canal (luminance et plus)",
      "Aperçu en direct avec re-rendu instantané à chaque changement",
      "Export PNG",
    ],
    steps: [
      { title: "Téléverser une image", detail: "Glissez-déposez n'importe quelle image (PNG, JPG, WEBP) — l'aperçu se rend instantanément." },
      { title: "Choisir un algorithme", detail: "Optez pour une matrice Bayer pour le dithering ordonné classique ou une méthode de diffusion d'erreur pour des rendus photographiques." },
      { title: "Ajuster le rendu", detail: "Réglez seuil, grain, niveaux de postérisation et pixelisation. Appliquez un préréglage comme Game Boy ou définissez votre propre palette bicolore." },
      { title: "Exporter", detail: "Téléchargez le résultat ditheré en PNG." },
    ],
    tips: [
      "Bayer 4×4 donne le look pixel art rétro",
      "Atkinson imite le dithering classique du Macintosh",
      "Préréglage Game Boy + pixelisation = nostalgie instantanée",
    ],
    output: "Image PNG ditherée",
  },

  halftone: {
    features: [
      "3 moteurs de halftone : modulation d'amplitude, modulation de fréquence et diffusion d'erreur",
      "Grilles linéaires et hexagonales",
      "Points ronds ou carrés",
      "7 préréglages : Journal, Pop Art, Risograph, Impression CMJN, Dot Matrix, Organique et Contraste élevé",
      "Contrôle de l'espacement des points, de l'angle de rotation, de la taille globale, du gamma et du flou",
      "Ajustements de contraste, luminosité et saturation",
      "Palettes limitées — du bicolore au multicolore — plus fond personnalisé",
      "Aperçu re-rendu en temps réel",
    ],
    steps: [
      { title: "Téléverser une image", detail: "Déposez n'importe quelle photo ou graphique — l'aperçu halftone se re-rend en temps réel pendant que vous ajustez." },
      { title: "Choisir moteur et grille", detail: "Choisissez modulation d'amplitude/fréquence ou diffusion d'erreur, puis une grille linéaire ou hexagonale avec points ronds ou carrés." },
      { title: "Styliser", detail: "Réglez l'espacement, la rotation, le gamma et les corrections colorimétriques. Chargez un préréglage comme Pop Art ou Risograph, ou construisez une palette personnalisée." },
      { title: "Exporter", detail: "Enregistrez votre œuvre en trame d'impression en PNG." },
    ],
    tips: [
      "Rotation à 45° = look d'impression classique",
      "La modulation de fréquence donne des textures organiques et stochastiques",
      "Le préréglage Risograph est parfait pour des visuels stock style affiche",
    ],
    output: "Œuvre halftone en PNG",
  },

  bento: {
    features: [
      "Mises en page bento auto-générées avec cellules de tailles mixtes",
      "Bouton mélanger pour régénérer de nouveaux arrangements instantanément",
      "Contrôles de grille, d'espacement et de mise en page depuis l'en-tête",
      "Ombrage par cellule avec une esthétique cohérente",
      "Export PNG avec options d'échelle (1x / 2x / 3x)",
      "Export SVG (vectoriel) pour une utilisation en résolution infinie",
    ],
    steps: [
      { title: "Générer une mise en page", detail: "Le générateur crée automatiquement une grille bento de cellules de tailles mixtes." },
      { title: "Mélanger et ajuster", detail: "Cliquez sur Mélanger pour un nouvel arrangement, ou affinez la taille de grille et l'espacement depuis les contrôles d'en-tête." },
      { title: "Exporter", detail: "Téléchargez en PNG (échelle 1x, 2x ou 3x) ou en SVG vectoriel pour vos outils de design." },
    ],
    tips: [
      "Échelle PNG 2x–3x idéale pour les publications sur les réseaux sociaux",
      "L'export SVG permet de recolorer les cellules dans Illustrator/Figma",
    ],
    output: "Grille bento en PNG (1x/2x/3x) ou SVG",
  },

  "color-palette": {
    features: [
      "Extraction de 3 à 12 couleurs dominantes de n'importe quelle image",
      "Chaque nuance affiche HEX, RVB, nom de la couleur et pourcentage de l'image",
      "Cliquez sur une nuance pour copier son code HEX",
      "Bouton mélanger pour réorganiser la palette",
      "Variables CSS :root auto-générées",
      "Copie CSS de toute la palette en un clic",
    ],
    steps: [
      { title: "Téléverser une image", detail: "Glissez-déposez une photo — les couleurs sont extraites instantanément avec noms et pourcentages." },
      { title: "Ajuster le nombre de couleurs", detail: "Utilisez le curseur (3–12) pour obtenir moins de tons dominants ou une palette plus nuancée, puis relancez l'extraction." },
      { title: "Copier les couleurs", detail: "Cliquez sur une nuance pour copier le HEX. La barre latérale liste aussi chaque couleur avec sa valeur RVB." },
      { title: "Copier le CSS", detail: "Récupérez toute la palette en variables CSS :root, prêtes à coller dans une feuille de style." },
    ],
    tips: [
      "5–6 couleurs est le point idéal pour les systèmes de design",
      "Le pourcentage indique le poids visuel de chaque couleur dans l'image",
      "Mélangez avant d'exporter pour trouver un meilleur ordre",
    ],
    output: "Palette de couleurs (HEX/RVB/nom/pourcentage) + variables CSS",
  },

  "color-harmonizer": {
    features: [
      "7 types d'harmonie : complémentaire, analogue, triadique, complémentaire divisé, carré, tétradique et monochromatique",
      "Visualisation sur roue chromatique interactive avec marqueurs en direct",
      "Étiquettes de rôle sur chaque couleur générée (Base, Complément, Triadique 120°…)",
      "Le mode monochromatique produit 5 nuances (sombre → clair)",
      "Copie HEX en un clic pour chaque nuance",
      "Téléchargement de l'harmonie complète en fichier CSS",
    ],
    steps: [
      { title: "Choisir une couleur de base", detail: "Utilisez le sélecteur de couleur ou saisissez un code HEX — la roue se met à jour instantanément." },
      { title: "Choisir une harmonie", detail: "Basculez entre les 7 types d'harmonie et regardez les nuances se régénérer avec leurs étiquettes de rôle." },
      { title: "Copier ou exporter", detail: "Cliquez sur une nuance pour copier son HEX, ou téléchargez toute l'harmonie en fichier CSS." },
    ],
    tips: [
      "Analogues (+/-30°) pour des designs calmes et cohérents",
      "Complémentaire pour un contraste maximal",
      "Le monochromatique est la palette la plus sûre pour débuter",
    ],
    output: "Palette d'harmonie avec étiquettes de rôle + export CSS",
  },

  ascii: {
    features: [
      "Largeur de sortie ajustable : 30 à 200 caractères",
      "Jeux de caractères multiples (Standard, Detailed, Blocks, Binary et plus)",
      "Bascule d'inversion pour les rendus sombre-sur-clair / clair-sur-sombre",
      "Le mode coloré associe la luminosité à une échelle de teinte vert→rouge",
      "Copie du texte dans le presse-papiers",
      "Enregistrement de la sortie en fichier TXT",
      "Aperçu en direct avec rendu couleur caractère par caractère",
    ],
    steps: [
      { title: "Téléverser une image", detail: "Déposez n'importe quelle image (JPG, PNG, WEBP, GIF) ou cliquez pour parcourir — l'art ASCII se génère instantanément." },
      { title: "Régler la largeur", detail: "Faites glisser entre 30 et 200 caractères de large. Plus de caractères = plus de détails." },
      { title: "Choisir le jeu de caractères", detail: "Choisissez un jeu dans le menu déroulant ; la rampe exacte de caractères s'affiche en dessous." },
      { title: "Styliser et exporter", detail: "Activez Inversion ou Mode coloré, puis copiez le texte ou enregistrez en TXT." },
    ],
    tips: [
      "Une largeur de 80–120 équilibre détail et lisibilité",
      "Le jeu Blocks donne un look audacieux et moderne",
      "Le mode coloré ressort superbe sur fond sombre",
    ],
    output: "Art ASCII en texte (copie ou téléchargement TXT)",
  },

  trending: {
    features: [
      "Données de tendance en direct récupérées d'Adobe Stock",
      "Plages temporelles : tout, cette semaine, ce mois-ci et ce trimestre",
      "Nichés tendance avec score de demande, téléchargements, concurrence et note d'opportunité",
      "Meilleurs contributeurs avec nombre d'actifs, téléchargements et dynamique",
      "Répartition par catégories avec barres codées couleur et compteurs de téléchargements",
      "Panneau d'analyses de marché organisées",
      "L'ordre de tri montre le contenu récemment envoyé vs le plus téléchargé",
      "Actualisation manuelle pour les dernières données",
    ],
    steps: [
      { title: "Choisir une plage temporelle", detail: "Basculez entre Tout, Semaine, Mois ou Trimestre — les plages fraîches font remonter les opportunités récentes." },
      { title: "Scanner les nichés tendance", detail: "Chaque carte de niché affiche un score de demande, un volume de téléchargements, un niveau de concurrence et une note d'opportunité." },
      { title: "Étudier les meilleurs contributeurs", detail: "Voyez qui prend de l'élan en ce moment et combien d'actifs et de téléchargements ils totalisent." },
      { title: "Vérifier les catégories", detail: "La répartition par catégories codée couleur montre quels types de contenu portent le plus de téléchargements." },
    ],
    tips: [
      "La vue hebdomadaire = opportunités les plus fraîches et les moins saturées",
      "Les nichés à téléchargements élevés et faible concurrence sont vos points d'entrée",
      "Recoupez les nichés tendance avec l'outil Mots-clés",
    ],
    output: "Nichés tendance, contributeurs, répartition par catégories et analyses",
  },

  keywords: {
    features: [
      "Analyse instantanée de n'importe quel mot-clé",
      "Niveau de volume de recherche : très élevé → très faible, avec un score de demande (0–100)",
      "Niveau de concurrence avec un score de concurrence (0–100)",
      "Niché suggéré avec estimations de recherches mensuelles",
      "Direction de tendance (hausse / stable / baisse) avec % de croissance mensuelle",
      "Conseils d'optimisation numérotés et exploitables",
      "Mots-clés associés cliquables pour une recherche en chaîne",
      "Historique des recherches récentes (10 dernières)",
      "Verdict de résumé rapide : opportunité forte ou faible",
      "16 raccourcis de mots-clés populaires pour démarrer vite",
    ],
    steps: [
      { title: "Saisir un mot-clé", detail: "Tapez n'importe quel mot-clé ou cliquez sur l'un des raccourcis populaires (business, technology, nature…)." },
      { title: "Lire les scores", detail: "Comparez le score de demande au score de concurrence — une demande supérieure à la concurrence = opportunité." },
      { title: "Vérifier la niché et la tendance", detail: "La niché suggérée montre l'angle à prendre ; le badge de tendance indique où va le mot-clé." },
      { title: "Suivre les mots-clés associés", detail: "Cliquez sur n'importe quel mot-clé associé pour l'analyser instantanément et construire une carte de mots-clés pour vos envois." },
    ],
    tips: [
      "Tendance à la hausse + concurrence moyenne = meilleure cible d'envoi",
      "Utilisez les mots-clés associés comme liste de mots-clés réelle de votre actif",
      "Les mots-clés à très forte concurrence exigent une exécution exceptionnelle pour se classer",
    ],
    output: "Scores demande/concurrence, suggestion de niché, direction de tendance, conseils et mots-clés associés",
  },

  "portfolio-analytics": {
    features: [
      "Graphique radar de 8 métriques : téléchargements, vues, likes, revenus, classement, mots-clés, régularité et score de niché",
      "Bascule du type de graphique : radar ou aire polaire",
      "Comparaison de 3 profils : votre portfolio vs meilleur performeur vs moyenne du marché",
      "Vue en graphique à barres groupées des mêmes métriques",
      "4 périodes : 7 / 30 / 90 jours et 1 an",
      "Randomiser pour simuler des scénarios et comparer des profils",
      "Activation ou désactivation de chaque graphique",
      "Score de portfolio calculé automatiquement",
    ],
    steps: [
      { title: "Lire le radar", detail: "Votre portfolio est tracé face à un meilleur performeur et à la moyenne du marché sur les 8 métriques — les creux montrent exactement où progresser." },
      { title: "Changer de vue", detail: "Basculez entre radar et aire polaire, ou masquez-le et utilisez le graphique à barres groupées pour des comparaisons précises." },
      { title: "Changer de période", detail: "Passez de 7, 30, 90 jours à 1 an pour voir comment le tableau évolue." },
      { title: "Simuler", detail: "Utilisez Randomiser pour tester différents profils de métriques face au référentiel." },
    ],
    tips: [
      "Des écarts sur Mots-clés et Score de niché = problèmes de métadonnées, pas de contenu",
      "La régularité compte plus qu'un pic isolé",
      "Comparez la forme de vos revenus à celle du meilleur performeur pour repérer les écarts de prix/qualité",
    ],
    output: "Graphiques radar/polaire et à barres comparant 8 métriques du portfolio",
  },

  trend: {
    features: [
      "Prévision de tendances par catégorie à partir des données Adobe Stock en direct",
      "Vue de prévision mensuelle par catégorie",
      "Cartes de tendance avec % de croissance, tag de saison et score de confiance",
      "4 stats phares : croissance moyenne, fortes opportunités, confiance moyenne et tendance dominante",
      "Filtre de recherche sur les noms de tendances",
      "Panneau de détail de tendance au clic",
      "Filtrage par plage temporelle",
      "Export CSV du jeu de données de tendances",
      "Horodatage de dernière mise à jour et actualisation manuelle",
    ],
    steps: [
      { title: "Choisir une catégorie", detail: "Choisissez une catégorie de contenu (ex. Technology) et une plage temporelle — les tendances se chargent depuis l'API Adobe Stock." },
      { title: "Lire les stats", detail: "Croissance moyenne, nombre de fortes opportunités, confiance moyenne et tendance dominante du moment en un coup d'œil." },
      { title: "Ouvrir la prévision mensuelle", detail: "La section de prévision projette l'évolution de la catégorie mois par mois." },
      { title: "Explorer les tendances", detail: "Cliquez sur une carte de tendance pour les détails (saison, confiance), ou exportez tout en CSV." },
    ],
    tips: [
      "Le % de confiance indique la fiabilité d'une prévision — agissez à partir de 70 %",
      "Les tags de saison aident à planifier les envois 2–3 mois à l'avance",
      "Recoupez avec Trending avant de vous engager sur une niché",
    ],
    output: "Prévisions par catégorie, cartes de tendance avec confiance, export CSV",
  },

  candlestick: {
    features: [
      "Types de graphiques : chandeliers, ligne, aire et barres",
      "5 types de moyennes mobiles : SMA, EMA, WMA, DEMA et TEMA",
      "Superposition des bandes de Bollinger",
      "Panneau RSI (indice de force relative)",
      "Panneau MACD (convergence/divergence des moyennes mobiles)",
      "Collez vos propres données CSV ou utilisez l'exemple",
      "Graphique interactif avec infobulles",
      "Export PNG haute résolution",
    ],
    steps: [
      { title: "Saisir les données", detail: "Collez des données OHLC (Date, Open, High, Low, Close, Volume) ou chargez le jeu d'exemple." },
      { title: "Choisir le type de graphique", detail: "Basculez entre vues chandeliers, ligne, aire et barres." },
      { title: "Ajouter des indicateurs", detail: "Activez les moyennes mobiles (SMA/EMA/WMA/DEMA/TEMA), les bandes de Bollinger et les panneaux RSI et MACD." },
      { title: "Exporter", detail: "Téléchargez le graphique final en PNG." },
    ],
    tips: [
      "L'EMA réagit plus vite que la SMA — utilisez les deux pour repérer les croisements",
      "RSI au-dessus de 70 / en dessous de 30 signale surachat/survente",
      "Les croisements MACD confirment les changements de dynamique",
    ],
    output: "Graphique financier interactif avec indicateurs (export PNG)",
  },

  heatmap: {
    features: [
      "30 catégories de contenu (IA et tech → Gaming) dimensionnées par valeur de marché",
      "% de croissance par catégorie avec coloration verte/rouge de la performance",
      "6 palettes : Performance, Océan, Coucher de soleil, Forêt, Néon et Niveaux de gris",
      "Tri par nom, valeur ou croissance",
      "Bascule des étiquettes et des pourcentages de croissance",
      "Filtre de valeur minimale pour masquer les petites catégories",
      "Mode plein écran pour les présentations",
      "Infobulles au survol avec valeurs exactes",
    ],
    steps: [
      { title: "Scanner la carte", detail: "Taille des blocs = valeur de marché ; couleur = croissance. Les gros blocs verts sont les marchés les plus solides en ce moment." },
      { title: "Changer de palette", detail: "Essayez Océan, Coucher de soleil, Forêt, Néon ou Niveaux de gris pour des lectures visuelles différentes des mêmes données." },
      { title: "Filtrer et trier", detail: "Augmentez le curseur de valeur minimale pour vous concentrer sur les grands marchés, ou triez par croissance pour repérer les moteurs." },
      { title: "Passer en plein écran", detail: "Étendez en plein écran pour des présentations ou des captures d'écran." },
    ],
    tips: [
      "Triez par croissance pour repérer tôt les nichés en forte hausse",
      "Les catégories rouge foncé sont saturées ou en déclin — réfléchissez à deux fois",
      "IA et tech ainsi qu'Espace affichent actuellement la plus forte croissance",
    ],
    output: "Carte thermique interactive avec 6 palettes",
  },

  comparison: {
    features: [
      "8 plateformes : Adobe Stock, Shutterstock, Getty, iStock, Canva, Dreamstime, 123RF et Pond5",
      "Vues en ligne, aire et barres",
      "Périodes : 7, 14, 30 ou 60 jours",
      "Le mode normalisé convertit toutes les séries en variation % pour une comparaison équitable",
      "Matrice de corrélation entre chaque paire d'actifs (codée couleur)",
      "Stats par actif : variation %, plus haut, plus bas et RSI",
      "Ajout/retrait d'actifs et données aléatoires",
      "Mode graphique plein écran",
    ],
    steps: [
      { title: "Choisir les plateformes", detail: "Démarrez avec 4 plateformes préchargées ; ajoutez ou retirez n'importe laquelle des 8 prises en charge." },
      { title: "Choisir vue et période", detail: "Basculez ligne/aire/barres et réglez des fenêtres de 7 à 60 jours." },
      { title: "Normaliser", detail: "Activez Normaliser pour comparer des variations en pourcentage plutôt que des valeurs absolues — indispensable quand les échelles diffèrent." },
      { title: "Lire les corrélations", detail: "La matrice de corrélation montre quelles plateformes bougent ensemble (vert = corrélées, rouge = inversées). Consultez le RSI pour la dynamique." },
    ],
    tips: [
      "La vue normalisée révèle la vraie performance relative",
      "Les plateformes à faible corrélation diversifient vos revenus",
      "Utilisez le RSI pour repérer les plateformes qui surchauffent",
    ],
    output: "Comparaison de plateformes côte à côte avec matrice de corrélation et stats",
  },

  "svg-eps": {
    features: [
      "Conversion SVG → EPS (PostScript) dans le navigateur — les fichiers ne quittent jamais votre machine",
      "Deux versions EPS : EPS10 (compatibilité maximale) et EPS20",
      "Chemins SVG convertis en chemins PostScript",
      "Conversion par lot de plusieurs fichiers",
      "Téléchargement instantané des fichiers convertis",
    ],
    steps: [
      { title: "Téléverser les fichiers SVG", detail: "Sélectionnez un ou plusieurs fichiers SVG — ils se mettent en file pour le traitement par lot." },
      { title: "Choisir la version EPS", detail: "EPS10 pour une compatibilité maximale avec les plateformes stock et les logiciels anciens, EPS20 pour les fonctionnalités plus récentes." },
      { title: "Convertir", detail: "Lancez la conversion — chaque fichier est converti en chemins PostScript localement." },
      { title: "Télécharger", detail: "Récupérez vos fichiers EPS prêts pour l'impression." },
    ],
    tips: [
      "EPS10 est le choix sûr pour les envois Adobe Stock",
      "Tout s'exécute côté client — sans risque pour les travaux confidentiels",
    ],
    output: "Fichiers vectoriels EPS10/EPS20",
  },

  "country-map": {
    features: [
      "Carte du monde plus chaque pays — recherche par pays ou grande ville",
      "Descente au niveau état/province dans certains pays",
      "4 projections : Natural Earth, Mercator, orthographique (globe) et équirectangulaire",
      "Mode carte de rue avec données OpenStreetMap en direct",
      "Couches de rue : bâtiments, eau, parcs et étiquettes — chacune activable",
      "Palettes de couleurs de rues (sauge et plus)",
      "Contrôles de zoom avec mise au point automatique sur la ville",
      "Téléchargement en PNG ou SVG vectoriel épuré",
    ],
    steps: [
      { title: "Choisir un lieu", detail: "Cherchez un pays ou une grande ville, ou choisissez « World » pour la carte complète. Les états/provinces apparaissent pour les grands pays." },
      { title: "Choisir une projection", detail: "Natural Earth pour une vue du monde agréable, orthographique pour un globe, Mercator pour les formes familières des cartes web." },
      { title: "Passer en mode rue (facultatif)", detail: "Cherchez une ville pour charger les données de rues OSM réelles — activez bâtiments, eau, parcs et étiquettes, et choisissez une palette." },
      { title: "Exporter", detail: "Téléchargez votre carte en PNG haute résolution ou en SVG vectoriel épuré prêt pour le design." },
    ],
    tips: [
      "L'export SVG est entièrement modifiable dans Illustrator — parfait pour les visuels de cartes stock",
      "Les globes orthographiques se vendent bien en fonds tech/voyage",
      "Mode rue + palettes personnalisées = visuels de lieux uniques",
    ],
    output: "Cartes de pays/rues en PNG ou SVG vectoriel",
  },

  mockup: {
    features: [
      "Cadres d'appareils : iPhone, MacBook et plus",
      "Préréglages de couleur de fond plus sélecteur personnalisé",
      "Placement automatique de l'écran adapté à chaque appareil",
      "Ombres d'appareils réalistes",
      "Export PNG haute résolution en 2x",
    ],
    steps: [
      { title: "Téléverser votre design", detail: "Glissez-déposez une capture ou un visuel PNG/JPG." },
      { title: "Choisir un appareil", detail: "Choisissez iPhone, MacBook ou un autre cadre — votre design est placé sur l'écran automatiquement." },
      { title: "Régler le fond", detail: "Choisissez une couleur prédéfinie ou personnalisez-la pour correspondre à votre marque." },
      { title: "Exporter", detail: "Téléchargez un PNG en résolution 2x prêt pour les portfolios et présentations." },
    ],
    tips: [
      "Les fonds gris clair font ressortir les écrans des appareils",
      "L'export 2x reste net sur les écrans retina",
    ],
    output: "Mockup d'appareil en PNG 2x",
  },

  "title-optimizer": {
    features: [
      "4 modes : Analyser, Comparer A/B, Masse et Modèles",
      "Score SEO en direct avec note lettrée (A+ à F) pendant la frappe",
      "Règles propres à 6 plateformes (limites de longueur et préférences)",
      "Détection de problèmes : mots de remplissage, longueur, capitalisation, répétition et plus",
      "Liste des points forts de ce qui fonctionne déjà",
      "Carte de poids des caractères — valeur SEO de chaque mot, codée couleur",
      "Contrôle de densité des mots-clés avec statut par mot",
      "Score de correspondance de catégorie et volumes de recherche par mot-clé",
      "Titre auto-optimisé + suggestions de mots-clés",
      "Le mode masse note plusieurs titres à la fois avec export CSV",
      "Modèles de formules de titres éprouvées avec exemples et utilisation en un clic",
    ],
    steps: [
      { title: "Saisir un titre", detail: "Collez votre titre stock — le score, la note, les problèmes et les points forts se mettent à jour en direct." },
      { title: "Analyser en profondeur", detail: "Examinez la carte de poids des caractères, le contrôle de densité, la correspondance de catégorie et les volumes de recherche pour voir la valeur mot par mot." },
      { title: "Appliquer le titre optimisé", detail: "Copiez le titre auto-optimisé et les mots-clés suggérés, puis re-notez pour confirmer l'amélioration." },
      { title: "A/B ou masse", detail: "Comparez deux titres face à face dans l'onglet A/B, ou notez des dizaines à la fois en mode Masse avec export CSV." },
      { title: "Apprendre les formules", detail: "Ouvrez Modèles pour des formules de titres éprouvées avec de vrais exemples applicables en un clic." },
    ],
    tips: [
      "Visez un score de 80+ avant d'envoyer",
      "Zéro mot de remplissage = +15 points immédiats",
      "Commencez les titres par le sujet — jamais par « A » ou « The »",
    ],
    output: "Score et note SEO, titre optimisé, suggestions de mots-clés, rapport CSV en masse",
  },

  events: {
    features: [
      "Calendrier complet 2026 des fêtes et journées",
      "Navigation mois par mois avec le jour actuel en surbrillance",
      "Panneau de détail de l'événement pour le jour sélectionné",
      "Points sur chaque jour qui comporte un événement",
      "Couvre les journées mondiales (Jour de la Terre, Journée de la femme, Journée de la santé mentale…), les fêtes nationales et les célébrations amusantes",
      "Conçu pour planifier les envois saisonniers avant la hausse de la demande",
    ],
    steps: [
      { title: "Parcourir l'année", detail: "Feuilletez les mois avec les flèches — les jours d'événement sont marqués sur la grille." },
      { title: "Ouvrir un événement", detail: "Cliquez sur un jour marqué pour voir les détails de l'événement dans le panneau latéral." },
      { title: "Planifier à l'avance", detail: "Notez les événements 2–3 mois à l'avance et programmez du contenu thématique (Halloween en août, Saint-Valentin en décembre)." },
    ],
    tips: [
      "Les acheteurs cherchent le contenu saisonnier 6–10 semaines à l'avance",
      "Associez chaque événement à l'outil Mots-clés pour trouver les bons termes",
      "Les célébrations amusantes (Journée du chat, Journée du café) sont de l'or à faible concurrence",
    ],
    output: "Calendrier d'événements pour la planification de contenu saisonnier",
  },
};
