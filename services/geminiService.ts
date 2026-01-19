import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";

// Initialization strictly using process.env.API_KEY as per guidelines.
// Ensure your build tool (Vite) defines 'process.env.API_KEY'.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// We use the Multimodal Flash model for Text, Audio analysis, and Image analysis
// It is faster and handles file uploads better than the specialized models.
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
  try {
    // Optimized prompt for speed
    const prompt = `Translate "${text}" from ${sourceLang} to ${targetLang}. JSON format: {"translated": "...", "pronunciation": "..."}. If ${targetLang} is African, use accurate linguistic roots.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MULTIMODAL_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        // CRITICAL FOR SPEED: Disable thinking budget for simple translation tasks
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    const parsed = JSON.parse(cleanJsonOutput(response.text || '{}'));
    
    return { 
      translated: parsed.translated || 'Translation error', 
      pronunciation: parsed.pronunciation || '' 
    };
  } catch (error) {
    console.error("Translation error:", error);
    // Provide a more specific error if possible, or fall back to generic
    return { translated: "Error: Check API Key or Connection.", pronunciation: "" };
  }
};

export const translateImage = async (
  base64Image: string,
  mimeType: string,
  targetLang: string
): Promise<string> => {
  try {
    // Using gemini-3-flash-preview for vision as it is robust for OCR + Translation
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
            text: `Analyze this image. Extract any text found and translate it to ${targetLang}. If there is no text, describe what is in the image in ${targetLang}. Return ONLY the translation or description.`,
          },
        ],
      },
      // Disable thinking for image analysis speed
      config: {
         thinkingConfig: { thinkingBudget: 0 }
      }
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
    // Using gemini-3-flash-preview for audio analysis (transcription + translation)
    // It accepts generic audio inputs better than the Native Audio live model.
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
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingBudget: 0 }
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
      model: MULTIMODAL_MODEL,
      history: history,
      config: {
        systemInstruction: `You are AfriLingo, a helpful, patient, and knowledgeable African language tutor. 
        The user is learning ${learningLang}. 
        Correct their grammar gently. Explain cultural context when relevant.
        Keep responses concise and encouraging. 
        If asked about specific dialects (e.g. Ndau vs Shona), explain the differences.`,
        // We keep a small budget for the Tutor to allow for better explanations, but low enough to be fast
        thinkingConfig: { thinkingBudget: 1024 }
      }
    });

    const result = await chat.sendMessage({ message });
    return result.text || "I didn't catch that.";
  } catch (error) {
    console.error("Chat error:", error);
    return "Connection error. Please check your API Key.";
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