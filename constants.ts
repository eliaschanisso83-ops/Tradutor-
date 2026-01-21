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

export const MOCK_LESSONS_DATA: Record<string, Lesson[]> = {
  en: [
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
  ],
  pt: [
    {
      id: '1',
      title: 'Saudações e Apresentações',
      description: 'Aprenda a dizer olá e se apresentar em Changana.',
      level: 'Beginner',
      xp: 50,
      completed: false,
    },
    {
      id: '2',
      title: 'Essenciais do Mercado',
      description: 'Negociar e comprar comida em Swahili.',
      level: 'Beginner',
      xp: 75,
      completed: false,
    },
    {
      id: '3',
      title: 'Estrutura Familiar',
      description: 'Entendendo termos de parentesco em Shona.',
      level: 'Intermediate',
      xp: 100,
      completed: false,
    },
  ]
};

export const TOURIST_PHRASES_DATA: Record<string, TouristPhrase[]> = {
  en: [
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
  ],
  pt: [
    {
      category: '👋 Saudações e Básico',
      phrases: [
        { original: 'Olá, como você está?' },
        { original: 'Estou bem, obrigado.' },
        { original: 'Qual é o seu nome?' },
        { original: 'Meu nome é...' },
        { original: 'Prazer em te conhecer.' },
        { original: 'Muito obrigado.' },
        { original: 'Eu não entendo.' },
      ]
    },
    {
      category: '🛒 Mercado e Negociação',
      phrases: [
        { original: 'Quanto custa isso?' },
        { original: 'Está muito caro.' },
        { original: 'Pode baixar o preço?' },
        { original: 'Vou levar dois destes.' },
        { original: 'Você tem troco?' },
        { original: 'Isso está fresco?' },
        { original: 'Só estou olhando, obrigado.' },
      ]
    },
    {
      category: '🚙 Transporte (Chapa)',
      phrases: [
        { original: 'Onde é a parada de ônibus?' },
        { original: 'Quero ir para o centro.' },
        { original: 'Pare aqui, por favor.' },
        { original: 'Quanto é a passagem?' },
        { original: 'É longe daqui?' },
        { original: 'Vá em frente, depois vire à esquerda.' },
      ]
    },
    {
      category: '🍽️ Comida e Restaurante',
      phrases: [
        { original: 'Estou com fome.' },
        { original: 'Posso ver o menu?' },
        { original: 'Gostaria de água, por favor.' },
        { original: 'Frango com arroz.' },
        { original: 'É picante?' },
        { original: 'A conta, por favor.' },
        { original: 'A comida estava deliciosa.' },
      ]
    },
    {
      category: '🚑 Ajuda e Emergência',
      phrases: [
        { original: 'Ajude-me, por favor.' },
        { original: 'Estou perdido.' },
        { original: 'Onde fica o banheiro?' },
        { original: 'Preciso de um médico.' },
        { original: 'Onde é a delegacia de polícia?' },
        { original: 'Perdi meu telefone.' },
      ]
    },
    {
      category: '❤️ Social e Diversão',
      phrases: [
        { original: 'Você é muito bonito(a).' },
        { original: 'Quer dançar?' },
        { original: 'Até amanhã.' },
        { original: 'Pode me dar seu número?' },
        { original: 'Vamos celebrar.' },
        { original: 'Sem problemas (Hakuna Matata).' },
      ]
    }
  ]
};