import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";

// Initialization strictly using process.env.API_KEY as per guidelines.
// Ensure your build tool (Vite) defines 'process.env.API_KEY'.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using a highly stable model ID. 
// gemini-3-flash-preview is powerful but if it fails we handle it gracefully.
const MULTIMODAL_MODEL = 'gemini-3-flash-preview';
const TTS_MODEL = 'gemini-2.5-flash-preview-tts';

// Robust JSON extractor that finds JSON object anywhere in text
const extractJSON = (text: string): any => {
  try {
    // 1. Try direct parse
    return JSON.parse(text);
  } catch (e) {
    // 2. Try to find { ... } block
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e2) {
        console.warn("JSON Parse failed on extraction", e2);
      }
    }
    // 3. Fallback
    return {};
  }
};

export const translateText = async (
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<{ translated: string; pronunciation: string; error?: string }> => {
  
  if (!process.env.API_KEY) {
    console.error("API KEY IS MISSING");
    return { translated: "Erro: Chave de API não configurada.", pronunciation: "", error: "Missing API Key" };
  }

  try {
    // Simplified prompt - No strict JSON mode in config to avoid 400 errors
    const prompt = `Translate this text from ${sourceLang} to ${targetLang}.
    Text: "${text}"
    
    Output ONLY a JSON object with this format:
    {"translated": "YOUR_TRANSLATION", "pronunciation": "PRONUNCIATION_GUIDE"}
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MULTIMODAL_MODEL,
      contents: { parts: [{ text: prompt }] },
      // Removed 'responseMimeType: application/json' as it causes failures on some keys
    });

    const rawText = response.text || "{}";
    const parsed = extractJSON(rawText);
    
    if (!parsed.translated) {
      // Fallback if model just output text
      return { translated: rawText, pronunciation: "" };
    }
    
    return { 
      translated: parsed.translated, 
      pronunciation: parsed.pronunciation || '' 
    };
  } catch (error: any) {
    console.error("Translation Critical Error:", error);
    const msg = error.message || error.toString();
    return { translated: "Erro de Conexão.", pronunciation: "", error: msg };
  }
};

export const translateImage = async (
  base64Image: string,
  mimeType: string,
  targetLang: string
): Promise<string> => {
  if (!process.env.API_KEY) return "Erro: Chave de API faltando.";

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MULTIMODAL_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          },
          {
            text: `Translate text in image to ${targetLang}. If no text, describe image in ${targetLang}. Return only the result.`,
          },
        ],
      },
    });

    return response.text || "Não foi possível analisar.";
  } catch (error: any) {
    console.error("Vision error:", error);
    return `Erro: ${error.message || "Falha na imagem"}`;
  }
};

export const translateAudio = async (
  base64Audio: string,
  mimeType: string,
  targetLang: string
): Promise<{ transcription: string; translation: string }> => {
  if (!process.env.API_KEY) return { transcription: "Erro API", translation: "Chave faltando" };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MULTIMODAL_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio,
            },
          },
          {
            text: `Transcribe and translate to ${targetLang}. Return JSON: {"transcription": "...", "translation": "..."}`,
          },
        ],
      },
    });

    const parsed = extractJSON(response.text || "{}");
    
    return {
      transcription: parsed.transcription || "Áudio não detectado",
      translation: parsed.translation || "Falha na tradução"
    };

  } catch (error: any) {
    console.error("Audio error details:", error);
    return { transcription: "Erro no Áudio", translation: error.message || "Tente novamente" };
  }
};

export const chatWithTutor = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  learningLang: string
): Promise<string> => {
  if (!process.env.API_KEY) return "Erro: Configurar API Key.";

  try {
    const chat = ai.chats.create({
      model: MULTIMODAL_MODEL,
      history: history,
      config: {
        systemInstruction: `You are AfriLingo, a tutor for ${learningLang}. Keep it short.`,
      }
    });

    const result = await chat.sendMessage({ message });
    return result.text || "...";
  } catch (error) {
    console.error("Chat error:", error);
    return "Erro de conexão com o Tutor.";
  }
};

export const generateSpeech = async (text: string): Promise<string | null> => {
  if (!process.env.API_KEY) return null;

  try {
    const response = await ai.models.generateContent({
      model: TTS_MODEL,
      contents: { parts: [{ text }] },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) {
    console.error("TTS error:", error);
    return null;
  }
};