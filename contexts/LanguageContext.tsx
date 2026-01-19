import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'pt';

const translations = {
  en: {
    nav: {
      translate: 'Translate',
      learn: 'Learn',
      tutor: 'Tutor',
      tourist: 'Tourist',
      community: 'Club',
      weekly_goal: 'Weekly Goal',
      days: 'days'
    },
    translate: {
      placeholder: 'Enter text here...',
      scan: 'Scan Text',
      record: 'Tap to Record',
      listening: 'Listening...',
      translate_btn: 'Translate',
      thinking: 'Thinking...',
      pronunciation: 'Pronunciation'
    },
    tutor: {
      title: 'AfriLingo Tutor',
      subtitle: 'Always here to help you learn.',
      intro: 'Mwauka bwanji! (Good morning!) I am your AfriLingo tutor. Which language would you like to practice today?',
      type_placeholder: 'Type a message...',
      suggested: ['👋 Greetings', '🍎 Market', '🚌 Travel', '👪 Family', '😂 Slang']
    },
    learn: {
      streak: 'Daily Streak',
      fire: "You're on fire!",
      current_path: 'Current Path',
      challenge_title: 'Weekly Challenge',
      challenge_desc: 'Complete 3 conversation modules to unlock the "Polyglot" badge.',
      view_details: 'View Details',
      start_lesson: 'Start Lesson',
      view_phrases: 'View Key Phrases'
    },
    tourist: {
      title: 'Tourist Mode',
      subtitle: 'Survival phrases for your trip.',
      translating_to: 'Translating to:',
      tap_translate: 'Tap to translate'
    },
    community: {
      title: 'Community Club',
      desc: 'Help preserve African languages! Contribute translations, verify phrases, or record pronunciations.',
      tabs: {
        feed: 'Feed',
        verify: 'Verify',
        contribute: 'Add New'
      },
      feed: {
        empty: 'No recent activity.',
        verified: 'verified a translation',
        added: 'added a new phrase'
      },
      verify: {
        title: 'Is this correct?',
        yes: 'Correct',
        no: 'Incorrect',
        streak: 'Verification Streak'
      },
      contribute: {
        title: 'Add to Dictionary',
        word_label: 'Word or Phrase',
        lang_label: 'Language',
        trans_label: 'Translation (English/Portuguese)',
        submit: 'Submit Contribution',
        success: 'Thanks for contributing!'
      },
      verify_title: 'Verificar Traduções',
      verify_desc: 'Help us check if the AI got the Ndau greeting correct.',
      btn_review: 'Start Review',
      vocab_title: 'Add Vocabulary',
      vocab_desc: 'Add local slang from Maputo to our dictionary.',
      btn_contribute: 'Contribute',
      sign_in: 'Entrar para Contribuir'
    },
    profile: {
      privacy_policy: 'Privacy Policy'
    }
  },
  pt: {
    nav: {
      translate: 'Traduzir',
      learn: 'Aprender',
      tutor: 'Tutor',
      tourist: 'Turista',
      community: 'Comunidade',
      weekly_goal: 'Meta Semanal',
      days: 'dias'
    },
    translate: {
      placeholder: 'Digite o texto aqui...',
      scan: 'Escanear',
      record: 'Toque para Falar',
      listening: 'Ouvindo...',
      translate_btn: 'Traduzir',
      thinking: 'Pensando...',
      pronunciation: 'Pronúncia'
    },
    tutor: {
      title: 'Tutor AfriLingo',
      subtitle: 'Sempre aqui para ajudar você.',
      intro: 'Mwauka bwanji! (Bom dia!) Sou seu tutor AfriLingo. Qual idioma você gostaria de praticar hoje?',
      type_placeholder: 'Digite uma mensagem...',
      suggested: ['👋 Saudações', '🍎 Mercado', '🚌 Viagem', '👪 Família', '😂 Gírias']
    },
    learn: {
      streak: 'Sequência Diária',
      fire: "Você está com tudo!",
      current_path: 'Trilha Atual',
      challenge_title: 'Desafio Semanal',
      challenge_desc: 'Complete 3 módulos de conversação para desbloquear o emblema "Poliglota".',
      view_details: 'Ver Detalhes',
      start_lesson: 'Iniciar Lição',
      view_phrases: 'Ver Frases Chave'
    },
    tourist: {
      title: 'Modo Turista',
      subtitle: 'Frases de sobrevivência para sua viagem.',
      translating_to: 'Traduzindo para:',
      tap_translate: 'Toque para traduzir'
    },
    community: {
      title: 'Clube da Comunidade',
      desc: 'Ajude a preservar línguas africanas! Contribua com traduções, verifique frases ou grave pronúncias.',
      tabs: {
        feed: 'Feed',
        verify: 'Verificar',
        contribute: 'Adicionar'
      },
      feed: {
        empty: 'Nenhuma atividade recente.',
        verified: 'verificou uma tradução',
        added: 'adicionou uma nova frase'
      },
      verify: {
        title: 'Isto está correto?',
        yes: 'Correto',
        no: 'Incorreto',
        streak: 'Sequência de Verificação'
      },
      contribute: {
        title: 'Adicionar ao Dicionário',
        word_label: 'Palavra ou Frase',
        lang_label: 'Idioma',
        trans_label: 'Tradução (Inglês/Português)',
        submit: 'Enviar Contribuição',
        success: 'Obrigado por contribuir!'
      },
      verify_title: 'Verificar Traduções',
      verify_desc: 'Ajude-nos a verificar se a IA acertou a saudação em Ndau.',
      btn_review: 'Iniciar Revisão',
      vocab_title: 'Adicionar Vocabulário',
      vocab_desc: 'Adicione gírias locais de Maputo ao nosso dicionário.',
      btn_contribute: 'Contribuir',
      sign_in: 'Entrar para Contribuir'
    },
    profile: {
      privacy_policy: 'Política de Privacidade'
    }
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    // Detect browser language
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'pt') {
      setLanguage('pt');
    }
  }, []);

  const t = (path: string) => {
    const keys = path.split('.');
    let current: any = translations[language];
    for (const key of keys) {
      if (current[key] === undefined) return path;
      current = current[key];
    }
    return current;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};