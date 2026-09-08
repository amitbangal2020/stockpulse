/**
 * User Preference Learning System
 * Stores user preferences locally for personalized metadata generation
 */

export interface UserPreferences {
  // Title preferences
  preferredTitleStyle: 'descriptive' | 'keyword-heavy' | 'concise' | 'balanced';
  preferredTitleLength: 'short' | 'medium' | 'long';
  
  // Keyword preferences
  preferredKeywordCount: number;
  preferredKeywordStyle: 'broad' | 'specific' | 'mixed';
  
  // Style preferences
  preferredTone: 'professional' | 'creative' | 'technical';
  preferredPromptStyle: string;
  
  // Platform preferences
  preferredPlatform: string;
  
  // Learning data
  pastSelections: {
    title: string;
    selected: boolean;
    timestamp: number;
  }[];
  totalGenerated: number;
  averageQualityScore: number;
}

const STORAGE_KEY = 'stockpulse_user_preferences';

export function getUserPreferences(): UserPreferences {
  if (typeof window === 'undefined') {
    return getDefaultPreferences();
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    // Fallback to defaults
  }
  
  return getDefaultPreferences();
}

export function saveUserPreferences(prefs: UserPreferences): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (e) {
    // Silent fail
  }
}

export function updateUserPreferences(
  prefs: UserPreferences,
  update: Partial<UserPreferences>,
): UserPreferences {
  const updated = { ...prefs, ...update };
  saveUserPreferences(updated);
  return updated;
}

export function recordTitleSelection(
  prefs: UserPreferences,
  title: string,
  selected: boolean,
): UserPreferences {
  const newSelection = {
    title,
    selected,
    timestamp: Date.now(),
  };
  
  // Keep last 100 selections
  const pastSelections = [...prefs.pastSelections, newSelection].slice(-100);
  
  const updated = {
    ...prefs,
    pastSelections,
    totalGenerated: prefs.totalGenerated + 1,
  };
  
  saveUserPreferences(updated);
  return updated;
}

export function getRecommendedSettings(prefs: UserPreferences): {
  titleStyle: string;
  keywordStyle: string;
  tone: string;
} {
  // Analyze past selections to determine preferences
  const selectedTitles = prefs.pastSelections.filter(s => s.selected);
  
  if (selectedTitles.length < 3) {
    return {
      titleStyle: 'balanced',
      keywordStyle: 'mixed',
      tone: prefs.preferredTone,
    };
  }
  
  // Analyze title lengths
  const avgLength = selectedTitles.reduce((sum, s) => sum + s.title.length, 0) / selectedTitles.length;
  
  let titleStyle = 'balanced';
  if (avgLength < 60) titleStyle = 'concise';
  else if (avgLength > 100) titleStyle = 'descriptive';
  
  return {
    titleStyle,
    keywordStyle: prefs.preferredKeywordStyle,
    tone: prefs.preferredTone,
  };
}

function getDefaultPreferences(): UserPreferences {
  return {
    preferredTitleStyle: 'balanced',
    preferredTitleLength: 'medium',
    preferredKeywordCount: 40,
    preferredKeywordStyle: 'mixed',
    preferredTone: 'professional',
    preferredPromptStyle: 'highly-optimized',
    preferredPlatform: 'adobestock',
    pastSelections: [],
    totalGenerated: 0,
    averageQualityScore: 0,
  };
}
