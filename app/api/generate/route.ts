import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, incrementRateLimit, getClientIp } from "@/lib/rate-limit";
import { generateDescription, translateDescription } from "@/lib/ai";
import { propertyFormSchema } from "@/lib/validation";
import { PropertyFormData, GeneratedOutput } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(clientIp);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `You have reached the daily limit of 5 generations. Please try again in 24 hours.`,
          remainingGenerations: 0,
          usedGenerations: 5,
        },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    
    const data: Record<string, unknown> = {};
    const images: string[] = [];
    let language = "en";

    for (const [key, value] of formData.entries()) {
      if (key === "images") {
        const file = value as File;
        if (file && file.size > 0) {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          images.push(buffer.toString("base64"));
        }
      } else if (key === "amenities") {
        if (!data.amenities) {
          data.amenities = [];
        }
        (data.amenities as string[]).push(value as string);
      } else if (key === "language") {
        language = value as string;
      } else if (key === "maxGuests" || key === "bedrooms" || key === "bathrooms" || key === "propertySize") {
        data[key] = value === "" ? undefined : Number(value);
      } else {
        data[key] = value;
      }
    }

    const parsedData = {
      ...data,
      amenities: data.amenities || [],
    };

    const validated = propertyFormSchema.parse(parsedData);
    
    const validatedWithImages: PropertyFormData = {
      ...validated,
      amenities: validated.amenities as PropertyFormData["amenities"],
    };

    let imageBase64: string[] | undefined;
    if (images.length > 0) {
      imageBase64 = images;
    }

    const result = await generateDescription(validatedWithImages, imageBase64, language);

    incrementRateLimit(clientIp);

    const newRateLimit = checkRateLimit(clientIp);

    return NextResponse.json({
      success: true,
      data: result,
      remainingGenerations: newRateLimit.remaining,
      usedGenerations: newRateLimit.used,
    });
  } catch (error: unknown) {
    console.error("Generation error:", error);

    if (error instanceof Error && error.message.includes("GEMINI_API_KEY")) {
      return NextResponse.json(
        { success: false, error: "API key not configured. Please contact the administrator." },
        { status: 500 }
      );
    }

    if (error instanceof Error && error.message.includes("Invalid response format")) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 502 }
      );
    }

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Invalid form data. Please check your inputs." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { data, targetLanguage } = body as {
      data: GeneratedOutput;
      targetLanguage: string;
    };

    if (!data || !targetLanguage) {
      return NextResponse.json(
        { success: false, error: "Missing data or target language" },
        { status: 400 }
      );
    }

    const translated = await translateDescription(data, targetLanguage);

    return NextResponse.json({
      success: true,
      data: translated,
    });
  } catch (error: unknown) {
    console.error("Translation error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to translate. Please try again." },
      { status: 500 }
    );
  }
}
