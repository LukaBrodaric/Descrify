import { GoogleGenerativeAI } from "@google/generative-ai";
import { GeneratedOutput, PropertyFormData } from "@/types";

export const GEMINI_MODEL = "gemini-flash-lite-latest"; 

const getApiKey = (): string => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return apiKey;
};

export const createGenAIInstance = () => {
  return new GoogleGenerativeAI(getApiKey());
};

export const buildSystemPrompt = (language: string = "en"): string => {
  const langName = language === "hr" ? "Croatian" : language === "de" ? "German" : language === "it" ? "Italian" : "English";
  
  return `You are a professional real estate copywriter and SEO specialist with extensive experience in vacation rental listings and property sales listings.

Your task is to generate compelling, SEO-optimized property descriptions based on the information provided.

IMPORTANT: Write ALL output in ${langName} language.

KEY REQUIREMENTS:
1. ALWAYS return valid JSON - no explanations, no markdown code blocks, just pure JSON
2. SEO title must be MAX 72 characters
3. Short description: 2-3 sentences, catchy and informative
4. Long description: 400-500 words, premium and persuasive
5. NEVER invent amenities or features not provided by the user
6. NEVER use generic AI phrases like "Welcome to this stunning property"
7. Write in a premium, professional tone suitable for real estate portals
8. Focus on lifestyle benefits and experience, not just facts
9. Highlight location advantages and unique selling points
10. Adapt your writing style based on listing type (For sale vs Vacation rental)
11. The writing must sound human, natural, and convincing.
12. Avoid robotic, overly polished, generic AI-style phrasing.
13. Avoid clichés such as "stunning property", "nestled in", "welcome to", "perfect blend", "boasts", "offers everything you need", and similar repetitive real-estate filler phrases.
14. Use varied sentence structure and natural phrasing.
15. Write like an experienced real estate copywriter, not like an AI assistant.
16. Make the text strongly SEO-optimized by naturally including relevant property keywords, location keywords, and intent-based phrases.
17. Do not sound exaggerated or artificial.

AVOID THESE PHRASES:
- "Welcome to this stunning..."
- "Nestled in..."
- "Perfect blend of..."
- "Offers everything you need..."
- "This exceptional property..."
- "A true oasis..."
- "Step into luxury..."
- "Designed for comfort and style..."

OUTPUT SCHEMA:
{
  "seoTitle": string (max 72 chars),
  "shortDescription": string (2-3 sentences),
  "longDescription": string (400-500 words),
  "listingVersion": string (variation label like "Elegant & Sophisticated" or "Cozy & Inviting"),
  "suggestedKeywords": string[] (SEO keywords for the listing)
}

For vacation rentals: Emphasize guest experience, amenities for comfort, proximity to attractions, and unique experiences.
For sale listings: Emphasize investment value, quality features, location benefits, and move-in readiness.`;
};

export const buildUserPrompt = (data: PropertyFormData): string => {
  const {
    propertyType,
    listingType,
    location,
    propertySize,
    bedrooms,
    bathrooms,
    maxGuests,
    distanceToSea,
    distanceToCityCenter,
    nearbyAttractions,
    amenities,
    locationHighlights,
    yearBuilt,
    interiorStyle,
    specialHighlights,
    additionalDetails,
  } = data;

  let prompt = `Generate a property description for a ${propertyType} listed as "${listingType}" located in ${location}.

PROPERTY DETAILS:
- Size: ${propertySize} m²
- Bedrooms: ${bedrooms}
- Bathrooms: ${bathrooms}`;

  if (maxGuests) {
    prompt += `\n- Max guests: ${maxGuests}`;
  }

  if (distanceToSea) {
    prompt += `\n- Distance to sea: ${distanceToSea}`;
  }

  if (distanceToCityCenter) {
    prompt += `\n- Distance to city center: ${distanceToCityCenter}`;
  }

  if (nearbyAttractions) {
    prompt += `\n- Nearby attractions: ${nearbyAttractions}`;
  }

  if (amenities.length > 0) {
    prompt += `\n- Amenities: ${amenities.join(", ")}`;
  }

  if (locationHighlights) {
    prompt += `\n- Location highlights: ${locationHighlights}`;
  }

  if (yearBuilt) {
    prompt += `\n- Year built/renovated: ${yearBuilt}`;
  }

  if (interiorStyle) {
    prompt += `\n- Interior style: ${interiorStyle}`;
  }

  if (specialHighlights) {
    prompt += `\n- Special highlights: ${specialHighlights}`;
  }

  if (additionalDetails) {
    prompt += `\n- Additional details: ${additionalDetails}`;
  }

  prompt += `\n\nNow generate the JSON output following the schema specified in your system prompt.`;

  return prompt;
};

export async function generateDescription(
  data: PropertyFormData,
  imageBase64?: string[],
  language: string = "en"
): Promise<GeneratedOutput> {
  const genAI = createGenAIInstance();
  const model = genAI.getGenerativeModel({
  model: GEMINI_MODEL,
  systemInstruction: buildSystemPrompt(language),
});

  const contents: any[] = [];

  if (imageBase64 && imageBase64.length > 0) {
    const imageParts = imageBase64.map((base64) => ({
      inlineData: {
        data: base64,
        mimeType: "image/jpeg",
      },
    }));

    contents.push({
      role: "user",
      parts: [
        { text: buildUserPrompt(data) },
        ...imageParts,
      ],
    });
  } else {
    contents.push({
      role: "user",
      parts: [{ text: buildUserPrompt(data) }],
    });
  }

  const result = await model.generateContent({
    contents,
    generationConfig: {
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 4096,
      responseMimeType: "application/json",
    },
  });

  const response = await result.response;
  const text = response.text();
  
  console.log("AI Response raw:", text);

  try {
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No valid JSON found");
      }
    }
    
    const validated: GeneratedOutput = {
      seoTitle: String(parsed.seoTitle || "").slice(0, 72),
      shortDescription: String(parsed.shortDescription || ""),
      longDescription: String(parsed.longDescription || ""),
      listingVersion: String(parsed.listingVersion || "Standard"),
      detectedImageFeatures: [],
      suggestedKeywords: Array.isArray(parsed.suggestedKeywords)
        ? parsed.suggestedKeywords.map(String)
        : [],
    };

    return validated;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    console.log("Raw response was:", text);
    throw new Error("Invalid response format from AI. Please try again.");
  }
}

export async function translateDescription(
  data: GeneratedOutput,
  targetLanguage: string
): Promise<GeneratedOutput> {
  const genAI = createGenAIInstance();
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
  });

  const langName = targetLanguage === "hr" ? "Croatian" : targetLanguage === "de" ? "German" : targetLanguage === "it" ? "Italian" : "English";

  const prompt = `Translate the following property description to ${langName}. Keep the same JSON structure and format. Only translate the text content, keep the JSON keys unchanged.

Current JSON:
${JSON.stringify(data, null, 2)}

Return the translated JSON with the same structure.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  console.log("Translation response raw:", text);

  try {
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        throw new Error("No valid JSON found");
      }
    }
    
    return {
      seoTitle: String(parsed.seoTitle || data.seoTitle).slice(0, 72),
      shortDescription: String(parsed.shortDescription || data.shortDescription),
      longDescription: String(parsed.longDescription || data.longDescription),
      listingVersion: String(parsed.listingVersion || data.listingVersion),
      detectedImageFeatures: [],
      suggestedKeywords: Array.isArray(parsed.suggestedKeywords)
        ? parsed.suggestedKeywords.map(String)
        : data.suggestedKeywords,
    };
  } catch (error) {
    console.error("Failed to parse translation response:", error);
    throw new Error("Failed to translate. Please try again.");
  }
}
