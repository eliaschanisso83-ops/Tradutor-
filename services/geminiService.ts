import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";

// Initialization strictly using process.env.API_KEY as per guidelines.
// Ensure your build tool (Vite) defines 'process.env.API_KEY'.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// We use the Multimodal Flash model for Text, Audio analysis, and Image analysis
// gemini-3-flash-preview is the current recommendation for speed and multimodal capabilities.
const MULTIMODAL_MODEL = 'gemini-3-flash-preview';
const TTS_MODEL = 'gemini-2.5-flash-preview-tts';

// Helper to clean Markdown code blocks safely
const cleanJsonOutput = (text: string): string => {
  if (!text) return '{}';
  let clean = text.trim();
  // Remove ```json and ``` using string replacement
  if (clean.startsWith('```json')) {
    clean = clean.substring(7);
  } else if (clean.startsWith('```')) {
    clean = clean.substring(3);
  }
  
  if (clean.endsWith('```')) {
    clean = clean.substring(0, clean.length - 3);
  }
  
  return clean.trim();
};

export const translateText = async (
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<{ translated: string; pronunciation: string }> => {
  if (!process.env.API_KEY) {
    return { translated: "Error: Missing API Key.", pronunciation: "" };
  }

  try {
    const prompt = `Translate the following text from ${sourceLang} to ${targetLang}.
    Text: "${text}"
    
    Return strict JSON format:
    {
      "translated": "The translation",
      "pronunciation": "Phonetic pronunciation guide if applicable"
    }
    
    If ${targetLang} is an African language, ensure deep linguistic accuracy.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MULTIMODAL_MODEL,
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: 'application/json',
        // Removed thinkingConfig to maximize compatibility and avoid 400 errors with some keys/regions
      }
    });

    const parsed = JSON.parse(cleanJsonOutput(response.text || '{}'));
    
    return { 
      translated: parsed.translated || 'Translation failed', 
      pronunciation: parsed.pronunciation || '' 
    };
  } catch (error) {
    console.error("Translation error:", error);
    return { translated: "Connection Error. Try again.", pronunciation: "" };
  }
};

export const translateImage = async (
  base64Image: string,
  mimeType: string,
  targetLang: string
): Promise<string> => {
  if (!process.env.API_KEY) return "Error: Missing API Key";

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
            text: `Analyze this image. Identify any text or main objects. Translate the findings to ${targetLang}. Return ONLY the translated text or description.`,
          },
        ],
      },
    });

    return response.text || "Could not analyze image.";
  } catch (error) {
    console.error("Vision error:", error);
    return "Error processing image.";
  }
};

export const translateAudio = async (
  base64Audio: string,
  mimeType: string,
  targetLang: string
): Promise<{ transcription: string; translation: string }> => {
  if (!process.env.API_KEY) return { transcription: "Missing Key", translation: "Error" };

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
            text: `Listen to this audio.
            1. Transcribe it verbatim (original language).
            2. Translate it to ${targetLang}.
            
            Return JSON:
            {
              "transcription": "...",
              "translation": "..."
            }`,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
      }
    });

    const parsed = JSON.parse(cleanJsonOutput(response.text || '{}'));
    
    return {
      transcription: parsed.transcription || "(Unintelligible)",
      translation: parsed.translation || "Could not translate"
    };

  } catch (error) {
    console.error("Audio error:", error);
    return { transcription: "Error", translation: "Error processing audio" };
  }
};

export const chatWithTutor = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  learningLang: string
): Promise<string> => {
  if (!process.env.API_KEY) return "Please configure your API Key.";

  try {
    const chat = ai.chats.create({
      model: MULTIMODAL_MODEL,
      history: history,
      config: {
        systemInstruction: `You are AfriLingo, a helpful African language tutor for ${learningLang}. Be concise, encouraging, and culturally relevant.`,
      }
    });

    const result = await chat.sendMessage({ message });
    return result.text || "I didn't catch that.";
  } catch (error) {
    console.error("Chat error:", error);
    return "Connection error.";
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