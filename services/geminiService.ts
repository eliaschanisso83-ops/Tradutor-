import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";

// Ensure the API Key is valid string before initializing
const apiKey = process.env.API_KEY;
const isValidKey = apiKey && apiKey.length > 10 && apiKey !== 'undefined';

// Initialization strictly using process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: isValidKey ? apiKey : 'MISSING_KEY' });

// Using gemini-3-flash-preview as per instructions.
const MULTIMODAL_MODEL = 'gemini-3-flash-preview';
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
    return {};
  }
};

export const translateText = async (
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<{ translated: string; pronunciation: string; error?: string }> => {
  
  if (!isValidKey) {
    console.error("API Key Check Failed. Value exists:", !!apiKey);
    return { translated: "Erro de Configuração", pronunciation: "", error: "Chave de API inválida ou ausente no Vercel." };
  }

  try {
    const prompt = `Translate this text from ${sourceLang} to ${targetLang}.
    Text: "${text}"
    
    Output ONLY a JSON object:
    {"translated": "YOUR_TRANSLATION", "pronunciation": "PRONUNCIATION_GUIDE"}
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MULTIMODAL_MODEL,
      contents: { parts: [{ text: prompt }] },
    });

    const rawText = response.text || "{}";
    const parsed = extractJSON(rawText);
    
    if (!parsed.translated) {
      return { translated: rawText, pronunciation: "" };
    }
    
    return { 
      translated: parsed.translated, 
      pronunciation: parsed.pronunciation || '' 
    };
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return { translated: "Erro de Conexão", pronunciation: "", error: error.message || "Verifique a API Key." };
  }
};

export const translateImage = async (
  base64Image: string,
  mimeType: string,
  targetLang: string
): Promise<string> => {
  if (!isValidKey) return "Erro: Chave de API faltando.";

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MULTIMODAL_MODEL,
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Image } },
          { text: `Translate text in image to ${targetLang}. If no text, describe image in ${targetLang}.` },
        ],
      },
    });

    return response.text || "Sem resultado.";
  } catch (error: any) {
    return `Erro: ${error.message}`;
  }
};

export const translateAudio = async (
  base64Audio: string,
  mimeType: string,
  targetLang: string
): Promise<{ transcription: string; translation: string }> => {
  if (!isValidKey) return { transcription: "Erro", translation: "Chave ausente" };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MULTIMODAL_MODEL,
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Audio } },
          { text: `Transcribe and translate to ${targetLang}. JSON: {"transcription": "...", "translation": "..."}` },
        ],
      },
    });

    const parsed = extractJSON(response.text || "{}");
    return {
      transcription: parsed.transcription || "(Áudio)",
      translation: parsed.translation || "Falha na tradução"
    };
  } catch (error: any) {
    return { transcription: "Erro", translation: error.message };
  }
};

export const chatWithTutor = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  learningLang: string
): Promise<string> => {
  if (!isValidKey) return "Erro: API Key inválida.";

  try {
    const chat = ai.chats.create({
      model: MULTIMODAL_MODEL,
      history: history,
      config: { systemInstruction: `Tutor for ${learningLang}. Concise.` }
    });

    const result = await chat.sendMessage({ message });
    return result.text || "...";
  } catch (error) {
    return "Erro de conexão.";
  }
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
  } catch (error) {
    console.error(error);
    return null;
  }
};