import { Language, Lesson, TouristPhrase } from './types';

export const AD_CONFIG = {
  // Master switch for ads. Set to false to hide all ads during development.
  ENABLED: true, 
  PUBLISHER_ID: 'ca-pub-5925121782414544',
  SLOTS: {
    HOME_BANNER: '89324792',      // Replace with real AdSense Slot ID
    LEARN_FEED: '777666555',      // Replace with real AdSense Slot ID
    LESSON_MODAL: '444333222',    // Replace with real AdSense Slot ID
    COMMUNITY_FEED_1: '111222333',// Replace with real AdSense Slot ID
    COMMUNITY_FEED_2: '555666777',// Replace with real AdSense Slot ID
    COMMUNITY_VERIFY: '999888777' // Replace with real AdSense Slot ID
  }
};

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
    category: '👋 Greetings & Basics',
    phrases: [
      { original: 'Hello, how are you?' },
      { original: 'I am fine, thank you.' },
      { original: 'What is your name?' },
      { original: 'My name is...' },
      { original: 'Nice to meet you.' },
      { original: 'Thank you very much.' },
      { original: 'I do not understand.' },
    ]
  },
  {
    category: '🛒 Market & Bargaining',
    phrases: [
      { original: 'How much does this cost?' },
      { original: 'That is too expensive.' },
      { original: 'Can you lower the price?' },
      { original: 'I will take two of these.' },
      { original: 'Do you have change?' },
      { original: 'Is this fresh?' },
      { original: 'I am just looking, thanks.' },
    ]
  },
  {
    category: '🚙 Transport (Chapa)',
    phrases: [
      { original: 'Where is the bus stop?' },
      { original: 'I want to go to the city center.' },
      { original: 'Stop here, please.' },
      { original: 'How much is the fare?' },
      { original: 'Is it far from here?' },
      { original: 'Go straight, then turn left.' },
    ]
  },
  {
    category: '🍽️ Food & Dining',
    phrases: [
      { original: 'I am hungry.' },
      { original: 'Can I see the menu?' },
      { original: 'I would like water, please.' },
      { original: 'Chicken with rice.' },
      { original: 'Is it spicy?' },
      { original: 'The bill, please.' },
      { original: 'The food was delicious.' },
    ]
  },
  {
    category: '🚑 Help & Emergency',
    phrases: [
      { original: 'Help me, please.' },
      { original: 'I am lost.' },
      { original: 'Where is the bathroom?' },
      { original: 'I need a doctor.' },
      { original: 'Where is the police station?' },
      { original: 'I lost my phone.' },
    ]
  },
  {
    category: '❤️ Social & Fun',
    phrases: [
      { original: 'You look beautiful.' },
      { original: 'Do you want to dance?' },
      { original: 'See you tomorrow.' },
      { original: 'Can I have your number?' },
      { original: 'Let us celebrate.' },
      { original: 'No problem (Hakuna Matata).' },
    ]
  }
];