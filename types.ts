
export type ViewState = 'translate' | 'learn' | 'tutor' | 'tourist' | 'community';

export interface Language {
  code: string;
  name: string;
  flag?: string; // Emoji
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  xp: number;
  completed: boolean;
}

export interface TouristPhrase {
  category: string;
  phrases: {
    original: string;
    translation?: string; // Populated by AI
  }[];
}

export interface TranslationResult {
  original: string;
  translated: string;
  pronunciation?: string;
  detectedSource?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  avatar: string; // Emoji
}
