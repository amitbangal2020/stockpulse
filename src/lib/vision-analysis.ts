/**
 * Vision Analysis Module
 * Pre-analyzes images for detailed breakdown before metadata generation
 */

export interface VisionAnalysis {
  subjects: string[];
  colors: string[];
  style: string;
  composition: string;
  mood: string;
  background: string;
  hasText: boolean;
  hasTransparency: boolean;
  isPhoto: boolean;
  isIllustration: boolean;
  is3D: boolean;
  isVector: boolean;
  commercialPotential: string[];
}

export function buildVisionAnalysisPrompt(mediaKind: 'image' | 'video'): string {
  if (mediaKind === 'video') {
    return `Analyze this video and provide a detailed breakdown. Respond with a JSON object containing:
{
  "subjects": ["main subjects visible in the video"],
  "colors": ["dominant colors"],
  "style": "video style (e.g., cinematic, documentary, animation)",
  "composition": "video composition description",
  "mood": "overall mood/atmosphere",
  "background": "background description",
  "hasText": false,
  "hasTransparency": false,
  "isPhoto": true/false,
  "isIllustration": false,
  "is3D": false,
  "isVector": false,
  "commercialPotential": ["potential commercial uses"]
}`;
  }

  return `Analyze this image in detail and provide a comprehensive breakdown. Respond with a JSON object containing:
{
  "subjects": ["list all visible subjects, objects, elements"],
  "colors": ["list all dominant and accent colors"],
  "style": "artistic style (e.g., flat design, photorealistic, watercolor, 3D render, hand-drawn)",
  "composition": "describe the layout and composition",
  "mood": "overall mood and atmosphere",
  "background": "background description (white, transparent, gradient, scene, etc.)",
  "hasText": true/false,
  "hasTransparency": true/false,
  "isPhoto": true/false,
  "isIllustration": true/false,
  "is3D": true/false,
  "isVector": true/false,
  "commercialPotential": ["list 3-5 potential commercial uses for this image"]
}`;
}

export function parseVisionAnalysis(response: string): VisionAnalysis | null {
  try {
    let cleaned = response.trim();
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    // Fallback
  }
  return null;
}

export function buildEnhancedPromptWithVision(
  basePrompt: string,
  vision: VisionAnalysis,
): string {
  if (!vision) return basePrompt;

  const visionContext = `
DETAILED VISUAL ANALYSIS:
- Subjects identified: ${vision.subjects.join(', ')}
- Colors detected: ${vision.colors.join(', ')}
- Art style: ${vision.style}
- Composition: ${vision.composition}
- Mood: ${vision.mood}
- Background: ${vision.background}
- Contains text: ${vision.hasText ? 'Yes' : 'No'}
- Image type: ${vision.isPhoto ? 'Photo' : vision.is3D ? '3D Render' : vision.isVector ? 'Vector' : vision.isIllustration ? 'Illustration' : 'Unknown'}
- Commercial uses: ${vision.commercialPotential.join(', ')}

Use this visual analysis to generate more accurate and specific metadata.`;

  return basePrompt.replace(
    'You are an expert SEO metadata developer',
    `You are an expert SEO metadata developer with detailed visual analysis of the image\n${visionContext}\n\nYou are an expert SEO metadata developer`
  );
}
