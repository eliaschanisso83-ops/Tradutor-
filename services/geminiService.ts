import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";

// Ensure the API Key is valid string before initializing
const apiKey = process.env.API_KEY;
const isValidKey = apiKey && apiKey.length > 10 && apiKey !== 'undefined';

// Initialization strictly using process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: isValidKey ? apiKey : 'MISSING_KEY' });

// SWITCHED MODEL: 'gemini-flash-latest' for better stability
const MULTIMODAL_MODEL = 'gemini-flash-latest';
const TTS_MODEL = 'gemini-2.5-flash-preview-tts';

// Robust JSON extractor
const extractJSON = (text: string): any => {
  try {
    return JSON.parse(text);
  } catch (e) {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch (e2) {}
    }
    const arrayMatch = text.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try { return JSON.parse(arrayMatch[0]); } catch (e3) {}
    }
    return null;
  }
};

// Helper to format Google API errors into friendly text
const formatError = (error: any): string => {
  const msg = error.message || error.toString();
  if (msg.includes('429') || msg.includes('quota')) {
    return "Limite de uso (Quota) atingido. Tente novamente em 1 min.";
  }
  if (msg.includes('503') || msg.includes('overloaded')) {
    return "Servidor ocupado. Tente novamente.";
  }
  return "Erro de conexão. Verifique sua internet.";
};

export const translateText = async (
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<{ translated: string; pronunciation: string; error?: string }> => {
  if (!isValidKey) return { translated: "Erro Config", pronunciation: "", error: "API Key ausente" };

  try {
    const prompt = `Translate this text from ${sourceLang} to ${targetLang}.
    Text: "${text}"
    Output ONLY JSON: {"translated": "...", "pronunciation": "..."}`;

    const response = await ai.models.generateContent({
      model: MULTIMODAL_MODEL,
      contents: { parts: [{ text: prompt }] },
    });

    const parsed = extractJSON(response.text || "{}");
    return { 
      translated: parsed?.translated || response.text, 
      pronunciation: parsed?.pronunciation || '' 
    };
  } catch (error: any) {
    return { translated: "Erro", pronunciation: "", error: formatError(error) };
  }
};

export const translateImage = async (base64Image: string, mimeType: string, targetLang: string): Promise<string> => {
  if (!isValidKey) return "Erro API Key";
  try {
    const response = await ai.models.generateContent({
      model: MULTIMODAL_MODEL,
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Image } },
          { text: `Translate text in image to ${targetLang}. If no text, describe.` },
        ],
      },
    });
    return response.text || "Sem resultado.";
  } catch (error: any) { return formatError(error); }
};

export const translateAudio = async (base64Audio: string, mimeType: string, targetLang: string): Promise<any> => {
  if (!isValidKey) return { transcription: "Erro", translation: "Erro API" };
  try {
    const response = await ai.models.generateContent({
      model: MULTIMODAL_MODEL,
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Audio } },
          { text: `Transcribe and translate to ${targetLang}. JSON: {"transcription": "...", "translation": "..."}` },
        ],
      },
    });
    const parsed = extractJSON(response.text || "{}");
    return { transcription: parsed?.transcription || "...", translation: parsed?.translation || "..." };
  } catch (error: any) { return { transcription: "Erro", translation: formatError(error) }; }
};

export const chatWithTutor = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  learningLang: string
): Promise<string> => {
  if (!isValidKey) return "Erro: API Key não configurada.";

  try {
    // Sanitize history to ensure roles are strictly 'user' or 'model'
    const safeHistory = history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: h.parts
    }));

    const chat = ai.chats.create({
      model: MULTIMODAL_MODEL,
      history: safeHistory,
      config: { 
        systemInstruction: `You are a helpful language tutor teaching ${learningLang}. Keep answers short, encouraging, and educational.` 
      }
    });

    const result = await chat.sendMessage({ message });
    return result.text || "(Sem resposta)";
  } catch (error) {
    console.error(error);
    return formatError(error);
  }
};

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const generateQuiz = async (topic: string, lang: string): Promise<QuizQuestion[]> => {
  if (!isValidKey) return getMockQuiz(topic, lang);

  try {
    const prompt = `Create a quiz with 3 multiple-choice questions for a beginner learning ${lang} about "${topic}".
    Output strictly valid JSON array:
    [
      {
        "question": "What is 'Hello' in ${lang}?",
        "options": ["A", "B", "C", "D"],
        "correctIndex": 0,
        "explanation": "Because..."
      }
    ]`;

    const response = await ai.models.generateContent({
      model: MULTIMODAL_MODEL,
      contents: { parts: [{ text: prompt }] },
    });

    const data = extractJSON(response.text || "");
    if (Array.isArray(data) && data.length > 0) return data;
    throw new Error("Invalid JSON");
  } catch (error) {
    console.warn("Quiz generation failed, using mock:", error);
    return getMockQuiz(topic, lang);
  }
};

// Fallback if API fails
const getMockQuiz = (topic: string, lang: string): QuizQuestion[] => {
  return [
    {
      question: `How do you greet someone in ${lang}?`,
      options: ["Hello", "Goodbye", "Sleep", "Run"],
      correctIndex: 0,
      explanation: "Basic greeting is essential."
    },
    {
      question: `Which word relates to "${topic}"?`,
      options: ["Water", "Market", "Car", "Sky"],
      correctIndex: 1,
      explanation: "Context matches the topic."
    },
    {
      question: "Select the correct phrase.",
      options: ["Wrong Phrase", "Bad Grammar", "Correct Phrase", "Nonsense"],
      correctIndex: 2,
      explanation: "This follows grammatical rules."
    }
  ];
};

export const generateSpeech = async (text: string): Promise<string | null> => {
  if (!isValidKey) return null;
  try {
    const response = await ai.models.generateContent({
      model: TTS_MODEL,
      contents: { parts: [{ text }] },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) { return null; }
};