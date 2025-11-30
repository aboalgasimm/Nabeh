import { GoogleGenAI, Type } from "@google/genai";
import { VehicleTelemetry, GeminiAnalysis, LocationInsight, Language } from "../types";

const MODEL_NAME = "gemini-2.5-flash";

export const analyzeRisk = async (vehicle: VehicleTelemetry, lang: Language): Promise<GeminiAnalysis> => {
  try {
    // Fallback if API key is missing
    if (!process.env.API_KEY) {
      return {
        summary: "تحليل تجريبي: يُظهر السائق نمط قيادة متذبذب مع تغيرات مفاجئة في السرعة، مما يشير إلى تشتت الانتباه أو الإجهاد.",
        recommendations: ["إرسال تنبيه صوتي لخفض السرعة", "اقتراح أخذ استراحة قصيرة للسائق"]
      };
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
      Analyze the following vehicle telemetry data for a driver safety system named "Nabeh" integrated with Absher.
      
      Vehicle ID: ${vehicle.id}
      Speed: ${vehicle.speed} km/h
      Vertical G-Force: ${vehicle.verticalG.toFixed(2)}G (Normal is ~1.0G. >1.5G indicates impact/bump)
      Risk Score: ${vehicle.riskScore}/100
      Risk Factors: ${vehicle.factors.join(', ')}
      Status: ${vehicle.status}

      Provide a concise analysis output in JSON format.
      If Vertical G-Force is high (>1.5), explicitly mention potential road damage or suspension issues.
      IMPORTANT: The output MUST be in ${lang === Language.EN ? 'English' : 'Arabic'}.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A 1-2 sentence explanation of the risk." },
            recommendations: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of 2 actionable steps for authorities or the driver."
            }
          },
          required: ["summary", "recommendations"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as GeminiAnalysis;
    }
    
    throw new Error("Empty response");

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return {
      summary: "تعذر إجراء التحليل الفوري. يرجى مراجعة البيانات الخام.",
      recommendations: []
    };
  }
};

export const analyzeLocationContext = async (lat: number, lng: number, lang: Language): Promise<LocationInsight> => {
  try {
    if (!process.env.API_KEY) {
      return {
        text: "محاكاة: الموقع يقع بالقرب من تقاطع مزدحم على طريق الملك فهد، مما يزيد من احتمالية التوقف المفاجئ.",
        sources: []
      };
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = lang === Language.EN
      ? "Briefly describe (2 sentences) the road type, typical traffic, or significant places (schools, hospitals) near this location in Riyadh."
      : "صف باختصار (جملتين) حالة الطرق، حركة المرور المعتادة، أو الأماكن الهامة (مدارس، مستشفيات) بالقرب من هذا الموقع في الرياض.";

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng
            }
          }
        }
      }
    });

    const sources: Array<{ title: string; uri: string }> = [];
    
    // Extract Maps grounding chunks
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    chunks.forEach(chunk => {
      if (chunk.web?.uri && chunk.web?.title) {
        sources.push({ title: chunk.web.title, uri: chunk.web.uri });
      }
    });

    return {
      text: response.text || "لا تتوفر معلومات.",
      sources
    };

  } catch (error) {
    console.error("Location context analysis failed:", error);
    return {
      text: "تعذر جلب معلومات الموقع في الوقت الحالي.",
      sources: []
    };
  }
};