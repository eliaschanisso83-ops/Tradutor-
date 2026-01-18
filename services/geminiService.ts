import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";

// The build system (Vite) is configured to replace 'process.env.API_KEY'
// with the actual string value from the environment variables during build.
// Always access process.env.API_KEY directly in the constructor.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const TEXT_MODEL = 'gemini-3-flash-preview';
const VISION_MODEL = 'gemini-2.5-flash-image';
const AUDIO_MODEL = 'gemini-2.5-flash-native-audio-preview-12-2025';
const TTS_MODEL = 'gemini-2.5-flash-preview-tts';

// Helper to clean Markdown code blocks safely without using backtick regex literals
const cleanJsonOutput = (text: string): string => {
  if (!text) return '{}';
  let clean = text.trim();
  // Remove ```json and ``` using string replacement to avoid tokenizer issues
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
  try {
    const prompt = `
      Translate the following text from ${sourceLang} to ${targetLang}.
      If ${targetLang} is a local African language with limited resources, use your knowledge of linguistic roots (Bantu, etc.) to provide the most accurate translation possible.
      
      Also provide a pronunciation guide (phonetic approximation).
      
      Input Text: "${text}"
      
      Return JSON format:
      {
        "translated": "The translated text",
        "pronunciation": "The phonetic pronunciation"
      }
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(cleanJsonOutput(response.text || '{}'));
    
    return { 
      translated: parsed.translated || 'Translation error', 
      pronunciation: parsed.pronunciation || '' 
    };
  } catch (error) {
    console.error("Translation error:", error);
    return { translated: "Error connecting to AI.", pronunciation: "" };
  }
};

export const translateImage = async (
  base64Image: string,
  mimeType: string,
  targetLang: string
): Promise<string> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: VISION_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          },
          {
            text: `Analyze this image. Extract any text found and translate it to ${targetLang}. If there is no text, describe what is in the image in ${targetLang}. Return ONLY the translation or description.`,
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
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: AUDIO_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio,
            },
          },
          {
            text: `Transcribe the spoken audio verbatim. Then, translate it to ${targetLang}.
            
            Return format JSON:
            {
              "transcription": "original text",
              "translation": "translated text"
            }
            `,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(cleanJsonOutput(response.text || '{}'));
    
    return {
      transcription: parsed.transcription || "No speech detected",
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
  try {
    const chat = ai.chats.create({
      model: TEXT_MODEL,
      history: history,
      config: {
        systemInstruction: `You are AfriLingo, a helpful, patient, and knowledgeable African language tutor. 
        The user is learning ${learningLang}. 
        Correct their grammar gently. Explain cultural context when relevant.
        Keep responses concise and encouraging. 
        If asked about specific dialects (e.g. Ndau vs Shona), explain the differences.`
      }
    });

    const result = await chat.sendMessage({ message });
    return result.text || "I didn't catch that.";
  } catch (error) {
    console.error("Chat error:", error);
    return "My connection is a bit slow right now. Try again?";
  }
};

export const generateSpeech = async (text: string): Promise<string | null> => {
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
    
    // Extract base64 audio data
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) {
    console.error("TTS error:", error);
    return null;
  }
};