// ─── Event Calendar Data ───
// Rich event dataset for the /event-calendar planner page: category, a short
// stock-content idea and 2026 dates for movable religious feasts. The stock
// ideas and copied prompts stay English on purpose — they are content for the
// stock platforms, not UI (same rule as the AI metadata tools).
// Tuple layout keeps the file compact: [month(1-12), day, title, category, idea]

export type EventCategory =
  | "international"
  | "national"
  | "religious"
  | "cultural"
  | "fun"
  | "food"
  | "health"
  | "business"
  | "awareness"
  | "family"
  | "technology";

export interface CalendarEvent {
  id: string;
  month: number; // 1–12
  day: number;
  title: string;
  category: EventCategory;
  stockIdea: string;
  date: string; // ISO-ish "2026-01-05" for sorting/filtering
}

type EventTuple = [number, number, string, EventCategory, string];

const EVENTS_2026: EventTuple[] = [
  // ─── January ───
  [1, 1, "New Year's Day", "international", "Fireworks over city skyline, champagne toast, countdown clock."],
  [1, 1, "Global Family Day", "family", "Diverse family holding hands, peace symbol, picnic scene."],
  [1, 1, "Copyright Law Day", "business", "Copyright symbol ©, legal gavel, document protection."],
  [1, 2, "World Introvert Day", "health", "Cozy reading nook with tea, blanket, rain on window."],
  [1, 2, "National Science Fiction Day", "fun", "Retro robot toy, galaxy backdrop, futuristic neon."],
  [1, 4, "World Braille Day", "international", "Braille text close-up, fingertip reading, accessibility."],
  [1, 4, "National Trivia Day", "fun", "Quiz night with buzzer, friends at pub table, question marks."],
  [1, 5, "National Bird Day", "national", "Colorful songbird on branch, binoculars in meadow, birdwatching."],
  [1, 12, "National Mentoring Day", "business", "Senior mentor guiding young professional at desk, handshake."],
  [1, 15, "Martin Luther King Jr. Day", "cultural", "Diverse hands together, unity concept, soft studio light."],
  [1, 19, "National Popcorn Day", "food", "Popcorn overflowing from striped box, red cinema background."],
  [1, 21, "National Hug Day", "fun", "Warm hug between friends, cozy winter sweaters, bokeh lights."],
  [1, 24, "National Compliment Day", "fun", "Two colleagues smiling and praising each other, office setting."],
  [1, 24, "International Day of Education", "international", "Open books stack with globe, school desk, warm light."],
  [1, 26, "Australia Day", "national", "Australian flag waving, Sydney harbour, beach barbecue."],
  [1, 26, "International Customs Day", "business", "Customs officer with clipboard, cargo containers, port."],
  [1, 28, "Data Privacy Day", "technology", "Padlock on keyboard, digital security shield, blue tech glow."],
  [1, 29, "National Puzzle Day", "fun", "Jigsaw puzzle pieces connecting on table, teamwork hands."],
  // ─── February ───
  [2, 1, "National Freedom Day", "national", "Bird escaping open cage into blue sky, freedom concept."],
  [2, 2, "World Wetlands Day", "international", "Misty wetland at sunrise, heron in shallow water, reeds."],
  [2, 2, "National Hedgehog Day", "fun", "Cute hedgehog on moss, autumn leaves, macro wildlife."],
  [2, 4, "World Cancer Day", "health", "Awareness ribbon, supportive hands, soft pink light."],
  [2, 7, "National Send a Card to a Friend Day", "family", "Handwritten card with envelope, stamps and washi tape, flat lay."],
  [2, 9, "National Pizza Day", "food", "Wood-fired pizza pull with melted cheese, rustic table."],
  [2, 10, "National Umbrella Day", "fun", "Red umbrella in rain, city street reflections, splash."],
  [2, 11, "International Day of Women and Girls in Science", "international", "Young woman scientist with microscope, lab coat, confident."],
  [2, 13, "World Radio Day", "cultural", "Vintage radio microphone, broadcast studio, warm glow."],
  [2, 14, "Valentine's Day", "cultural", "Red roses and chocolate box, couple silhouette at sunset."],
  [2, 17, "Chinese New Year", "religious", "Red lanterns hanging, golden dragon dance, festive street."],
  [2, 17, "Random Acts of Kindness Day", "awareness", "Helping hand giving warm coffee to homeless, city street."],
  [2, 18, "Ramadan begins", "religious", "Crescent moon and lantern at dusk, iftar dates and tea."],
  [2, 20, "World Day of Social Justice", "international", "Raised fists of diverse people, equality concept, sky background."],
  [2, 21, "International Mother Language Day", "international", "Multilingual speech bubbles, diverse scripts typography."],
  [2, 22, "National Margarita Day", "food", "Margarita glass with lime and salt rim, beach bar."],
  [2, 23, "National Banana Bread Day", "food", "Fresh banana bread loaf slice, butter melting, cozy kitchen."],
  [2, 27, "National Strawberry Day", "food", "Fresh strawberries splashing in milk, macro food photography."],
  // ─── March ───
  [3, 1, "National Self-Injury Awareness Day", "health", "Orange awareness ribbon, supportive counseling scene."],
  [3, 3, "World Wildlife Day", "international", "Elephant family at waterhole, golden savanna light."],
  [3, 3, "World Hearing Day", "health", "Hearing aid close-up, doctor checking ear, caring clinic."],
  [3, 3, "Holi", "religious", "Color powder explosion, joyful crowd throwing gulal."],
  [3, 6, "National Employee Appreciation Day", "business", "Team celebrating with trophy, modern office applause."],
  [3, 8, "International Women's Day", "international", "Diverse women standing strong, purple backdrop, empowerment."],
  [3, 12, "Plant a Flower Day", "fun", "Hands planting marigold seedling, garden trowel, soil."],
  [3, 14, "Pi Day", "fun", "Pie with mathematical formulas chalkboard, playful nerd concept."],
  [3, 15, "World Consumer Rights Day", "business", "Shopping cart with shield, consumer protection, retail."],
  [3, 16, "National Panda Day", "fun", "Giant panda eating bamboo, lush green forest."],
  [3, 17, "St. Patrick's Day", "cultural", "Green beer and shamrocks, leprechaun hat, pub celebration."],
  [3, 18, "Global Recycling Day", "awareness", "Recycling bins sorted with materials, eco lifestyle."],
  [3, 20, "Eid al-Fitr", "religious", "Crescent moon with mosque silhouette, family feast, gold ornaments."],
  [3, 20, "International Day of Happiness", "international", "Group of friends laughing, confetti jump, pure joy."],
  [3, 20, "World Sparrow Day", "international", "Sparrow perched on branch with seeds, urban bird."],
  [3, 21, "World Poetry Day", "cultural", "Vintage typewriter with paper, dried flowers, moody desk."],
  [3, 21, "World Down Syndrome Day", "awareness", "Inclusive friends with different abilities laughing, socks."],
  [3, 21, "International Day of Forests", "international", "Dense forest canopy from below, sun rays through leaves."],
  [3, 22, "World Water Day", "international", "Clean water pouring into glass, water drop macro, blue tones."],
  [3, 24, "World Tuberculosis Day", "health", "Medical lungs awareness, doctor with stethoscope, clinic."],
  [3, 25, "Remembrance of Slavery Victims Day", "awareness", "Broken chain links on dark background, freedom concept."],
  [3, 27, "World Theatre Day", "cultural", "Red theater curtains with spotlight, vintage masks."],
  [3, 28, "Earth Hour", "awareness", "Candlelit city skyline lights-off, candle in hands."],
  // ─── April ───
  [4, 1, "April Fools' Day", "fun", "Clown nose on briefcase, playful office prank setup."],
  [4, 2, "World Autism Awareness Day", "health", "Colorful puzzle pattern heart, inclusive playground."],
  [4, 5, "Easter Sunday", "religious", "Painted easter eggs in grass basket, spring flowers, bunny."],
  [4, 7, "World Health Day", "health", "Heart-shaped stethoscope, fresh vegetables, healthy lifestyle."],
  [4, 10, "National Sibling Day", "family", "Siblings playing in park, piggyback ride, golden hour."],
  [4, 11, "National Pet Day", "family", "Cute puppy and kitten together, cozy home blanket."],
  [4, 12, "International Day of Human Space Flight", "technology", "Rocket launch at dawn, astronaut helmet reflection."],
  [4, 15, "Tax Day", "business", "Calculator with tax forms, stressed freelancer at desk."],
  [4, 15, "World Art Day", "cultural", "Artist hand with paintbrush and palette, colorful canvas."],
  [4, 16, "World Voice Day", "health", "Singer with microphone on stage, vocal performance."],
  [4, 18, "National Freedom Day", "national", "Open birdcage on windowsill, feather in sunlight."],
  [4, 20, "National Chinese Language Day", "cultural", "Chinese calligraphy brush strokes, ink and rice paper."],
  [4, 21, "World Creativity and Innovation Day", "technology", "Lightbulb made of colorful gears, creative brainstorm."],
  [4, 22, "Earth Day", "international", "Hands holding small plant with soil, green world concept."],
  [4, 23, "World Book Day", "cultural", "Open book with magical light particles, library bokeh."],
  [4, 25, "World Penguin Day", "fun", "Penguin colony on ice, antarctica wildlife, blue tones."],
  [4, 26, "World Intellectual Property Day", "business", "Lightbulb patent concept, IP shield, innovation desk."],
  [4, 29, "International Dance Day", "cultural", "Ballet dancer silhouette leap, stage dust, dramatic light."],
  [4, 30, "International Jazz Day", "cultural", "Saxophone player in smoky jazz club, moody spotlight."],
  // ─── May ───
  [5, 1, "International Workers' Day", "international", "Worker fists with safety helmets, industrial unity."],
  [5, 3, "World Press Freedom Day", "international", "Journalist with press badge, newsroom, camera flashes."],
  [5, 4, "Star Wars Day", "fun", "Toy lightsaber duel silhouette, galaxy backdrop, playful."],
  [5, 4, "International Firefighters Day", "health", "Firefighter silhouette in smoke, heroic stance, red truck."],
  [5, 5, "Cinco de Mayo", "cultural", "Mariachi guitar and sombrero, colorful papel picado."],
  [5, 8, "World Red Cross Day", "health", "Red cross first aid kit, volunteer helping elderly."],
  [5, 10, "Mother's Day", "family", "Mother and child hugging, pink carnation bouquet, soft light."],
  [5, 12, "International Nurses Day", "health", "Nurse in scrubs smiling, stethoscope heart shape."],
  [5, 15, "International Day of Families", "family", "Multigenerational family picnic in park, golden hour."],
  [5, 16, "International Day of Light", "technology", "Prism splitting light beam, rainbow spectrum, dark room."],
  [5, 17, "World Telecommunication Day", "technology", "Global network connections over earth, satellite links."],
  [5, 20, "World Bee Day", "international", "Honeybee on lavender flower, honeycomb macro, yellow."],
  [5, 21, "International Tea Day", "food", "Steaming tea cup with leaves, tea garden harvest."],
  [5, 23, "World Turtle Day", "fun", "Sea turtle hatchling racing to ocean, sunset beach."],
  [5, 25, "National Towel Day", "fun", "Rolled towels stack with sunglasses, spa and pool vibe."],
  [5, 27, "Eid al-Adha", "religious", "Prayer mats and mosque at dawn, shared family meal."],
  [5, 31, "Vesak", "religious", "Buddha statue with lotus flowers, temple candles, serene."],
  [5, 31, "World No Tobacco Day", "health", "Broken cigarette on white, no-smoking concept, clean."],
  // ─── June ───
  [6, 1, "Global Day of Parents", "family", "Parents holding baby hands, first steps, warm home."],
  [6, 3, "World Bicycle Day", "health", "Cyclist on country road at sunrise, freedom ride."],
  [6, 5, "World Environment Day", "international", "Lush green forest with sunbeams, moss and ferns macro."],
  [6, 7, "World Food Safety Day", "health", "Food inspector checking produce, safety gloves, market."],
  [6, 8, "World Oceans Day", "international", "Sea turtle in crystal water, coral reef, underwater sunrays."],
  [6, 12, "World Day Against Child Labour", "awareness", "Small hands with pencil instead of tools, school hope."],
  [6, 14, "World Blood Donor Day", "health", "Blood donation bag with heart, caring medical hand."],
  [6, 16, "Father's Day", "family", "Father and son fishing at lake, warm sunset silhouette."],
  [6, 17, "World Day to Combat Desertification", "international", "Cracked earth meeting green oasis, climate contrast."],
  [6, 18, "International Picnic Day", "family", "Checkered picnic blanket with basket, park under tree."],
  [6, 20, "World Refugee Day", "awareness", "Single suitcase on road, hope and journey concept, dusk."],
  [6, 21, "International Yoga Day", "health", "Woman in yoga pose on cliff at sunrise, meditation calm."],
  [6, 21, "World Music Day", "cultural", "Guitar headstock close-up with festival bokeh, music notes."],
  [6, 21, "Summer Solstice", "cultural", "Longest day sunflower field, golden evening light."],
  [6, 23, "International Olympic Day", "international", "Athlete lighting torch, stadium rings, competitive spirit."],
  [6, 26, "International Day Against Drug Abuse", "health", "Supporting hands reaching out, recovery path, hopeful."],
  [6, 30, "International Asteroid Day", "technology", "Asteroid belt in deep space, telescope silhouette, stars."],
  // ─── July ───
  [7, 1, "Canada Day", "national", "Canadian flag maple leaf, rocky mountain lake, red tones."],
  [7, 4, "Independence Day (US)", "national", "American flag with fireworks, family barbecue, star spangled."],
  [7, 6, "World Sports Journalists Day", "business", "Sports reporter with microphone at stadium, press box."],
  [7, 7, "World Chocolate Day", "food", "Melted chocolate pouring, pralines assortment, dark moody."],
  [7, 11, "World Population Day", "international", "Crowded crosswalk from above, city crowd aerial."],
  [7, 12, "Malala Day", "awareness", "Girl student raising hand in classroom, education hope."],
  [7, 14, "Bastille Day", "national", "Eiffel tower with tricolor fireworks, paris celebration."],
  [7, 17, "World Emoji Day", "fun", "Yellow emoji balloons and faces, playful background."],
  [7, 18, "Nelson Mandela Day", "cultural", "Unity hands art installation, warm community tones."],
  [7, 20, "International Chess Day", "fun", "Chessboard with hand moving knight, dramatic side light."],
  [7, 20, "Moon Day", "technology", "Astronaut bootprint on lunar surface, earth in sky."],
  [7, 24, "International Selfie Day", "fun", "Group selfie with stick, tourist landmark, fun energy."],
  [7, 28, "World Hepatitis Day", "health", "Medical lab research, liver health concept, clinical blue."],
  [7, 29, "International Tiger Day", "international", "Tiger portrait piercing eyes, tall grass, wildlife."],
  [7, 30, "International Day of Friendship", "international", "Best friends jumping at beach, friendship bracelets."],
  [7, 31, "World Ranger Day", "awareness", "Forest ranger with binoculars, protected park trail."],
  // ─── August ───
  [8, 1, "Back to School", "business", "School backpack with supplies, chalkboard, bright classroom."],
  [8, 1, "World Breastfeeding Week", "health", "Mother nursing baby softly lit, tender bonding moment."],
  [8, 4, "National Sister's Day", "family", "Sisters laughing together, polaroid photos, pastel."],
  [8, 8, "International Cat Day", "fun", "Lazy cat stretching on windowsill, morning light."],
  [8, 9, "International Day of the World's Indigenous Peoples", "cultural", "Indigenous artisan weaving textiles, traditional patterns."],
  [8, 10, "World Lion Day", "international", "Male lion mane in golden light, savanna king, wildlife."],
  [8, 12, "International Youth Day", "international", "Diverse young people skateboarding, urban energy, graffiti."],
  [8, 13, "International Left-Handers Day", "fun", "Left hand writing with fountain pen, scissors and tools."],
  [8, 15, "National Relaxation Day", "health", "Hammock between palm trees, hammock book, slow living."],
  [8, 16, "International Homeless Animals Day", "awareness", "Shelter puppy behind fence hoping, adoption concept."],
  [8, 19, "World Photography Day", "cultural", "Vintage camera flat lay with photos, photographer hands."],
  [8, 19, "World Humanitarian Day", "awareness", "Aid worker distributing supplies, hopeful crowd, warm light."],
  [8, 20, "World Mosquito Day", "health", "Mosquito net over bed, tropical health protection."],
  [8, 22, "World Plant Milk Day", "food", "Almond milk pouring into glass, oats and nuts around."],
  [8, 26, "National Dog Day", "fun", "Happy golden retriever catching treat, park play."],
  [8, 27, "World River Day", "international", "Winding river aerial through valley, kayak on water."],
  [8, 28, "Raksha Bandhan", "religious", "Sister tying rakhi on brother's wrist, festive Indian setting."],
  [8, 30, "National Beach Day", "fun", "Beach umbrella and lounge chair, turquoise waves, summer."],
  // ─── September ───
  [9, 2, "World Coconut Day", "food", "Coconut with straw on beach, tropical splash."],
  [9, 5, "International Day of Charity", "awareness", "Donation box with coins and heart, volunteer giving."],
  [9, 8, "International Literacy Day", "international", "Child reading book with wonder, soft window light."],
  [9, 10, "World Suicide Prevention Day", "health", "Hopeful sunrise over calm sea, semicolon symbol, gentle."],
  [9, 13, "Grandparents' Day", "family", "Grandparents and grandchild baking cookies, flour fun."],
  [9, 15, "International Day of Democracy", "international", "Ballot box with vote, diverse hands, civic pride."],
  [9, 16, "World Ozone Day", "international", "Planet earth with atmosphere glow from space, protection."],
  [9, 21, "International Day of Peace", "international", "White dove flying with olive branch, blue sky peace."],
  [9, 22, "World Car Free Day", "awareness", "Cyclists on empty city street, green urban mobility."],
  [9, 25, "World Pharmacist Day", "health", "Pharmacist with pills organizer, pharmacy shelves."],
  [9, 26, "World Environmental Health Day", "health", "Clean river with children playing, green city park."],
  [9, 27, "World Tourism Day", "business", "Traveler with suitcase looking at mountain view, wanderlust."],
  [9, 29, "World Heart Day", "health", "Heart-healthy foods arranged as heart shape, running shoes."],
  [9, 30, "International Translation Day", "cultural", "Translator with multilingual dictionary, headset, books."],
  // ─── October ───
  [10, 1, "International Coffee Day", "food", "Latte art pouring, coffee beans scattered, morning cafe."],
  [10, 1, "International Day of Older Persons", "international", "Grandparents laughing with grandchild, wise hands, warm."],
  [10, 2, "International Day of Non-Violence", "awareness", "White dove on open palm, peaceful protest calm."],
  [10, 4, "World Animal Day", "international", "Rescue dog with volunteer, shelter hope, tender moment."],
  [10, 4, "World Space Week", "technology", "Astronaut floating with earth reflection in visor."],
  [10, 5, "World Teachers' Day", "cultural", "Teacher at chalkboard inspiring students, apples on desk."],
  [10, 9, "World Post Day", "cultural", "Vintage postage stamps collection, letter writing desk."],
  [10, 10, "World Mental Health Day", "health", "Head silhouette with flowers growing, therapy concept, calm."],
  [10, 11, "International Day of the Girl Child", "international", "Confident girl with books, bright future, school uniform."],
  [10, 11, "Navratri begins", "religious", "Garba dance with dandiya sticks, colorful Indian festive night."],
  [10, 14, "World Standards Day", "business", "Measurement calipers and blueprints, precision engineering."],
  [10, 15, "Global Handwashing Day", "health", "Hands washing with soap bubbles, clean water hygiene."],
  [10, 16, "World Food Day", "food", "Harvest basket of vegetables, farm-to-table, rustic wood."],
  [10, 17, "Eradication of Poverty Day", "awareness", "Empty bowl and helping hands, charitable giving."],
  [10, 24, "United Nations Day", "international", "UN blue flags row, global cooperation, conference hall."],
  [10, 24, "World Polio Day", "health", "Child vaccination drop, nurse smile, healthcare hope."],
  [10, 25, "World Pasta Day", "food", "Fresh pasta fettuccine with tomatoes, italian kitchen."],
  [10, 29, "International Internet Day", "technology", "Fiber optic cables glowing, data streams, network hub."],
  [10, 31, "Halloween", "fun", "Jack-o-lanterns on porch steps, spooky fog, orange glow."],
  // ─── November ───
  [11, 6, "International Day for Preventing Exploitation of Environment in War", "awareness", "Green seedling growing through rubble, resilient nature."],
  [11, 8, "Diwali", "religious", "Diyas oil lamps row with rangoli, fireworks, festive gold."],
  [11, 10, "World Science Day for Peace", "technology", "Laboratory glassware with colorful liquid, science discovery."],
  [11, 13, "World Kindness Day", "awareness", "Hands holding paper heart, kind gesture, soft pastel."],
  [11, 14, "World Diabetes Day", "health", "Glucose meter with healthy food, blue circle ribbon."],
  [11, 16, "International Day for Tolerance", "international", "Different colored hands stacked together, coexistence."],
  [11, 19, "International Men's Day", "health", "Father with son talking on bench, men's health checkup."],
  [11, 19, "World Toilet Day", "health", "Clean water tap and sanitation, global development concept."],
  [11, 20, "Universal Children's Day", "family", "Children flying kites on hill, joyful diversity, blue sky."],
  [11, 21, "World Television Day", "technology", "Retro TV stack with static screens, media nostalgia."],
  [11, 23, "National Espresso Day", "food", "Espresso shot pulling with crema, portafilter, cafe."],
  [11, 26, "Thanksgiving (US)", "cultural", "Roast turkey dinner table, grateful family, autumn decor."],
  [11, 27, "Black Friday", "business", "Shopping bags rush, sale tags, dark dramatic retail."],
  // ─── December ───
  [12, 1, "World AIDS Day", "health", "Red ribbon on lapel, candlelight vigil, solemn care."],
  [12, 3, "International Day of Persons with Disabilities", "international", "Wheelchair user in inclusive workplace, accessibility ramp."],
  [12, 4, "International Day of Banks", "business", "Modern bank building glass, financial district skyline."],
  [12, 5, "International Volunteer Day", "awareness", "Volunteers in matching t-shirts cleaning beach, teamwork."],
  [12, 9, "International Anti-Corruption Day", "awareness", "Handcuffs on documents, justice scale, transparent ledger."],
  [12, 10, "Human Rights Day", "international", "Paper chain people holding hands, equality, neutral tones."],
  [12, 11, "International Mountain Day", "international", "Majestic snow peaks at sunrise, alpine valley, hiker."],
  [12, 18, "Arabic Language Day", "cultural", "Arabic calligraphy brush strokes, elegant gold ink."],
  [12, 18, "International Migrants Day", "international", "Silhouettes walking with luggage, journey horizon."],
  [12, 20, "International Human Solidarity Day", "international", "Crowd forming heart shape from above, unity drone shot."],
  [12, 25, "Christmas Day", "religious", "Decorated christmas tree with gifts, fireplace, cozy red."],
  [12, 27, "International Day of Epidemic Preparedness", "health", "Medical research lab with vaccine vials, scientists."],
  [12, 31, "New Year's Eve", "fun", "Champagne glasses clinking, midnight fireworks, glitter gold."],
];

export const CALENDAR_EVENTS: CalendarEvent[] = EVENTS_2026.map(
  ([month, day, title, category, stockIdea]) => ({
    id: `${month}-${day}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    month,
    day,
    title,
    category,
    stockIdea,
    date: `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
  }),
).sort((a, b) => a.date.localeCompare(b.date));

export const EVENT_CATEGORIES: EventCategory[] = [
  "international",
  "national",
  "religious",
  "cultural",
  "fun",
  "food",
  "health",
  "business",
  "awareness",
  "family",
  "technology",
];

/** Ready-to-paste AI image prompt for an event — English on purpose (it is
 * content for the stock platforms, not UI). */
export function buildEventPrompt(event: CalendarEvent): string {
  return `Professional stock photo of ${event.stockIdea} Theme: ${event.title}. High quality, natural light, copy space for text, commercially usable, no text or logos in image.`;
}
