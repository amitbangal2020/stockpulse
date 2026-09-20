/**
 * German copy for the expanded card body on /how-it-works.
 *
 * Kept in its own file (the English source stays inside `TOOLS` in page.tsx) so
 * a translator only ever touches this one list. Keyed by tool id: any tool
 * missing from here simply keeps its English text, so a half-finished pass
 * never breaks the page.
 *
 * Deliberate choices: product names, file formats, code identifiers and chart
 * jargon (MP4, CSV, RSI, MACD, API key, Adobe Stock…) stay in Latin script —
 * that is how they are written and searched in German technical writing.
 */
export interface ToolBodyDe {
  features: string[];
  steps: { title: string; detail: string }[];
  output: string;
  tips: string[];
}

export const TOOL_BODY_DE: Record<string, ToolBodyDe> = {
  generator: {
    features: [
      "6 KI-Anbieter: OpenAI, Gemini, Claude, Grok, Mistral und OpenRouter",
      "Mehrere API-Keys pro Anbieter mit Round-Robin-Rotation, Validierung und Massenimport",
      "Batch-Upload von Bildern, Videos, EPS, AI, PDF und SVG — Thumbnails werden automatisch extrahiert",
      "Automatische Erkennung transparenter Hintergründe bei PNG/SVG/EPS-Dateien",
      "6 Plattformen: Adobe Stock, Shutterstock, Freepik, Vecteezy, iStock und Pond5",
      "7 Ausgabesprachen, u. a. Englisch, Spanisch, Deutsch, Französisch, Japanisch und Chinesisch",
      "Einstellbare Bereiche für Titel (74–135 Zeichen), Keywords (35–45) und Beschreibung (184–238)",
      "7 Prompt-Stile: Highly Optimized, Keyword Priority, SEO Focus, Adobe Stock Special, Shutterstock Special, Human Search Psychology + Benutzerdefiniert",
      "Titel-Präfix/Suffix, eigene Keywords, Sperrwörter und IP-Filter",
      "Vision-AI-Voranalyse für bildbewusste Metadaten",
      "A/B-Doppeldurchlauf-Generierung mit automatischer Qualitätsbewertung und Versionswechsel",
      "Parallele Generierung mit einstellbarer Gleichzeitigkeit (1–10 Anfragen)",
      "Qualitätswert pro Datei mit Stärken und Schwächen",
      "Prompt-Tab: KI-Bildgenerierungs-Prompts mit Kameraparametern und Negativ-Prompts",
      "Plattformgerechter CSV-Export — oder Multiplattform-ZIP",
      "Automatischer CSV-Download, sobald der Batch fertig ist",
    ],
    steps: [
      { title: "API-Key hinzufügen", detail: "Klicken Sie auf „Add API Key“, wählen Sie einen Anbieter (OpenAI, Gemini, Claude, Grok, Mistral, OpenRouter) und fügen Sie Ihren Key ein. Mehrere Keys rotieren automatisch. Ein-Klick-Validierung oder Massenimport einer Liste." },
      { title: "Plattformen wählen", detail: "Haken Sie die Zielplattformen an (Adobe Stock, Shutterstock, Freepik, Vecteezy, iStock, Pond5). Mehrere Plattformen erzeugen je ein eigenes CSV-Format, gebündelt in einem ZIP." },
      { title: "Dateien hochladen", detail: "Ziehen Sie Bilder (JPG, PNG, WEBP), Videos (MP4, MOV, AVI …), EPS/AI/PDF- oder SVG-Dateien per Drag & Drop hinein. Videobilder und EPS-Vorschauen werden automatisch extrahiert, Transparenz wird für Sie erkannt." },
      { title: "Einstellungen konfigurieren", detail: "Legen Sie Längenbereiche für Titel/Keywords/Beschreibung, Ausgabesprache, Tonalität, Prompt-Stil, Titel-Präfix und -Suffix, eigene Keywords, Sperrwörter und die Parallelität fest." },
      { title: "Metadaten generieren", detail: "Klicken Sie auf „Generate All“. Die KI führt zuerst eine Vision-Analyse je Datei aus, dann schreibt sie Titel, Beschreibung und Keywords. Ein Live-Timer und der Status je Datei zeigen den Fortschritt." },
      { title: "Auch Bild-Prompts erzeugen", detail: "Wechseln Sie in den „Prompt“-Tab, um aus denselben Dateien KI-Bildgenerierungs-Prompts (im Stil von Midjourney/DALL-E) zu erstellen — optional mit Kameraparametern, Prompt-Präfix/Suffix und Negativ-Prompts." },
      { title: "Prüfen und kopieren", detail: "Sehen Sie sich den Qualitätswert jeder Datei an, kopieren Sie einzelne Felder, vergleichen und wechseln Sie zwischen A/B-Versionen, dann wiederholen Sie die Fehlschläge." },
      { title: "CSV exportieren", detail: "Klicken Sie für eine Plattform auf „Download CSV“ oder holen Sie ein ZIP mit korrekt formatiertem CSV je Plattform. Mit aktiviertem Auto-Download landet es direkt nach Generierungsende bei Ihnen." },
    ],
    tips: [
      "Aktivieren Sie die Parallelgenerierung mit 3–5 gleichzeitigen Anfragen für die schnellsten Batches",
      "Nutzen Sie den Einzeldurchlauf, um den Token-Verbrauch zu halbieren, wenn Sie kein A/B-Testing brauchen",
      "Der Prompt-Tab macht aus jedem vorhandenen Asset ein frisches KI-Generierungs-Briefing",
      "Probieren Sie den Stil „Adobe Stock Special“ für Adobe-fokussierte Uploads",
    ],
    output: "Plattformspezifische CSV-Dateien (Titel, Beschreibung, Keywords, Kategorie) + KI-Bild-Prompts",
  },

  tracker: {
    features: [
      "3 Suchmodi: Keyword, Contributor-ID und Asset-ID",
      "Live-Downloadzahlen direkt von Adobe Stock",
      "Contributor-Portfolio-Scan — bis zu 300 Assets mit Creator-Name und Summen",
      "KI-Inhaltsfilter: Alle / Ohne KI / Nur KI (serverseitiger Gentech-Filter)",
      "Medientyp-Filter: Fotos, Vektoren und Videos",
      "5 Sortierungen: beste Performance, meiste/wenigste Downloads, neueste/älteste",
      "Raster- und Tabellenansicht mit relativen Performance-Balken",
      "Statistikleiste: Ergebnisse, Downloads gesamt, Durchschnitt und Top-Performer",
      "KI-Content-Badge an jedem Asset",
      "CSV-Export jedes Ergebnissatzes per Klick",
      "Klick auf Titel oder Contributor führt sofort in die Tiefe",
      "Direkte „Auf Adobe Stock ansehen“-Links",
    ],
    steps: [
      { title: "Suchmodus wählen", detail: "Wählen Sie Keyword (entdecken, was sich in einer Nische verkauft), Contributor-ID (ein ganzes Portfolio analysieren) oder Asset-ID (exakte Downloads einer Datei)." },
      { title: "Suchen", detail: "Geben Sie ein Keyword ein (z. B. „summer travel icons“), eine Contributor-ID aus der Adobe-Stock-URL oder eine Asset-ID (z. B. 2050460487) und starten Sie die Suche." },
      { title: "Filtern und sortieren", detail: "Verfeinern Sie mit dem KI-Filter und dem Medientyp-Filter, dann sortieren Sie nach Performance, Downloads oder Datum, um Gewinner schnell zu finden." },
      { title: "Ergebnisse analysieren", detail: "Lesen Sie die Statistikleiste für Downloads gesamt, Durchschnitt und Top-Performer. Jede Karte zeigt Downloads, Upload-Datum, Kategorie und falls zutreffend ein KI-Badge." },
      { title: "Vertiefen oder exportieren", detail: "Klicken Sie auf einen Titel, um das Asset zu suchen, auf einen Contributor-Namen, um sein Portfolio zu öffnen — oder exportieren Sie alles als CSV für die Tabellenanalyse." },
    ],
    tips: [
      "Asset-ID = exakte Downloadzahl einer einzelnen Datei",
      "Contributor-ID = Portfolios und Keyword-Strategien der Konkurrenz ausspionieren",
      "Der Filter Nur KI / Ohne KI zeigt, wie viel einer Nische inzwischen KI-generiert ist",
    ],
    output: "Live-Downloadzahlen, Portfolio-Analyse, Wettbewerbs-Insights, CSV-Export",
  },

  dashboard: {
    features: [
      "4 Kopfstatistiken: Verfolgte gesamt, Downloads gesamt, steigende Anzahl und Durchschnitt",
      "Gesamter Download-Trendverlauf über alle verfolgten Assets",
      "Balkendiagramm der Top-Performer",
      "Ein-Klick-Aktualisierung holt Live-Daten für jedes verfolgte Asset",
      "Snapshot-Historie pro Asset — sehen Sie zu, wie Downloads über die Zeit wachsen",
      "Zeitstempel der letzten Aktualisierung",
      "Leerzustands-Hinweis mit direktem Link zum Adobe Tracker",
    ],
    steps: [
      { title: "Zuerst Assets verfolgen", detail: "Suchen Sie eine Asset-ID auf der Adobe-Tracker-Seite, um sie zu verfolgen — verfolgte Assets erscheinen automatisch hier." },
      { title: "Statistiken prüfen", detail: "Sehen Sie verfolgte Assets gesamt, Downloads gesamt, wie viele steigen und Ihren Durchschnitt pro Asset." },
      { title: "Trends lesen", detail: "Das Gesamttrend-Diagramm aggregiert Ihre Downloads über die Zeit; das Balkendiagramm rangiert Ihre Top-5-Assets." },
      { title: "Daten aktualisieren", detail: "Klicken Sie auf „Refresh Data“, um die neuesten Downloadzahlen aller verfolgten Assets zu holen und einen neuen Snapshot aufzuzeichnen." },
    ],
    tips: [
      "Aktualisieren Sie regelmäßig — mehr Snapshots bedeuten glattere Trendkurven",
      "Die Steigend-Statistik zeigt, wie viele Assets seit der letzten Prüfung Downloads gewonnen haben",
    ],
    output: "Portfolio-Übersicht, aggregiertes Trenddiagramm, Top-Performer",
  },

  portfolio: {
    features: [
      "Asset-Karten mit Thumbnails und Medientyp-Badges",
      "Filter: Alle / Bild / Vektor / Video",
      "Sortierung nach meisten Downloads, Performance oder neueste",
      "Kopfstatistiken: Assets gesamt, Downloads gesamt und Durchschnitts-Performance",
      "Pro Asset: Tags, Upload-Datum, Downloadzahl und Performance-Score",
      "Farbcodierter Performance-Score (grün 80+, gelb 50+, rot darunter)",
    ],
    steps: [
      { title: "Portfolio öffnen", detail: "Alle Ihre Assets erscheinen in einem responsiven Kartengitter mit Thumbnails und Badges." },
      { title: "Nach Typ filtern", detail: "Wechseln Sie zwischen Alle, Bild, Vektor und Video, um sich auf eine Asset-Art zu konzentrieren." },
      { title: "Sortieren", detail: "Ordnen Sie nach meisten Downloads, Performance-Score oder Upload-Datum (neueste zuerst)." },
      { title: "Assets prüfen", detail: "Jede Karte zeigt Tags, Upload-Datum, Downloads und einen Performance-Score von 0–100." },
    ],
    tips: [
      "Sortieren Sie nach Performance, um Schwachstellen zu finden, die neue Keywords verdienen",
      "Vergleichen Sie neueste Uploads mit Ihrem Durchschnitt, um die frühe Resonanz einzuschätzen",
    ],
    output: "Geordnetes Asset-Raster mit Performance-Bewertung",
  },

  watchlist: {
    features: [
      "Sternen Sie jedes Asset aus den Suchergebnissen aus, um es hier zu speichern",
      "Persistente Liste, an Ihr angemeldetes Konto gebunden",
      "Sortierung nach Downloads oder Performance",
      "Entfernen mit einem Klick über den Papierkorb-Button beim Hovern",
      "Funktioniert vollständig offline mit lokalem Speicher",
    ],
    steps: [
      { title: "Anmelden", detail: "Die Watchlist benötigt ein (kostenloses) Konto — melden Sie sich an, um sie freizuschalten." },
      { title: "Favoriten hinzufügen", detail: "Finden Sie Assets über den Adobe Tracker und sternen Sie sie, um sie zu Ihrer Watchlist hinzuzufügen." },
      { title: "Beobachten und sortieren", detail: "Sortieren Sie Ihre gespeicherten Assets nach Downloads oder Performance, um die wichtigen im Blick zu behalten." },
      { title: "Jederzeit entfernen", detail: "Hoveren Sie über eine Karte und klicken Sie auf das Papierkorb-Symbol, um sie aus der Liste zu nehmen." },
    ],
    tips: [
      "Nutzen Sie sie als Moodboard der Bestseller der Konkurrenz, die Sie schlagen wollen",
    ],
    output: "Persönliche Watchlist Ihrer Lieblings-Assets",
  },

  "svg-video": {
    features: [
      "Exportformate: MP4 (FFmpeg-Encoder), WebM und GIF",
      "MP4 wird automatisch gewählt, wenn der Encoder verfügbar ist; WebM funktioniert überall",
      "Auflösungen: 720p, 1080p, 4K Ultra HD, 1:1 Quadrat und 9:16 vertikale Story",
      "Bildrate bis 60 FPS für ultrasmoothe Bewegung",
      "Dauer automatisch aus der Animations-Timeline des SVG erkannt",
      "Hintergrundoptionen: Transparent, Volltonfarbe oder Verlauf",
      "Canvas-Filter: Unschärfe, Helligkeit, Kontrast, Farbtonrotation, Sepia und Invertieren",
      "Soundtrack — MP3/WAV hochladen und er wird ins Video gemischt",
      "Text-Wasserzeichen mit Größen-, Deckkraft- und Positionskontrolle",
      "Erweiterte Encodierung: eigene Bitrate und H.264-Codec-Profil (High/Main/Baseline)",
      "Batch-Warteschlange, um viele SVGs in einem Durchlauf zu konvertieren",
      "Raw-SVG-Code einfügen oder Datei per Drag & Drop mit sofortiger Live-Vorschau",
    ],
    steps: [
      { title: "SVG hochladen oder einfügen", detail: "Ziehen Sie ein animiertes SVG per Drag & Drop hinein oder fügen Sie seinen XML-Code ein. Die Live-Vorschau rendert sofort — SMIL- und CSS-Animationen werden unterstützt." },
      { title: "Format und Qualität wählen", detail: "Wählen Sie MP4, WebM oder GIF, stellen Sie Auflösung (bis 4K), FPS (bis 60) und optional eigene Bitrate und Codec-Profil ein." },
      { title: "Canvas stylen", detail: "Legen Sie einen transparenten, farbigen oder Verlaufs-Hintergrund fest, stellen Sie Filter ein (Unschärfe, Helligkeit, Kontrast, Farbton, Sepia, Invertieren) und fügen Sie ein Wasserzeichen hinzu." },
      { title: "Sound hinzufügen (optional)", detail: "Laden Sie einen MP3/WAV-Soundtrack hoch — er wird ins exportierte Video gemischt." },
      { title: "Konvertieren und exportieren", detail: "Klicken Sie auf „Convert & Export“. Ein Fortschrittsbalken verfolgt Frames und geschätzte Größe, dann lädt Ihr Video automatisch herunter." },
    ],
    tips: [
      "60 FPS + 1080p ist der Sweet Spot für Motion Graphics",
      "Transparente Hintergründe sind perfekt für Overlays",
      "Nutzen Sie den Batch-Warteschlangen-Tab, um einen ganzen Ordner voller SVGs zu konvertieren",
      "MP4 erscheint nur, wenn der Encoder online ist — sonst ist WebM vorausgewählt",
    ],
    output: "MP4-/WebM-/GIF-Videodateien mit Audio und Wasserzeichen",
  },

  dither: {
    features: [
      "Ordered (Bayer) Dithering: 2×2-, 4×4-, 8×8- und 16×16-Matrizen",
      "Fehlerdiffusions-Algorithmen: Floyd-Steinberg, Atkinson, Jarvis-Judice-Ninke, Stucki und Burkes",
      "Ein-Klick-Presets: Game Boy, Commodore 64 und mehr",
      "Schwellwert-, Körnung-, Posterisierungs- und Pixelierungs-Regler",
      "Eigene Farbpaletten mit einstellbarer Farbanzahl (Zweiton-Ausgabe)",
      "Kanalauswahl (Luminanz und mehr)",
      "Live-Vorschau mit sofortigem Re-Render bei jeder Änderung",
      "PNG-Export",
    ],
    steps: [
      { title: "Bild hochladen", detail: "Ziehen Sie ein beliebiges Bild (PNG, JPG, WEBP) per Drag & Drop hinein — die Vorschau rendert sofort." },
      { title: "Algorithmus wählen", detail: "Wählen Sie eine Bayer-Matrix für klassisches Ordered Dithering oder ein Fehlerdiffusions-Verfahren für fotografische Looks." },
      { title: "Look einstellen", detail: "Passen Sie Schwellwert, Körnung, Posterisierungsstufen und Pixelierung an. Wenden Sie ein Preset wie Game Boy an oder legen Sie Ihre eigene 2-Farb-Palette fest." },
      { title: "Exportieren", detail: "Laden Sie das geditherte Ergebnis als PNG herunter." },
    ],
    tips: [
      "Bayer 4×4 liefert den Retro-Pixel-Art-Look",
      "Atkinson imitiert das klassische Macintosh-Dithering",
      "Game-Boy-Preset + Pixelierung = sofortige Nostalgie",
    ],
    output: "Gedithertes PNG-Bild",
  },

  halftone: {
    features: [
      "3 Halftone-Engines: Amplitudenmodulation, Frequenzmodulation und Fehlerdiffusion",
      "Lineare und hexagonale Gittertypen",
      "Runde und quadratische Punktstile",
      "7 Presets: Zeitung, Pop Art, Risograph, CMYK-Druck, Dot Matrix, Organisch und High Contrast",
      "Kontrolle über Punktabstand, Rotationwinkel, Gesamtgröße, Gamma und Unschärfe",
      "Kontrast-, Helligkeits- und Sättigungsanpassungen",
      "Eingeschränkte Farbpaletten — vom Zweiton bis Mehrfarbig — plus eigener Hintergrund",
      "Echtzeit-Re-Render-Vorschau",
    ],
    steps: [
      { title: "Bild hochladen", detail: "Legen Sie ein beliebiges Foto oder Grafik ab — die Halftone-Vorschau rendert in Echtzeit neu, während Sie justieren." },
      { title: "Engine und Gitter wählen", detail: "Wählen Sie Amplituden-/Frequenzmodulation oder Fehlerdiffusion, dann ein lineares oder hexagonales Gitter mit runden oder quadratischen Punkten." },
      { title: "Stylen", detail: "Stellen Sie Abstand, Rotation, Gamma und Farbkorrekturen ein. Laden Sie ein Preset wie Pop Art oder Risograph, oder bauen Sie eine eigene Palette." },
      { title: "Exportieren", detail: "Speichern Sie Ihr Halftone-Kunstwerk als PNG." },
    ],
    tips: [
      "45°-Rotation = klassischer Druck-Look",
      "Frequenzmodulation liefert organische, stochastische Texturen",
      "Das Risograph-Preset eignet sich perfekt für Plakat-Style-Stock-Grafiken",
    ],
    output: "Halftone-PNG-Kunstwerk",
  },

  bento: {
    features: [
      "Automatisch erzeugte Bento-Layouts mit gemischten Zellgrößen",
      "Shuffle erzeugt sofort frische Anordnungen",
      "Raster-, Abstands- und Layout-Regler aus der Kopfzeile",
      "Zellweise Schattierung mit konsistenter Ästhetik",
      "PNG-Export mit Skalierungsoptionen (1x / 2x / 3x)",
      "SVG-Export (Vektor) für unbegrenzte Auflösung",
    ],
    steps: [
      { title: "Layout erzeugen", detail: "Der Builder erstellt automatisch ein Bento-Raster aus gemischten Zellgrößen." },
      { title: "Shuffle und justieren", detail: "Klicken Sie auf Shuffle für eine neue Anordnung, oder feinjustieren Sie Rastergröße und Abstand über die Kopfzeilen-Regler." },
      { title: "Exportieren", detail: "Als PNG herunterladen (1x, 2x oder 3x Skalierung) oder als SVG-Vektor für Design-Tools." },
    ],
    tips: [
      "PNG-Skalierung 2x–3x ist ideal für Social-Media-Posts",
      "Der SVG-Export erlaubt es, Zellen in Illustrator/Figma umzufärben",
    ],
    output: "Bento-Raster als PNG (1x/2x/3x) oder SVG",
  },

  "color-palette": {
    features: [
      "Extraktion von 3–12 dominierenden Farben aus jedem Bild",
      "Jedes Farbfeld zeigt HEX, RGB, Farbnamen und Bildanteil in Prozent",
      "Klick auf ein Farbfeld kopiert seinen HEX-Code",
      "Shuffle-Button zum Umordnen der Palette",
      "Automatisch erzeugte CSS-:root-Variablen",
      "Ein-Klick-CSS-Kopie der gesamten Palette",
    ],
    steps: [
      { title: "Bild hochladen", detail: "Ziehen Sie ein Foto per Drag & Drop hinein — Farben werden sofort mit Namen und Prozenten extrahiert." },
      { title: "Farbanzahl anpassen", detail: "Nutzen Sie den Schieberegler (3–12) für weniger dominante Töne oder ein feineres Spektrum, dann extrahieren Sie neu." },
      { title: "Farben kopieren", detail: "Klicken Sie auf ein Farbfeld, um den HEX-Code zu kopieren. Die Seitenleiste listet jede Farbe auch mit ihrem RGB-Wert." },
      { title: "CSS kopieren", detail: "Holen Sie sich die ganze Palette als :root-CSS-Variablen, bereit zum Einfügen in ein Stylesheet." },
    ],
    tips: [
      "5–6 Farben sind der Sweet Spot für Design-Systeme",
      "Der Prozentsatz zeigt das visuelle Gewicht jeder Farbe im Bild",
      "Shuffeln Sie vor dem Export für eine bessere Reihenfolge",
    ],
    output: "Farbpalette (HEX/RGB/Name/Prozent) + CSS-Variablen",
  },

  "color-harmonizer": {
    features: [
      "7 Harmonietypen: Komplementär, Analog, Triadisch, Gespalten-komplementär, Quadrat, Tetrade und Monochrom",
      "Interaktive Farbvisualisierung mit Live-Markern",
      "Rollenbeschriftungen an jeder erzeugten Farbe (Basis, Komplementär, Triadisch 120° …)",
      "Monochrom-Modus erzeugt 5 Schattierungen (Dunkel → Hell)",
      "Klick-zum-Kopieren HEX für jedes Farbfeld",
      "Download der gesamten Harmonie als CSS-Datei",
    ],
    steps: [
      { title: "Basisfarbe wählen", detail: "Nutzen Sie den Farbwähler oder geben Sie einen HEX-Code ein — das Rad aktualisiert sich sofort." },
      { title: "Harmonie wählen", detail: "Wechseln Sie zwischen den 7 Harmonietypen und sehen Sie zu, wie die Farbfelder mit Rollenbeschriftungen neu entstehen." },
      { title: "Kopieren oder exportieren", detail: "Klicken Sie auf ein Farbfeld, um seinen HEX zu kopieren, oder laden Sie die ganze Harmonie als CSS-Datei herunter." },
    ],
    tips: [
      "Analog (+/-30°) für ruhige, stimmige Designs",
      "Komplementär für maximalen Kontrast",
      "Monochrom ist die sicherste Palette für Anfänger",
    ],
    output: "Farbharmonie-Palette mit Rollenbeschriftungen + CSS-Export",
  },

  ascii: {
    features: [
      "Einstellbare Ausgabebreite: 30–200 Zeichen",
      "Mehrere Zeichensätze (Standard, Detailed, Blocks, Binary und mehr)",
      "Invertieren-Umschalter für dunkel-auf-hell / hell-auf-dunkel-Looks",
      "Der Farbmodus mappt Helligkeit auf eine Grün→Rot-Farbskala",
      "Text in die Zwischenablage kopieren",
      "Ausgabe als TXT-Datei speichern",
      "Live-Vorschau mit Zeichen-für-Zeichen-Farbrendering",
    ],
    steps: [
      { title: "Bild hochladen", detail: "Legen Sie ein beliebiges Bild (JPG, PNG, WEBP, GIF) ab oder klicken Sie zum Durchsuchen — ASCII-Art entsteht sofort." },
      { title: "Breite einstellen", detail: "Schieben Sie zwischen 30 und 200 Zeichen Breite. Mehr Zeichen = mehr Detail." },
      { title: "Zeichensatz wählen", detail: "Wählen Sie einen Zeichensatz aus dem Dropdown; die exakte Zeichenrampe darunter zeigt ihn an." },
      { title: "Stylen und exportieren", detail: "Aktivieren Sie Invertieren oder Farbmodus, dann Text kopieren oder TXT speichern." },
    ],
    tips: [
      "Breite 80–120 balanciert Detail und Lesbarkeit",
      "Der Blocks-Zeichensatz gibt einen kraftvollen, modernen Look",
      "Der Farbmodus sieht auf dunklen Hintergründen großartig aus",
    ],
    output: "ASCII-Textkunst (kopieren oder als TXT herunterladen)",
  },

  trending: {
    features: [
      "Live-Trenddaten direkt von Adobe Stock",
      "Zeiträume: Gesamt, diese Woche, dieser Monat und dieses Quartal",
      "Trend-Nischen mit Nachfrage-Score, Downloads, Wettbewerb und Opportunity-Bewertung",
      "Top-Contributor mit Asset-Zahlen, Downloads und Momentum",
      "Kategorieaufschlüsselung mit farbcodierten Balken und Top-Downloadzahlen",
      "Kuratiertes Markt-Insights-Panel",
      "Die Sortierung zeigt kürzlich hochgeladenen vs. meistgeladenen Content",
      "Manuelle Aktualisierung für die neuesten Daten",
    ],
    steps: [
      { title: "Zeitraum wählen", detail: "Wechseln Sie zwischen Gesamt, Woche, Monat oder Quartal — frischere Zeiträume zeigen neuere Chancen." },
      { title: "Trend-Nischen scannen", detail: "Jede Nischenkarte zeigt einen Nachfrage-Score, Downloadvolumen, Wettbewerbsniveau und eine Opportunity-Bewertung." },
      { title: "Top-Contributor studieren", detail: "Sehen Sie, wer gerade an Schwung gewinnt und wie viele Assets und Downloads sie haben." },
      { title: "Kategorien prüfen", detail: "Die farbcodierte Kategorieaufschlüsselung zeigt, welche Content-Typen die meisten Downloads tragen." },
    ],
    tips: [
      "Wochenansicht = frischeste, am wenigsten gesättigte Chancen",
      "Nischen mit hohen Downloads + niedrigem Wettbewerb sind Ihre Einstiegspunkte",
      "Gleichen Sie Trend-Nischen mit dem Keywords-Tool ab",
    ],
    output: "Trend-Nischen, Contributor, Kategorieaufschlüsselung und Insights",
  },

  keywords: {
    features: [
      "Sofortige Analyse jedes Keywords",
      "Suchvolumen-Level: sehr hoch → sehr niedrig, mit Demand-Score (0–100)",
      "Wettbewerbsniveau mit Competition-Score (0–100)",
      "Vorgeschlagene Nische mit monatlichen Suchschätzungen",
      "Trendrichtung (steigend / stabil / fallend) mit monatlichem Wachstum in %",
      "Nummerierte, umsetzbare Optimierungstipps",
      "Klickbare verwandte Keywords für Kettenrecherche",
      "Letzte Suchhistorie (die letzten 10)",
      "Kurzfassungs-Urteil: hohe oder niedrige Chance",
      "16 beliebte Keyword-Kurzbefehle für schnelle Starts",
    ],
    steps: [
      { title: "Keyword eingeben", detail: "Tippen Sie ein beliebiges Keyword oder klicken Sie auf einen der beliebten Kurzbefehle (business, technology, nature …)." },
      { title: "Scores lesen", detail: "Vergleichen Sie den Demand-Score mit dem Competition-Score — Nachfrage über Wettbewerb = Chance." },
      { title: "Nische und Trend prüfen", detail: "Die vorgeschlagene Nische zeigt den Blickwinkel; das Trend-Badge zeigt, wohin das Keyword geht." },
      { title: "Verwandten Keywords folgen", detail: "Klicken Sie auf ein verwandtes Keyword, um es sofort zu analysieren und eine Keyword-Map für Ihre Uploads aufzubauen." },
    ],
    tips: [
      "Steigender Trend + mittlerer Wettbewerb = bestes Upload-Ziel",
      "Nutzen Sie verwandte Keywords als tatsächliche Keyword-Liste Ihres Assets",
      "Keywords mit sehr hohem Wettbewerb brauchen außergewöhnliche Umsetzung, um zu ranken",
    ],
    output: "Nachfrage-/Wettbewerbsscores, Nischenvorschlag, Trendrichtung, Tipps und verwandte Keywords",
  },

  "portfolio-analytics": {
    features: [
      "Radar-Diagramm mit 8 Metriken: Downloads, Aufrufe, Likes, Umsatz, Rang, Keywords, Konstanz und Nischen-Score",
      "Diagrammtyp umschalten: Radar oder Polargebiet",
      "3 Profile vergleichen: Ihr Portfolio vs. Top-Performer vs. Marktdurchschnitt",
      "Gruppierte Balkendiagrammansicht derselben Metriken",
      "4 Zeiträume: 7 / 30 / 90 Tage und 1 Jahr",
      "Randomisieren, um Szenarien zu simulieren und Profile zu vergleichen",
      "Beide Diagramme einzeln ein- oder ausblenden",
      "Automatisch berechneter Portfolio-Score",
    ],
    steps: [
      { title: "Radar lesen", detail: "Ihr Portfolio wird gegen einen Top-Performer und den Marktdurchschnitt über alle 8 Metriken geplottet — Einbrüche zeigen genau, wo Sie besser werden müssen." },
      { title: "Ansichten wechseln", detail: "Wechseln Sie zwischen Radar und Polargebiet, oder blenden Sie es aus und nutzen Sie das gruppierte Balkendiagramm für präzise Vergleiche." },
      { title: "Zeitraum ändern", detail: "Wechseln Sie zwischen 7, 30, 90 Tagen und 1 Jahr, um zu sehen, wie sich das Bild verändert." },
      { title: "Simulieren", detail: "Nutzen Sie Randomisieren, um verschiedene Metrik-Profile gegen den Benchmark zu testen." },
    ],
    tips: [
      "Lücken bei Keywords & Nischen-Score = Metadaten-Probleme, keine Content-Probleme",
      "Konstanz zählt mehr als jeder einzelne Spike",
      "Vergleichen Sie die Form Ihres Umsatzes mit der des Top-Performers, um Preis-/Qualitätslücken zu finden",
    ],
    output: "Radar-/Polar- und Balkendiagramme mit Benchmarking von 8 Portfolio-Metriken",
  },

  trend: {
    features: [
      "Kategorienbasierte Trendprognose aus Live-Adobe-Stock-Daten",
      "Monatsprognose-Ansicht je Kategorie",
      "Trendkarten mit Wachstum in %, Saison-Tag und Confidence-Score",
      "4 Kopfstatistiken: Ø Wachstum, hohe Chancen, Ø Confidence und Top-Trend",
      "Suchfilter über Trendnamen",
      "Trend-Detailpanel per Klick",
      "Zeitraum-Filterung",
      "CSV-Export des Trend-Datensatzes",
      "Zeitstempel der letzten Aktualisierung und manuelle Aktualisierung",
    ],
    steps: [
      { title: "Kategorie wählen", detail: "Wählen Sie eine Content-Kategorie (z. B. Technology) und einen Zeitraum — Trends laden aus der Adobe-Stock-API." },
      { title: "Statistiken lesen", detail: "Durchschnittliches Wachstum, Anzahl hoher Chancen, durchschnittliche Confidence und der aktuelle Top-Trend auf einen Blick." },
      { title: "Monatsprognose öffnen", detail: "Der Prognoseabschnitt projiziert, wie sich die Kategorie Monat für Monat entwickelt." },
      { title: "Trends vertiefen", detail: "Klicken Sie auf eine Trendkarte für Details inklusive Saison und Confidence, oder exportieren Sie alles als CSV." },
    ],
    tips: [
      "Der Confidence-% sagt, wie verlässlich eine Prognose ist — handeln ab 70 %",
      "Saison-Tags helfen, Uploads 2–3 Monate im Voraus zu planen",
      "Gleichen Sie mit Trending ab, bevor Sie sich auf eine Nische festlegen",
    ],
    output: "Kategorieprognosen, Trendkarten mit Confidence, CSV-Export",
  },

  candlestick: {
    features: [
      "Diagrammtypen: Candlestick, Linie, Fläche und Balken",
      "5 Gleitende-Durchschnitt-Typen: SMA, EMA, WMA, DEMA und TEMA",
      "Bollinger-Bänder-Overlay",
      "RSI-Panel (Relative Strength Index)",
      "MACD-Panel (Moving Average Convergence Divergence)",
      "Eigene CSV-Daten einfügen oder Beispieldaten nutzen",
      "Interaktives Diagramm mit Tooltips",
      "PNG-Export in hoher Auflösung",
    ],
    steps: [
      { title: "Daten eingeben", detail: "Fügen Sie OHLC-Daten ein (Datum, Open, High, Low, Close, Volume) oder laden Sie den Beispieldatensatz." },
      { title: "Diagrammtyp wählen", detail: "Wechseln Sie zwischen Candlestick-, Linien-, Flächen- und Balkenansicht." },
      { title: "Indikatoren hinzufügen", detail: "Aktivieren Sie Gleitende Durchschnitte (SMA/EMA/WMA/DEMA/TEMA), Bollinger-Bänder sowie RSI- und MACD-Panels." },
      { title: "Exportieren", detail: "Laden Sie das fertige Diagramm als PNG herunter." },
    ],
    tips: [
      "Der EMA reagiert schneller als der SMA — nutzen Sie beide, um Crossovers zu erkennen",
      "RSI über 70 / unter 30 signalisiert überkauft/überverkauft",
      "MACD-Crossovers bestätigen Momentum-Wechsel",
    ],
    output: "Interaktives Finanzdiagramm mit Indikatoren (PNG-Export)",
  },

  heatmap: {
    features: [
      "30 Content-Kategorien (KI & Tech → Gaming), skaliert nach Marktwert",
      "Wachstum in % je Kategorie mit grüner/roter Performance-Färbung",
      "6 Farbpaletten: Performance, Ozean, Sonnenuntergang, Wald, Neon und Graustufen",
      "Sortierung nach Name, Wert oder Wachstum",
      "Beschriftungen und Wachstumsprozente umschaltbar",
      "Minimalwert-Filter, um kleine Kategorien auszublenden",
      "Vollbildmodus für Präsentationen",
      "Hover-Tooltips mit exakten Werten",
    ],
    steps: [
      { title: "Karte scannen", detail: "Blockgröße = Marktwert; Farbe = Wachstum. Große grüne Blöcke sind die stärksten Märkte im Moment." },
      { title: "Palette wechseln", detail: "Probieren Sie Ozean, Sonnenuntergang, Wald, Neon oder Graustufen für unterschiedliche visuelle Lesarten derselben Daten." },
      { title: "Filtern und sortieren", detail: "Erhöhen Sie den Minimalwert-Regler, um sich auf große Märkte zu konzentrieren, oder sortieren Sie nach Wachstum, um Mover zu finden." },
      { title: "Vollbild aktivieren", detail: "Für Präsentationen oder Screenshots in den Vollbildmodus erweitern." },
    ],
    tips: [
      "Nach Wachstum sortieren, um schnell steigende Nischen früh zu erkennen",
      "Dunkelrote Kategorien sind gesättigt oder schrumpfen — zweimal überlegen",
      "KI & Tech sowie Weltraum zeigen derzeit das stärkste Wachstum",
    ],
    output: "Interaktive Kategorie-Heatmap mit 6 Paletten",
  },

  comparison: {
    features: [
      "8 Plattformen: Adobe Stock, Shutterstock, Getty, iStock, Canva, Dreamstime, 123RF und Pond5",
      "Linien-, Flächen- und Balkendiagrammansichten",
      "Zeiträume: 7, 14, 30 oder 60 Tage",
      "Der Normalisieren-Modus wandelt alle Reihen in %-Veränderung für einen fairen Vergleich um",
      "Korrelationsmatrix zwischen jedem Asset-Paar (farbcodiert)",
      "Statistiken je Asset: Veränderung %, Hoch, Tief und RSI",
      "Assets hinzufügen/entfernen und Daten randomisieren",
      "Vollbild-Diagrammmodus",
    ],
    steps: [
      { title: "Plattformen wählen", detail: "Starten Sie mit 4 vorgeladenen Plattformen; fügen Sie beliebige der 8 unterstützten hinzu oder entfernen Sie sie." },
      { title: "Ansicht und Zeitraum wählen", detail: "Wechseln Sie zwischen Linie/Fläche/Balken und stellen Sie 7–60-Tage-Fenster ein." },
      { title: "Normalisieren", detail: "Aktivieren Sie Normalisieren, um Prozentveränderungen statt absoluter Werte zu vergleichen — unverzichtbar, wenn die Skalen differieren." },
      { title: "Korrelationen lesen", detail: "Die Korrelationsmatrix zeigt, welche Plattformen sich gemeinsam bewegen (grün = korreliert, rot = invers). Prüfen Sie den RSI für Momentum." },
    ],
    tips: [
      "Die normalisierte Ansicht zeigt die echte relative Performance",
      "Plattformen mit niedriger Korrelation diversifizieren Ihre Einnahmen",
      "Nutzen Sie den RSI, um überhitzte Plattformen zu erkennen",
    ],
    output: "Plattformvergleich Seite an Seite mit Korrelationsmatrix und Statistiken",
  },

  "svg-eps": {
    features: [
      "SVG → EPS (PostScript)-Konvertierung im Browser — Dateien verlassen nie Ihren Rechner",
      "Zwei EPS-Versionen: EPS10 (maximale Kompatibilität) und EPS20",
      "SVG-Pfade werden zu PostScript-Pfaden konvertiert",
      "Batch-Konvertierung mehrerer Dateien",
      "Sofortiger Download der konvertierten Dateien",
    ],
    steps: [
      { title: "SVG-Dateien hochladen", detail: "Wählen Sie eine oder viele SVG-Dateien — sie stellen sich für die Batch-Verarbeitung an." },
      { title: "EPS-Version wählen", detail: "EPS10 für maximale Kompatibilität mit Stock-Plattformen und älterer Software, EPS20 für neuere Funktionen." },
      { title: "Konvertieren", detail: "Starten Sie die Konvertierung — jede Datei wird lokal in PostScript-Pfade umgewandelt." },
      { title: "Herunterladen", detail: "Sammeln Sie Ihre druckfertigen EPS-Dateien." },
    ],
    tips: [
      "EPS10 ist die sichere Wahl für Adobe-Stock-Einreichungen",
      "Alles läuft clientseitig — sicher für vertrauliche Arbeiten",
    ],
    output: "EPS10-/EPS20-Vektordateien",
  },

  "country-map": {
    features: [
      "Weltkarte plus jedes Land — suchbar nach Land oder Großstadt",
      "Bundesland/Provinz-Drilldown in ausgewählten Ländern",
      "4 Projektionen: Natural Earth, Mercator, orthografisch (Globus) und Plattkarte",
      "Straßenkartenmodus mit Live-OpenStreetMap-Daten",
      "Straßenebenen: Gebäude, Wasser, Parks und Beschriftungen — einzeln umschaltbar",
      "Straßen-Farbpaletten (Sage und mehr)",
      "Zoom-Regler mit automatischem Stadtfokus",
      "Download als PNG oder sauberes Vektor-SVG",
    ],
    steps: [
      { title: "Ort wählen", detail: "Suchen Sie ein Land oder eine Großstadt, oder wählen Sie „World“ für die volle Karte. Bundesländer/Provinzen erscheinen bei größeren Ländern." },
      { title: "Projektion wählen", detail: "Natural Earth für eine ansprechende Weltansicht, orthografisch für einen Globus, Mercator für vertraute Webkarten-Formen." },
      { title: "In den Straßenmodus wechseln (optional)", detail: "Suchen Sie eine Stadt, um echte OSM-Straßendaten zu laden — Gebäude, Wasser, Parks und Beschriftungen umschalten und eine Palette wählen." },
      { title: "Exportieren", detail: "Laden Sie Ihre Karte als hochauflösendes PNG oder als sauberes SVG-Vektorformat für Designarbeit herunter." },
    ],
    tips: [
      "Der SVG-Export ist in Illustrator voll editierbar — ideal für Stock-Kartengrafiken",
      "Orthografische Globen verkaufen sich gut als Tech-/Reise-Hintergründe",
      "Straßenmodus + eigene Paletten = einzigartige Ortsgrafiken",
    ],
    output: "Länder-/Straßenkarten als PNG oder Vektor-SVG",
  },

  mockup: {
    features: [
      "Geräterahmen: iPhone, MacBook und mehr",
      "Hintergrundfarb-Presets plus eigene Farbauswahl",
      "Automatische Screen-Platzierung, an jedes Gerät skaliert",
      "Realistische Geräteschatten",
      "PNG-Export in hoher Auflösung mit 2x",
    ],
    steps: [
      { title: "Design hochladen", detail: "Ziehen Sie einen PNG/JPG-Screenshot oder ein Artwork per Drag & Drop hinein." },
      { title: "Gerät wählen", detail: "Wählen Sie iPhone, MacBook oder einen anderen Rahmen — Ihr Design landet automatisch auf dem Bildschirm." },
      { title: "Hintergrund festlegen", detail: "Wählen Sie aus Preset-Farben oder picken Sie eine eigene, zu Ihrer Marke passende." },
      { title: "Exportieren", detail: "Laden Sie ein 2x-aufgelöstes PNG herunter, bereit für Portfolios und Präsentationen." },
    ],
    tips: [
      "Hellgraue Hintergründe lassen Gerätebildschirme hervorstechen",
      "2x-Export sieht auf Retina-Displays gestochen scharf aus",
    ],
    output: "Geräte-Mockup als PNG in 2x-Auflösung",
  },

  "title-optimizer": {
    features: [
      "4 Modi: Analysieren, A/B-Vergleich, Masse und Vorlagen",
      "Live-SEO-Score mit Buchstaben-Note (A+ bis F) während des Tippens",
      "Plattformspezifische Regeln für 6 Plattformen (Längenlimits und Präferenzen)",
      "Problemerkennung: Füllwörter, Länge, Groß-/Kleinschreibung, Wiederholung und mehr",
      "Stärken-Liste dessen, was bereits funktioniert",
      "Zeichen-Gewichtungskarte — SEO-Wert jedes Wortes, farbcodiert",
      "Keyword-Dichte-Prüfung mit Status je Wort",
      "Kategorie-Übereinstimmungs-Score und Suchvolumen je Keyword",
      "Auto-optimierter Titel + Keyword-Vorschläge",
      "Der Masse-Modus bewertet viele Titel gleichzeitig mit CSV-Export",
      "Bewährte Titel-Formelvorlagen mit Beispielen und Ein-Klick-Verwendung",
    ],
    steps: [
      { title: "Titel eingeben", detail: "Fügen Sie Ihren Stock-Titel ein — Score, Note, Probleme und Stärken aktualisieren sich live." },
      { title: "Tief analysieren", detail: "Prüfen Sie die Zeichen-Gewichtungskarte, die Dichteprüfung, Kategorie-Übereinstimmung und Suchvolumina, um den Wert Wort für Wort zu sehen." },
      { title: "Optimierten Titel anwenden", detail: "Kopieren Sie den auto-optimierten Titel und die vorgeschlagenen Keywords, dann bewerten Sie neu, um die Verbesserung zu bestätigen." },
      { title: "A/B oder Masse", detail: "Vergleichen Sie zwei Titel direkt im A/B-Tab, oder bewerten Sie Dutzende gleichzeitig im Masse-Modus mit CSV-Export." },
      { title: "Formeln lernen", detail: "Öffnen Sie Vorlagen für bewährte Titel-Formeln mit echten Beispielen, die Sie per Klick anwenden können." },
    ],
    tips: [
      "Zielen Sie auf 80+ Punkte, bevor Sie hochladen",
      "Null Füllwörter bringt sofort +15 Punkte",
      "Beginnen Sie Titel mit dem Motiv — nie mit „A“ oder „The“",
    ],
    output: "SEO-Score und Note, optimierter Titel, Keyword-Vorschläge, Masse-CSV-Bericht",
  },

  events: {
    features: [
      "Vollständiger Event-Kalender 2026 mit Feiertagen und Gedenktagen",
      "Navigation Monat für Monat mit heutiger Hervorhebung",
      "Event-Detail-Seitenpanel für den gewählten Tag",
      "Punkte an jedem Tag mit Event",
      "Deckt weltweite Tage (Earth Day, Frauentag, Mental Health Day …), nationale Feiertage und spaßige Gedenktage ab",
      "Gebaut, um saisonale Stock-Uploads vor der Nachfrage zu planen",
    ],
    steps: [
      { title: "Das Jahr durchsehen", detail: "Blättern Sie mit den Pfeilen durch die Monate — Event-Tage sind im Raster markiert." },
      { title: "Event öffnen", detail: "Klicken Sie auf einen markierten Tag, um die Event-Details im Seitenpanel zu sehen." },
      { title: "Vorausplanen", detail: "Notieren Sie Events 2–3 Monate im Voraus und planen Sie thematischen Content (Halloween im August, Valentinstag im Dezember)." },
    ],
    tips: [
      "Käufer suchen saisonalen Content 6–10 Wochen im Voraus",
      "Kombinieren Sie jedes Event mit dem Keywords-Tool, um die richtigen Begriffe zu finden",
      "Spaß-Gedenktage (Cat Day, Coffee Day) sind Gold mit wenig Wettbewerb",
    ],
    output: "Event-Kalender für saisonale Content-Planung",
  },
};
