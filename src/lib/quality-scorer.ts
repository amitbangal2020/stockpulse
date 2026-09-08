/**
 * Quality Scoring System for Metadata
 */

const FILLER_WORDS = [
  'beautiful', 'amazing', 'stunning', 'gorgeous', 'wonderful', 'lovely', 'magnificent',
  '4k', '8k', 'hd', 'uhd', 'high quality', 'high resolution', 'best quality',
  'trending', 'viral', 'popular', 'famous', 'iconic',
];

export interface QualityScore {
  titleScore: number;
  keywordScore: number;
  overallScore: number;
  titleIssues: string[];
  keywordIssues: string[];
  rating: 'excellent' | 'good' | 'average' | 'poor';
}

export function calculateQualityScore(
  title: string,
  keywords: string[],
  description: string,
  platform: string = 'adobestock',
): QualityScore {
  const titleIssues: string[] = [];
  const keywordIssues: string[] = [];
  let titleScore = 0;
  let keywordScore = 0;

  // Title scoring (0-100)
  if (title.length > 0) titleScore += 10;
  if (title.length >= 30 && title.length <= 150) titleScore += 15;
  if (title.endsWith('.')) titleScore += 10;
  if (title.charAt(0) === title.charAt(0).toUpperCase()) titleScore += 5;
  if (!title.match(/\d{4,}/)) { titleScore += 10; } else { titleIssues.push('Contains long numbers'); }
  if (!FILLER_WORDS.some(f => title.toLowerCase().includes(f))) { titleScore += 15; } else { titleIssues.push('Contains filler words'); }
  if (title.split(' ').length >= 5) titleScore += 10;
  if (title.split(' ').length <= 20) titleScore += 10;
  if (title.split(' ').length >= 3) titleScore += 15;
  else titleIssues.push('Too few words');

  // Keyword scoring (0-100)
  if (keywords.length >= 10) keywordScore += 15;
  if (keywords.length >= 20) keywordScore += 10;
  if (keywords.length >= 30) keywordScore += 10;
  if (keywords.every(kw => kw === kw.toLowerCase())) keywordScore += 10;
  const duplicates = keywords.filter((kw, i) => keywords.indexOf(kw) !== i);
  if (duplicates.length === 0) keywordScore += 10; else keywordIssues.push(`${duplicates.length} duplicate keywords`);
  if (keywords.filter(kw => kw.length >= 3).length >= keywords.length * 0.8) keywordScore += 10;
  else keywordIssues.push('Too many short keywords');
  if (keywords.length >= 15) keywordScore += 10;
  if (keywords.every(kw => !FILLER_WORDS.some(f => kw.includes(f)))) { keywordScore += 10; } else { keywordIssues.push('Contains filler keywords'); }
  if (keywords.length >= 25) keywordScore += 10;

  const overallScore = Math.min(100, Math.round((titleScore + keywordScore) / 2));
  let rating: QualityScore['rating'] = 'poor';
  if (overallScore >= 80) rating = 'excellent';
  else if (overallScore >= 60) rating = 'good';
  else if (overallScore >= 40) rating = 'average';

  return {
    titleScore: Math.min(100, titleScore),
    keywordScore: Math.min(100, keywordScore),
    overallScore,
    titleIssues,
    keywordIssues,
    rating,
  };
}
