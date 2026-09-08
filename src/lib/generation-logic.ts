/**
 * Enhanced Metadata Generation System
 * - Platform-specific prompts
 * - Title formula system
 * - Smart keyword tiers
 * - Quality scoring
 * - Multi-pass support
 */

// ─── Ensure Complete Sentences ───
const INCOMPLETE_SUFFIXES = [
  'to', 'from', 'with', 'and', 'or', 'for', 'of', 'at', 'by', 'on', 'in', 'the', 'a', 'an',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'transitioning', 'transition', 'as', 'about', 'modern', 'dynamic', 'vibrant', 'colorful',
  'abstract', 'seamless', 'creative', 'stylish', 'beautiful', 'minimalist', 'artistic', 'professional',
  'isolated', 'digital', 'graphic', 'clean',
];

const FILLER_WORDS = [
  'beautiful', 'amazing', 'stunning', 'gorgeous', 'wonderful', 'lovely', 'magnificent',
  '4k', '8k', 'hd', 'uhd', 'high quality', 'high resolution', 'best quality',
  'trending', 'viral', 'popular', 'famous', 'iconic',
];

function stripTrailingIncompleteWords(str: string): string {
  const endsWithPeriod = str.endsWith('.');
  const clean = endsWithPeriod ? str.slice(0, -1).trim() : str.trim();
  const words = clean.split(/\s+/);
  while (words.length > 0) {
    const lastWord = words[words.length - 1].toLowerCase().replace(/[^a-z]/g, '');
    if (INCOMPLETE_SUFFIXES.includes(lastWord)) {
      words.pop();
    } else {
      break;
    }
  }
  return words.join(' ') + (words.length > 0 ? '.' : '');
}

export function ensureCompleteSentences(text: string, maxLength: number): string {
  if (!text) return '';
  let trimmed = text.trim();
  trimmed = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);

  if (trimmed.length <= maxLength && (trimmed.endsWith('.') || trimmed.endsWith('!') || trimmed.endsWith('?'))) {
    return stripTrailingIncompleteWords(trimmed);
  }

  let sub = trimmed.substring(0, maxLength);
  const lastIndex = Math.max(sub.lastIndexOf('.'), sub.lastIndexOf('!'), sub.lastIndexOf('?'));
  if (lastIndex > 0) {
    return stripTrailingIncompleteWords(sub.substring(0, lastIndex + 1));
  }

  const lastSpace = sub.lastIndexOf(' ');
  if (lastSpace > 0) {
    sub = sub.substring(0, lastSpace);
  }
  return stripTrailingIncompleteWords(sub + '.');
}

// ─── Clean Keywords ───
export function cleanKeywords(keywords: string[], maxCount: number): string[] {
  if (!keywords || !Array.isArray(keywords)) return [];
  const cleaned = keywords
    .map(kw => kw.toLowerCase().trim().replace(/[^a-z0-9\s\-]/g, '').replace(/\s+/g, ' '))
    .filter(kw => kw.length > 1 && kw.length < 60)
    .filter((kw, i, arr) => arr.indexOf(kw) === i);
  return cleaned.slice(0, maxCount);
}

// ─── Remove Filler Words ───
export function removeFillerWords(text: string): string {
  let result = text;
  for (const filler of FILLER_WORDS) {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    result = result.replace(regex, '').replace(/\s{2,}/g, ' ').trim();
  }
  return result;
}

// ─── Platform Configurations ───
export const PLATFORM_CONFIGS: Record<string, {
  titleLength: number;
  descLength: number;
  keywordsCount: number;
  focus: string;
  titleFormula: string;
  keywordStrategy: string;
}> = {
  adobestock: {
    titleLength: 100,
    descLength: 0, // Adobe Stock doesn't use descriptions
    keywordsCount: 49,
    focus: 'Adobe Stock buyers search with SHORT, PRECISE titles. Title-first algorithm.',
    titleFormula: '[Subject] [Style] [Color] [Background]',
    keywordStrategy: 'Visual subjects first, then technical terms, then style descriptors. No conceptual filler.',
  },
  shutterstock: {
    titleLength: 150,
    descLength: 200,
    keywordsCount: 50,
    focus: 'Shutterstock values DETAILED descriptions and LONG-TAIL keywords.',
    titleFormula: '[Adjective] [Subject] [Action/Pose] [Setting] [Style]',
    keywordStrategy: 'Mix broad + specific + niche. Include category-matching terms.',
  },
  freepik: {
    titleLength: 80,
    descLength: 100,
    keywordsCount: 30,
    focus: 'Freepik buyers want CONCISE, STYLE-focused titles.',
    titleFormula: '[Type] [Subject] [Style]',
    keywordStrategy: 'Style descriptors + vector/illustration terms + use-case.',
  },
  vecteezy: {
    titleLength: 80,
    descLength: 100,
    keywordsCount: 25,
    focus: 'Vecteezy values TRENDING styles and VISUAL accuracy.',
    titleFormula: '[Subject] [Style] [Color Scheme]',
    keywordStrategy: 'Trending + style + visual descriptors.',
  },
  istock: {
    titleLength: 120,
    descLength: 150,
    keywordsCount: 50,
    focus: 'iStock values QUALITY descriptions and PREMIUM keywords.',
    titleFormula: '[Detailed Description] [Style] [Mood]',
    keywordStrategy: 'Premium + editorial + high-quality descriptors.',
  },
  pond5: {
    titleLength: 100,
    descLength: 150,
    keywordsCount: 30,
    focus: 'Pond5 buyers focus on VIDEO-SPECIFIC terms.',
    titleFormula: '[Subject] [Action] [Setting]',
    keywordStrategy: 'Motion terms + video-specific + commercial use.',
  },
};

// ─── Title Formula System ───
function getTitleFormulas(platform: string): string[] {
  const config = PLATFORM_CONFIGS[platform] || PLATFORM_CONFIGS.adobestock;
  return [
    `Formula A (${config.titleFormula}): Focus on visual accuracy`,
    `Formula B: [Subject] [Preposition] [Setting] [Lighting] [Mood]`,
    `Formula C: [Type] [Content] [Style] [Color] [Background]`,
  ];
}

// ─── Keyword Tier System ───
const KEYWORD_TIERS = {
  tier1_generic: ['vector', 'illustration', 'design', 'pattern', 'background', 'icon', 'logo', 'texture', 'abstract', 'geometric', 'seamless', 'flat', 'minimal', 'modern', 'colorful'],
  tier2_style: ['minimalist', 'vintage', 'retro', 'corporate', 'creative', 'elegant', 'bold', 'playful', 'professional', 'artistic', 'digital', 'hand-drawn', 'watercolor', '3d', 'isometric'],
  tier3_subject: [], // AI fills based on image
  tier3_color: ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'black', 'white', 'gold', 'silver', 'teal', 'navy', 'coral', 'mint'],
  tier4_commercial: ['business', 'marketing', 'technology', 'education', 'healthcare', 'finance', 'startup', 'enterprise', 'commercial', 'editorial'],
};

// ─── Quality Scoring System ───
export interface QualityScore {
  titleScore: number;
  keywordScore: number;
  overallScore: number;
  titleIssues: string[];
  keywordIssues: string[];
}

export function calculateQualityScore(
  title: string,
  keywords: string[],
  description: string,
  platform: string,
): QualityScore {
  const titleIssues: string[] = [];
  const keywordIssues: string[] = [];
  let titleScore = 0;
  let keywordScore = 0;

  // Title scoring
  if (title.length > 0) titleScore += 10;
  if (title.length >= 30 && title.length <= 150) titleScore += 15;
  if (title.endsWith('.')) titleScore += 10;
  if (title.charAt(0) === title.charAt(0).toUpperCase()) titleScore += 5;
  if (!title.match(/\d{4,}/)) { titleScore += 10; } else { titleIssues.push('Contains long numbers'); }
  if (!FILLER_WORDS.some(f => title.toLowerCase().includes(f))) { titleScore += 15; } else { titleIssues.push('Contains filler words'); }
  if (title.split(' ').length >= 5) titleScore += 10;
  if (title.split(' ').length <= 20) titleScore += 10;
  const hasSubject = title.split(' ').length >= 3;
  if (hasSubject) titleScore += 15;
  else titleIssues.push('Too few words');

  // Keyword scoring
  if (keywords.length >= 10) keywordScore += 15;
  if (keywords.length >= 20) keywordScore += 10;
  if (keywords.length >= 30) keywordScore += 10;
  if (keywords.every(kw => kw === kw.toLowerCase())) keywordScore += 10;
  const duplicates = keywords.filter((kw, i) => keywords.indexOf(kw) !== i);
  if (duplicates.length === 0) keywordScore += 10; else keywordIssues.push(`${duplicates.length} duplicate keywords`);
  const hasGeneric = keywords.filter(kw => KEYWORD_TIERS.tier1_generic.includes(kw));
  if (hasGeneric.length >= 3) keywordScore += 10;
  else keywordIssues.push('Few generic keywords');
  const hasShort = keywords.filter(kw => kw.length < 3);
  if (hasShort.length === 0) keywordScore += 10; else keywordIssues.push('Too short keywords');
  if (keywords.length >= 15) keywordScore += 10;
  if (keywords.every(kw => !FILLER_WORDS.some(f => kw.includes(f)))) { keywordScore += 10; } else { keywordIssues.push('Contains filler keywords'); }

  const overallScore = Math.round((titleScore + keywordScore) / 2);

  return {
    titleScore: Math.min(100, titleScore),
    keywordScore: Math.min(100, keywordScore),
    overallScore: Math.min(100, overallScore),
    titleIssues,
    keywordIssues,
  };
}

// ─── Prompt Options ───
export interface PromptOptions {
  titleLength: number;
  descLength: number;
  keywordsCount: number;
  language: string;
  transparentBg: boolean;
  whiteBg: boolean;
  singleWords: boolean;
  filterIP: boolean;
  customKeywords: string;
  bannedWords: string;
  usePromptPrefix?: boolean;
  promptPrefix?: string;
  usePromptSuffix?: boolean;
  promptSuffix?: string;
  useCameraParams?: boolean;
  useNegativeTitle?: boolean;
  negativeTitle?: string;
  useNegativeKeywords?: boolean;
  negativeKeywords?: string;
  promptLength?: number;
  promptStyle?: string;
  customPromptText?: string;
  titlePrefix?: string;
  titleSuffix?: string;
  platform?: string;
  // New enhanced options
  tone?: 'professional' | 'creative' | 'technical';
  generateVersions?: boolean;
}

// ─── Main Prompt Builder ───
export function buildMetadataPrompt(
  mediaKind: 'image' | 'video',
  base64Data: string | null,
  fileName: string,
  opts: PromptOptions,
): string {
  const hasImage = !!base64Data;
  const isVideo = mediaKind === 'video';
  const platform = opts.platform || 'adobestock';
  const platformConfig = PLATFORM_CONFIGS[platform] || PLATFORM_CONFIGS.adobestock;

  // Visual intro
  const visualIntro = isVideo
    ? `The user has uploaded a video file. Representative frames taken from different points along the video timeline (beginning, middle, end) are attached.\nAnalyze ALL attached frames TOGETHER as a sequence and describe the OVERALL video — main subject, environment, actions/movement, visual style, composition, colors, concept/theme, and commercial stock relevance. Do not describe it as a single static image.\nIMPORTANT: The file name is an identifier only and contains no information about the video content. Never use the file name as evidence for what appears in the video.`
    : hasImage
      ? `Analyze ONLY the image supplied to you and describe the artwork strictly from what is visible in its pixels. The file name is an identifier only (a catalog number or file ID) and contains no information about the artwork. Never use the file name, its characters, or its numbers as evidence for what the artwork shows.`
      : `The user has uploaded a design file named "${fileName}".\nSince we could not obtain a visual preview of this file, please generate highly searchable titles, descriptions, and keywords based entirely on the clues, subjects, colors, and design themes indicated in the filename: "${fileName}".`;

  // Video rules
  const videoRules = isVideo
    ? `\nVIDEO ANALYSIS RULES:\n- The title, description and keywords must describe the video as a whole and include motion/action terms where evident (e.g. "aerial drone pan", "timelapse", "slow motion", "tracking shot").\n- The text-to-image prompt must describe a compelling static still that captures the video's look, subject, and atmosphere.`
    : '';

  // Transparency note (strong override)
  const transparencyNote = opts.transparentBg && hasImage
    ? `\nCRITICAL TRANSPARENCY OVERRIDE:\n- This image HAS a TRANSPARENT background. This is a FACT set by the user.\n- You MUST describe this image as having a TRANSPARENT background.\n- In the title and description, you MUST use phrases like: "isolated on transparent background", "transparent PNG", "no background".\n- You MUST NOT use the words "white background", "black background", "solid background", or any background color.\n- You MUST NOT describe any background color, backdrop, or environment — the background is TRANSPARENT.\n- This instruction OVERRIDES any visual analysis. Even if the preview appears white/black, the ACTUAL file is transparent.`
    : '';

  // Auto-detect transparency (always check, regardless of toggle)
  const autoDetectTransparency = hasImage && !opts.transparentBg
    ? `\nCRITICAL TRANSPARENCY RULES — YOU MUST FOLLOW THESE:\n\nFILE FORMAT RULES:\n- EPS files: EPS is a VECTOR format. EPS files almost ALWAYS have transparent backgrounds. You MUST describe EPS content as "isolated on transparent background" or "vector illustration with transparent background". NEVER say "white background" for EPS files.\n- PNG files: PNG supports transparency. If the PNG shows a single icon/subject with no background scene → it is transparent. Describe as "isolated on transparent background".\n- JPG/JPEG files: JPG does NOT support transparency. If JPG has a plain background, describe the actual background color.\n\nVISUAL RULES:\n- When an image is sent via API, transparent areas APPEAR white to you. This is a rendering artifact — the actual file IS transparent.\n- A single subject with no background scene (no sky, no floor, no wall, no gradient, no texture) = TRANSPARENT background.\n- NEVER guess "white background" unless you clearly see a solid white background element (not just white space around the subject).\n\nYOU MUST USE these phrases for transparent content:\n- Title: end with "isolated on transparent background" or "transparent PNG" or "vector with transparent background"\n- Description: "isolated on transparent background"\n- Keywords: include "transparent background"\n\nWRONG: "security camera icon isolated on white background"\nCORRECT: "security camera icon isolated on transparent background"\nWRONG: "map icon on white background"\nCORRECT: "map icon isolated on transparent background"`
    : '';

  // Grounding rules
  const groundingRules = hasImage ? `\nSTRICT VISUAL-GROUNDING RULES:\n1. FILENAME IS NOT VISUAL INFORMATION: The file name (e.g. "${fileName}") is an identifier only (catalog number, stock ID, or naming convention). Numbers, letters, or words in the file name are NOT part of the artwork. NEVER use the file name as evidence for the artwork's subject, meaning, number, shape, concept, or visual content.\n2. VISUAL EVIDENCE ONLY: Analyze ONLY the supplied image's pixels. Every object, shape, icon, color, layout element, visible text, and subject named in the title, description, or keywords must be directly visible in the artwork.\n3. NO SEMANTIC STORYTELLING: Do not invent meanings, moods, or concepts that are not visibly present. Do not attach inferred business/life concepts unless the artwork visibly represents that concept.\n4. DESCRIBE WHAT IS ACTUALLY VISIBLE: For clearly identifiable elements, name them precisely. For ambiguous abstract shapes, describe their visible geometric/physical form.\n5. COLOR GROUNDING: Only mention a color that is actually present in the MAIN ARTWORK.\n6. GROUNDED KEYWORDS: Every keyword must pass this test — "Can I point to something in the actual artwork that visually supports this keyword?" If NO, remove it.` : '';

  // Self-check
  const selfCheck = hasImage ? `\nFINAL SELF-CHECK BEFORE RESPONDING — verify ALL fields:\n- TITLE: no filename-derived information, no unsupported semantic interpretation, no filler words\n- DESCRIPTION: only visually supported information; no imagined use case\n- KEYWORDS: every keyword visually supported; remove speculative terms\nIf any check fails, correct the metadata before responding.` : '';

  // Camera parameters
  const cameraInstruction = opts.useCameraParams
    ? `Include realistic camera parameters such as camera model, focal lens parameters (e.g. 50mm, 85mm), aperture values (e.g. f/1.8, f/2.8), ISO, lighting details, and shot angles.`
    : `Describe only the visual layout, subjects, color details, style, and composition.`;

  // White background
  const bgInstruction = opts.whiteBg
    ? `Isolate the subject on a pure clean white background.`
    : `Incorporate the visual background elements present in the image.`;

  // Negative keywords
  const negKeywordsList = opts.useNegativeKeywords && opts.negativeKeywords
    ? `Do not use these words in keywords: ${opts.negativeKeywords}`
    : '';

  // Negative title words
  const negTitleList = opts.useNegativeTitle && opts.negativeTitle
    ? `Do not use these words in the title: ${opts.negativeTitle}`
    : '';

  // Custom keywords
  const customKwInstruction = opts.customKeywords
    ? `Include these specific keywords in the keyword list: ${opts.customKeywords}`
    : '';

  // Banned words
  const bannedWordsInstruction = opts.bannedWords
    ? `Do not use these words anywhere: ${opts.bannedWords}`
    : '';

  // Single word keywords
  const singleWordInstruction = opts.singleWords
    ? `Each keyword must be a single word (no multi-word phrases).`
    : '';

  const promptLength = opts.promptLength || 427;

  // Prompt style instructions
  let promptStyleInstruction = '';
  const ps = opts.promptStyle || 'highly-optimized';
  if (ps === 'keyword-priority') {
    promptStyleInstruction = `KEYWORD PRIORITY MODE: Focus on generating the most search-volume keywords possible. Title should contain the highest-traffic keywords. Keywords list should be ordered strictly by search volume (highest first).`;
  } else if (ps === 'seo-focus') {
    promptStyleInstruction = `SEO FOCUS MODE: Optimize every field for search engine discoverability. Use long-tail keywords, natural language queries, and trending search phrases.`;
  } else if (ps === 'adobe-stock-special') {
    promptStyleInstruction = `ADOBE STOCK SPECIAL MODE: Adobe Stock buyers search with short, precise titles. Generate concise, specific titles (max 70-100 chars). Focus on visual description over conceptual interpretation.`;
  } else if (ps === 'shutterstock-special') {
    promptStyleInstruction = `SHUTTERSTOCK SPECIAL MODE: Shutterstock buyers search with detailed descriptions. Generate rich, descriptive titles that include style, subject, and composition details.`;
  } else if (ps === 'human-search-psychology') {
    promptStyleInstruction = `HUMAN SEARCH PSYCHOLOGY MODE: Think like a real buyer searching for stock content. What exact words would a designer type in the search bar? Generate titles and keywords using everyday buyer language.`;
  } else if (ps === 'custom-prompt' && opts.customPromptText) {
    promptStyleInstruction = `CUSTOM INSTRUCTIONS: ${opts.customPromptText}`;
  } else {
    promptStyleInstruction = `HIGHLY OPTIMIZED MODE: Generate the highest-quality metadata combining SEO keywords, visual accuracy, and commercial appeal. Balance search volume with description accuracy.`;
  }

  // Tone instruction
  let toneInstruction = '';
  if (opts.tone === 'professional') {
    toneInstruction = 'Use professional, business-appropriate language. Avoid casual or trendy terms.';
  } else if (opts.tone === 'creative') {
    toneInstruction = 'Use creative, evocative language. Paint a vivid picture with words.';
  } else if (opts.tone === 'technical') {
    toneInstruction = 'Use technical, precise terminology. Focus on specifications and technical details.';
  }

  // Platform-specific instructions
  const platformInstruction = `\nPLATFORM: ${platform.toUpperCase()}\n${platformConfig.focus}\nTitle formula: ${platformConfig.titleFormula}\nKeyword strategy: ${platformConfig.keywordStrategy}`;

  // Icon set instruction
  const iconSetInstruction = `\nICON SET TITLE RULES (if the image contains multiple icons, symbols, or an icon set):\n- The title MUST include 6-8 specific icon/sub-topic names visible in the artwork.\n- Pattern: "[Subject] icon set featuring [icon1], [icon2], [icon3], [icon4], [icon5], and [icon6] in [style] [color] design."\n- Example: "Review icon set featuring rating, customer feedback, star ratings, user testimonials, and business evaluation symbols in a modern blue flat design."\n- List actual visible icons/symbols from the image, not generic categories.\n- Use natural commas and "and" before the last item.`;

  // Build the prompt
  const promptText = `
You are an expert SEO metadata developer and microstock optimization specialist.

${platformInstruction}

${promptStyleInstruction}

${toneInstruction}

${visualIntro}
${videoRules}
${transparencyNote}
${autoDetectTransparency}
${groundingRules}
${iconSetInstruction}

Generate:
1. A highly searchable, SEO-optimized title (maximum of ${opts.titleLength} characters). Focus on high-volume commercial search terms, placing the main subject and key action at the beginning. Do NOT use generic terms or filler words (beautiful, amazing, stunning, 4k, hd, high quality). Keep it highly descriptive, natural, and clickable.
2. A detailed, search-friendly description (maximum of ${opts.descLength} characters). Incorporate relevant context, mood, style, color schemes, and key elements that buyers search for.
3. A list of exactly ${opts.keywordsCount} keywords. Keywords must be highly searchable microstock tags, sorted by relevance from highest search volume to lowest. Include visually grounded synonyms, textures, settings, colors, and specific object names — never conceptual filler or speculative use-case terms. All tags must be lowercase, free of special characters. Mix broad terms (e.g. "vector", "illustration") with specific terms (e.g. "teal geometric pattern") and niche terms (e.g. "corporate hierarchy chart").
4. An extremely detailed, descriptive, and rich text-to-image prompt (maximum of ${promptLength} characters) describing the scene, subjects, composition, atmospheric effects, colors, textures, lighting, and artistic style so it can be recreated beautifully in Midjourney/Stable Diffusion.
   - Style instruction: Describe the art/photography style observed or implied in rich detail.
   - Background instruction: ${bgInstruction}
   - Camera parameters constraint: ${cameraInstruction}
   ${opts.usePromptPrefix && opts.promptPrefix ? `- Prompt prefix: Prepend the exact text "${opts.promptPrefix}" to the prompt.` : ''}
   ${opts.usePromptSuffix && opts.promptSuffix ? `- Prompt suffix: Append the exact text "${opts.promptSuffix}" to the prompt.` : ''}
5. A category name for Shutterstock. Select exactly one category from: 'Animals/Wildlife', 'Art', 'Backgrounds/Textures', 'Beauty/Fashion', 'Buildings/Landmarks', 'Business/Finance', 'Celebrities', 'Education', 'Food and Drink', 'Healthcare/Medical', 'Holidays', 'Industrial', 'Interiors', 'Miscellaneous', 'Nature', 'Parks/Outdoor', 'People', 'Religion', 'Science', 'Signs/Symbols', 'Sports/Recreation', 'Technology', 'Transportation', 'Vectors', 'Vintage'.

CRITICAL INSTRUCTIONS:
- The generated Title and Description MUST ALWAYS be complete, grammatically correct sentences ending with a period.
- Never use filler words: beautiful, amazing, stunning, gorgeous, 4k, 8k, hd, high quality, trending, viral, popular
- If the content would exceed the character limit, shorten the sentence earlier to ensure it ends cleanly before the limit.
- Keywords must be in ${opts.language}.
${negKeywordsList}
${negTitleList}
${customKwInstruction}
${bannedWordsInstruction}
${singleWordInstruction}
${selfCheck}

You must respond ONLY with a clean JSON object matching the following structure (no markdown formatting, no code block backticks):
{
  "title": "Generated Title.",
  "description": "Generated Description.",
  "keywords": ["tag1", "tag2", "tag3"],
  "prompt": "Detailed AI image generation prompt.",
  "category": "Selected Category"
}`;

  return promptText;
}

// ─── Multi-Pass Prompt ───
export function buildEvaluationPrompt(
  title: string,
  description: string,
  keywords: string[],
  platform: string,
): string {
  const platformConfig = PLATFORM_CONFIGS[platform] || PLATFORM_CONFIGS.adobestock;

  return `You are a microstock metadata quality reviewer. Evaluate the following metadata and suggest improvements.

PLATFORM: ${platform.toUpperCase()}
${platformConfig.focus}

METADATA TO EVALUATE:
Title: ${title}
Description: ${description}
Keywords: ${keywords.join(', ')}

CHECK FOR:
1. Title quality:
   - Is it descriptive and specific? (not generic)
   - Does it contain filler words? (beautiful, amazing, stunning, 4k, hd, high quality)
   - Is it within ${platformConfig.titleLength} characters?
   - Does it start with the main subject?
   - Is it a complete sentence?

2. Keyword quality:
   - Are there at least 20 keywords?
   - Are they all lowercase?
   - Are there duplicates?
   - Are there generic/filler keywords?
   - Do they mix broad + specific + niche terms?

3. Overall quality:
   - Is the metadata searchable?
   - Would a buyer find this asset using these terms?
   - Is it platform-optimized?

RESPOND WITH:
{
  "titleScore": 0-100,
  "keywordScore": 0-100,
  "overallScore": 0-100,
  "titleSuggestions": ["suggestion1", "suggestion2"],
  "keywordSuggestions": ["suggestion1", "suggestion2"],
  "improvedTitle": "Better title if current is poor",
  "improvedKeywords": ["better", "keywords", "if", "current", "are", "poor"]
}`;
}

// ─── Parse Metadata Response ───
export function parseMetadataResponse(response: string, fileName: string): {
  title: string;
  description: string;
  keywords: string[];
  prompt: string;
  category: string;
} {
  try {
    // Try to parse as JSON
    let cleaned = response.trim();
    // Remove markdown code blocks if present
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    // Try to find JSON object
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        title: parsed.title || '',
        description: parsed.description || '',
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
        prompt: parsed.prompt || '',
        category: parsed.category || '',
      };
    }
  } catch (e) {
    // Fallback: try to extract fields manually
  }

  // Fallback parsing
  const titleMatch = response.match(/"title"\s*:\s*"([^"]+)"/i);
  const descMatch = response.match(/"description"\s*:\s*"([^"]+)"/i);
  const kwMatch = response.match(/"keywords"\s*:\s*\[([^\]]+)\]/i);
  const promptMatch = response.match(/"prompt"\s*:\s*"([^"]+)"/i);
  const catMatch = response.match(/"category"\s*:\s*"([^"]+)"/i);

  let keywords: string[] = [];
  if (kwMatch) {
    keywords = kwMatch[1].split(',').map(k => k.trim().replace(/"/g, ''));
  }

  return {
    title: titleMatch ? titleMatch[1] : '',
    description: descMatch ? descMatch[1] : '',
    keywords,
    prompt: promptMatch ? promptMatch[1] : '',
    category: catMatch ? catMatch[1] : '',
  };
}

// ─── Export Helpers ───
export { KEYWORD_TIERS, getTitleFormulas };
