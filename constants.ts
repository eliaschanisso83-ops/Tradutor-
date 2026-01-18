import { Language, Lesson, TouristPhrase } from './types';

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ndau', name: 'Ndau', flag: '🇿🇼' },
  { code: 'sena', name: 'Sena', flag: '🇲🇿' },
  { code: 'changana', name: 'Changana', flag: '🇲🇿' },
  { code: 'swahili', name: 'Swahili', flag: '🇹🇿' },
  { code: 'shona', name: 'Shona', flag: '🇿🇼' },
  { code: 'makhuwa', name: 'Makhuwa', flag: '🇲🇿' },
  { code: 'xichope', name: 'Xichope', flag: '🇲🇿' },
  { code: 'lomwe', name: 'Lomwe', flag: '🇲🇼' },
  { code: 'zulu', name: 'Zulu', flag: '🇿🇦' },
];

export const MOCK_LESSONS: Lesson[] = [
  {
    id: '1',
    title: 'Greetings & Introductions',
    description: 'Learn how to say hello and introduce yourself in Changana.',
    level: 'Beginner',
    xp: 50,
    completed: false,
  },
  {
    id: '2',
    title: 'Market Day Essentials',
    description: 'Bargaining and buying food in Swahili.',
    level: 'Beginner',
    xp: 75,
    completed: false,
  },
  {
    id: '3',
    title: 'Family Structure',
    description: 'Understanding kinship terms in Shona.',
    level: 'Intermediate',
    xp: 100,
    completed: false,
  },
];

export const TOURIST_PHRASES: TouristPhrase[] = [
  {
    category: 'Essentials',
    phrases: [
      { original: 'Hello, how are you?' },
      { original: 'Thank you very much.' },
      { original: 'Where is the bathroom?' },
      { original: 'How much does this cost?' },
    ]
  },
  {
    category: 'Transport',
    phrases: [
      { original: 'Take me to this address.' },
      { original: 'Stop here, please.' },
      { original: 'Is it far?' },
    ]
  },
  {
    category: 'Dining',
    phrases: [
      { original: 'I would like water.' },
      { original: 'The bill, please.' },
      { original: 'Is this spicy?' },
    ]
  }
];