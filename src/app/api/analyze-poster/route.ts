import { NextResponse } from "next/server";
import { totalumSdk } from "@/lib/totalum";
import type {
  ExtractedEventData,
  ExtractedField,
  GeneratedEventContent,
  PosterAnalysisResult,
} from "@/types/database";

// Helper function for serializing errors
function serializeError(err: unknown) {
  const e = err as {
    message?: string;
    code?: string;
    name?: string;
    response?: { status?: number; data?: unknown };
    stack?: string;
  };
  return {
    message: e?.message ?? "Unknown error",
    code: e?.code ?? null,
    name: e?.name ?? null,
    status: e?.response?.status ?? null,
    responseData: e?.response?.data ?? null,
  };
}

// Helper to create an empty field
function emptyField<T>(): ExtractedField<T> {
  return { value: null, confidence: 0, source: "inference" };
}

// Define extraction schema for scanDocument
const extractionSchema = {
  title: {
    type: "string",
    description: "The main title or name of the event, usually the largest text on the poster",
  },
  category: {
    type: "string",
    enum: ["ciencia", "arte", "musica", "lectura", "naturaleza", "deporte", "tecnologia", "idiomas", "experimentos", "otra"],
    description: "The category that best fits this event. Choose 'ciencia' for science, 'arte' for art/crafts, 'musica' for music, 'lectura' for reading/books, 'naturaleza' for nature/outdoors, 'deporte' for sports, 'tecnologia' for technology/robotics, 'idiomas' for languages, 'experimentos' for experiments/labs, 'otra' if none fit",
  },
  format: {
    type: "string",
    enum: ["presencial", "online"],
    description: "Whether the event is in-person (presencial) or online. Default to 'presencial' if not clear",
  },
  age_range: {
    type: "string",
    description: "The age range mentioned on the poster, like '3-7 años', '6 a 10', '+5 años', 'para niños de 4 a 8'. Extract exactly as written",
  },
  date_info: {
    type: "string",
    description: "All date information visible on the poster, including day, month, year. Format as found",
  },
  time_info: {
    type: "string",
    description: "All time information visible on the poster, including start and end times",
  },
  location_name: {
    type: "string",
    description: "The name of the venue or location where the event takes place",
  },
  address: {
    type: "string",
    description: "The street address if visible",
  },
  city: {
    type: "string",
    description: "The city name if visible",
  },
  price_info: {
    type: "string",
    description: "Price information including 'Gratis', 'Free', amounts like '15€', '10 euros', etc.",
  },
  capacity: {
    type: "number",
    description: "Maximum number of participants if mentioned, like 'Plazas limitadas: 20', 'máximo 15 niños'",
  },
  organizer_name: {
    type: "string",
    description: "The name of the organizer, company, or entity hosting the event",
  },
  contact_phone: {
    type: "string",
    description: "Phone number for contact or registration",
  },
  contact_email: {
    type: "string",
    description: "Email address for contact or registration",
  },
  website: {
    type: "string",
    description: "Website URL if visible",
  },
  materials_needed: {
    type: "array",
    description: "List of materials children need to bring",
    items: { type: "string" },
  },
  requirements: {
    type: "array",
    description: "Prerequisites or requirements for attending",
    items: { type: "string" },
  },
  event_description: {
    type: "string",
    description: "Any descriptive text about what the event involves, what children will learn, activities planned",
  },
  additional_notes: {
    type: "string",
    description: "Any other relevant information not captured in other fields",
  },
};

// Parse age range string to min/max
function parseAgeRange(ageRange: string | null): { min: number | null; max: number | null } {
  if (!ageRange) return { min: null, max: null };

  // Common patterns: "3-7", "3 a 7", "3 - 7", "de 3 a 7", "+5", "5+", "5 años y más"
  const rangeMatch = ageRange.match(/(\d+)\s*[-–aA]\s*(\d+)/);
  if (rangeMatch) {
    return { min: parseInt(rangeMatch[1]), max: parseInt(rangeMatch[2]) };
  }

  // Pattern for "5+" or "+5"
  const plusMatch = ageRange.match(/[+]?\s*(\d+)\s*[+]?/);
  if (plusMatch) {
    const age = parseInt(plusMatch[1]);
    // If it's a "+" pattern, set max to 18
    if (ageRange.includes("+")) {
      return { min: age, max: 18 };
    }
  }

  // Try to find any number
  const numMatch = ageRange.match(/(\d+)/);
  if (numMatch) {
    return { min: parseInt(numMatch[1]), max: null };
  }

  return { min: null, max: null };
}

// Parse date string to YYYY-MM-DD format
function parseDateInfo(dateInfo: string | null): { date: string | null; confidence: number } {
  if (!dateInfo) return { date: null, confidence: 0 };

  const currentYear = new Date().getFullYear();
  const months: Record<string, string> = {
    enero: "01", febrero: "02", marzo: "03", abril: "04",
    mayo: "05", junio: "06", julio: "07", agosto: "08",
    septiembre: "09", octubre: "10", noviembre: "11", diciembre: "12",
    jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
    jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
  };

  // Try to match "15 de marzo de 2024" or similar
  const spanishMatch = dateInfo.toLowerCase().match(/(\d{1,2})\s*(?:de\s+)?(\w+)(?:\s+(?:de\s+)?(\d{4}))?/);
  if (spanishMatch) {
    const day = spanishMatch[1].padStart(2, "0");
    const monthName = spanishMatch[2].toLowerCase();
    const month = months[monthName] || null;
    const year = spanishMatch[3] || currentYear.toString();

    if (month) {
      return { date: `${year}-${month}-${day}`, confidence: 0.85 };
    }
  }

  // Try DD/MM/YYYY or DD-MM-YYYY
  const euroMatch = dateInfo.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
  if (euroMatch) {
    const day = euroMatch[1].padStart(2, "0");
    const month = euroMatch[2].padStart(2, "0");
    let year = euroMatch[3];
    if (year.length === 2) year = "20" + year;
    return { date: `${year}-${month}-${day}`, confidence: 0.9 };
  }

  return { date: null, confidence: 0 };
}

// Parse time string to HH:MM format
function parseTimeInfo(timeInfo: string | null): { start: string | null; end: string | null; confidence: number } {
  if (!timeInfo) return { start: null, end: null, confidence: 0 };

  // Match patterns like "10:00 - 12:00", "10h - 12h", "10:00h a 12:00h"
  const rangeMatch = timeInfo.match(/(\d{1,2})[:\.]?(\d{2})?\s*h?\s*[-–aA]\s*(\d{1,2})[:\.]?(\d{2})?\s*h?/);
  if (rangeMatch) {
    const startHour = rangeMatch[1].padStart(2, "0");
    const startMin = (rangeMatch[2] || "00").padStart(2, "0");
    const endHour = rangeMatch[3].padStart(2, "0");
    const endMin = (rangeMatch[4] || "00").padStart(2, "0");
    return {
      start: `${startHour}:${startMin}`,
      end: `${endHour}:${endMin}`,
      confidence: 0.9,
    };
  }

  // Single time pattern
  const singleMatch = timeInfo.match(/(\d{1,2})[:\.]?(\d{2})?\s*h?/);
  if (singleMatch) {
    const hour = singleMatch[1].padStart(2, "0");
    const min = (singleMatch[2] || "00").padStart(2, "0");
    return { start: `${hour}:${min}`, end: null, confidence: 0.7 };
  }

  return { start: null, end: null, confidence: 0 };
}

// Parse price info to cents
function parsePriceInfo(priceInfo: string | null): { priceCents: number | null; isFree: boolean; confidence: number } {
  if (!priceInfo) return { priceCents: null, isFree: false, confidence: 0 };

  const lowerPrice = priceInfo.toLowerCase();

  // Check for free
  if (lowerPrice.includes("gratis") || lowerPrice.includes("free") || lowerPrice.includes("gratuito")) {
    return { priceCents: 0, isFree: true, confidence: 0.95 };
  }

  // Match price patterns: "15€", "15 euros", "€15", "15,50€"
  const priceMatch = priceInfo.match(/(\d+)[,.]?(\d{2})?\s*(?:€|eur|euros?)?/i);
  if (priceMatch) {
    const euros = parseInt(priceMatch[1]);
    const cents = priceMatch[2] ? parseInt(priceMatch[2]) : 0;
    return { priceCents: euros * 100 + cents, isFree: false, confidence: 0.85 };
  }

  return { priceCents: null, isFree: false, confidence: 0 };
}

// Generate content descriptions using AI
async function generateEventContent(
  extractedData: ExtractedEventData,
  rawOcrText: string
): Promise<GeneratedEventContent> {
  const title = extractedData.title.value || "Actividad infantil";
  const category = extractedData.category.value || "general";
  const ageRange = extractedData.ageMin.value && extractedData.ageMax.value
    ? `${extractedData.ageMin.value}-${extractedData.ageMax.value} años`
    : extractedData.ageMin.value
    ? `+${extractedData.ageMin.value} años`
    : "todas las edades";

  const contextInfo = `
Título: ${title}
Categoría: ${category}
Edades: ${ageRange}
Ubicación: ${extractedData.locationName.value || "No especificada"}
Texto del cartel: ${rawOcrText.slice(0, 500)}
  `.trim();

  try {
    const chatBody = {
      messages: [
        {
          content: `Eres un experto en redacción de descripciones para actividades infantiles.
Genera contenido atractivo y profesional para padres que buscan actividades para sus hijos.
El tono debe ser cercano pero profesional, destacando los beneficios educativos y la diversión.
Responde SOLO con un JSON válido sin markdown ni explicaciones adicionales.`,
          role: "system" as const,
        },
        {
          content: `Basándote en esta información de una actividad infantil, genera el contenido en formato JSON:

${contextInfo}

Genera un JSON con esta estructura exacta:
{
  "shortDescription": "Una frase de máximo 150 caracteres describiendo la actividad",
  "description": "2-4 párrafos describiendo la actividad, qué harán los niños, qué aprenderán, por qué es especial",
  "bulletHighlights": ["Punto 1 sobre qué aprenderán", "Punto 2 sobre qué incluye", "Punto 3 sobre para quién es ideal", "Punto 4 adicional si aplica"],
  "faqs": [
    {"question": "Pregunta típica 1", "answer": "Respuesta útil"},
    {"question": "Pregunta típica 2", "answer": "Respuesta útil"},
    {"question": "Pregunta típica 3", "answer": "Respuesta útil"}
  ],
  "cancellationPolicy": "Política de cancelación sugerida"
}`,
          role: "user" as const,
        },
      ],
      model: "gpt-4.1-mini",
      max_tokens: 1500,
      temperature: 0.7,
    };

    const result = await totalumSdk.openai.createChatCompletion(chatBody);
    const aiResponse = result.data?.choices?.[0]?.message?.content;

    if (aiResponse) {
      // Clean up response - remove markdown code blocks if present
      let cleanResponse = aiResponse.trim();
      if (cleanResponse.startsWith("```json")) {
        cleanResponse = cleanResponse.slice(7);
      }
      if (cleanResponse.startsWith("```")) {
        cleanResponse = cleanResponse.slice(3);
      }
      if (cleanResponse.endsWith("```")) {
        cleanResponse = cleanResponse.slice(0, -3);
      }

      const parsed = JSON.parse(cleanResponse.trim()) as GeneratedEventContent;
      console.log("[API] AI generated content successfully");
      return parsed;
    }
  } catch (err) {
    console.error("[API] Error generating content with AI:", err);
  }

  // Fallback content
  return {
    shortDescription: `${title} - Una experiencia única para niños de ${ageRange}`,
    description: `Descubre ${title}, una actividad diseñada especialmente para niños donde podrán aprender y divertirse al mismo tiempo.\n\nEn esta experiencia, los participantes explorarán nuevos conocimientos y desarrollarán habilidades mientras disfrutan de un ambiente seguro y estimulante.\n\nIdeal para niños curiosos que quieren aprender jugando.`,
    bulletHighlights: [
      "Aprendizaje activo y divertido",
      "Materiales incluidos",
      "Profesionales especializados",
      "Grupos reducidos para atención personalizada",
    ],
    faqs: [
      {
        question: "¿Qué deben traer los niños?",
        answer: "Recomendamos ropa cómoda que pueda mancharse. Los materiales están incluidos.",
      },
      {
        question: "¿Los padres pueden quedarse?",
        answer: "Dependiendo de la actividad, los padres pueden acompañar o hay una zona de espera disponible.",
      },
      {
        question: "¿Qué pasa si no podemos asistir?",
        answer: "Contacta con nosotros con antelación para gestionar cambios o cancelaciones.",
      },
    ],
    cancellationPolicy: "Cancelación gratuita hasta 48 horas antes del evento. Para cancelaciones posteriores, contacta con el organizador.",
  };
}

// POST - Analyze event poster with AI
export async function POST(req: Request) {
  const startTime = Date.now();

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const existingFileId = formData.get("fileId") as string | null;

    let fileNameId: string;

    if (file) {
      // Upload new file
      console.log("[API] POST /api/analyze-poster - Uploading file:", file.name, file.size);

      const uploadFormData = new FormData();
      uploadFormData.append("file", file, file.name);

      const uploadResult = await totalumSdk.files.uploadFile(uploadFormData);

      if (!uploadResult.data) {
        console.error("[API] File upload failed:", uploadResult.errors);
        return NextResponse.json(
          { ok: false, error: "Failed to upload file" },
          { status: 500 }
        );
      }

      fileNameId = uploadResult.data;
      console.log("[API] File uploaded successfully:", fileNameId);
    } else if (existingFileId) {
      fileNameId = existingFileId;
      console.log("[API] Using existing file:", fileNameId);
    } else {
      return NextResponse.json(
        { ok: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Scan document with AI
    console.log("[API] Starting AI scan of poster...");

    const scanResult = await totalumSdk.files.scanDocument(fileNameId, extractionSchema, {
      model: "scanum-eye-pro", // Best for images with colors and shapes
      scanDescription: "This is an event poster for a children's activity. Extract all relevant information including title, dates, times, location, price, age range, and any other details visible on the poster. The poster is in Spanish.",
    });

    const rawData = scanResult.data as Record<string, unknown>;
    console.log("[API] Raw scan data:", JSON.stringify(rawData, null, 2));

    // Parse extracted data into structured format
    const ageRange = parseAgeRange(rawData.age_range as string | null);
    const dateInfo = parseDateInfo(rawData.date_info as string | null);
    const timeInfo = parseTimeInfo(rawData.time_info as string | null);
    const priceInfo = parsePriceInfo(rawData.price_info as string | null);

    // Build extracted data with confidence scores
    const extractedData: ExtractedEventData = {
      title: {
        value: (rawData.title as string) || null,
        confidence: rawData.title ? 0.9 : 0,
        source: "ocr",
      },
      category: {
        value: (rawData.category as ExtractedEventData["category"]["value"]) || null,
        confidence: rawData.category ? 0.75 : 0,
        source: rawData.category ? "inference" : "inference",
      },
      format: {
        value: (rawData.format as "presencial" | "online") || "presencial",
        confidence: rawData.format ? 0.8 : 0.5,
        source: rawData.format ? "ocr" : "inference",
      },
      ageMin: {
        value: ageRange.min,
        confidence: ageRange.min !== null ? 0.85 : 0,
        source: "ocr",
      },
      ageMax: {
        value: ageRange.max,
        confidence: ageRange.max !== null ? 0.85 : 0,
        source: "ocr",
      },
      dateStart: {
        value: dateInfo.date,
        confidence: dateInfo.confidence,
        source: "ocr",
      },
      timeStart: {
        value: timeInfo.start,
        confidence: timeInfo.confidence,
        source: "ocr",
      },
      dateEnd: {
        value: dateInfo.date, // Same day by default
        confidence: dateInfo.confidence * 0.8,
        source: "inference",
      },
      timeEnd: {
        value: timeInfo.end,
        confidence: timeInfo.end ? timeInfo.confidence : 0,
        source: timeInfo.end ? "ocr" : "inference",
      },
      durationMinutes: emptyField<number>(),
      locationName: {
        value: (rawData.location_name as string) || null,
        confidence: rawData.location_name ? 0.85 : 0,
        source: "ocr",
      },
      address: {
        value: (rawData.address as string) || null,
        confidence: rawData.address ? 0.8 : 0,
        source: "ocr",
      },
      city: {
        value: (rawData.city as string) || null,
        confidence: rawData.city ? 0.85 : 0,
        source: "ocr",
      },
      price: {
        value: priceInfo.isFree
          ? "Gratis"
          : priceInfo.priceCents !== null
          ? `${(priceInfo.priceCents / 100).toFixed(2)}€`
          : null,
        confidence: priceInfo.confidence,
        source: "ocr",
      },
      capacity: {
        value: (rawData.capacity as number) || null,
        confidence: rawData.capacity ? 0.8 : 0,
        source: "ocr",
      },
      organizerName: {
        value: (rawData.organizer_name as string) || null,
        confidence: rawData.organizer_name ? 0.75 : 0,
        source: "ocr",
      },
      contactPhone: {
        value: (rawData.contact_phone as string) || null,
        confidence: rawData.contact_phone ? 0.9 : 0,
        source: "ocr",
      },
      contactEmail: {
        value: (rawData.contact_email as string) || null,
        confidence: rawData.contact_email ? 0.9 : 0,
        source: "ocr",
      },
      website: {
        value: (rawData.website as string) || null,
        confidence: rawData.website ? 0.9 : 0,
        source: "ocr",
      },
      materials: {
        value: (rawData.materials_needed as string[]) || null,
        confidence: rawData.materials_needed ? 0.75 : 0,
        source: "ocr",
      },
      requirements: {
        value: (rawData.requirements as string[]) || null,
        confidence: rawData.requirements ? 0.75 : 0,
        source: "ocr",
      },
      tags: emptyField<string[]>(),
      notes: {
        value: (rawData.additional_notes as string) || null,
        confidence: rawData.additional_notes ? 0.6 : 0,
        source: "ocr",
      },
    };

    // Calculate duration if we have start and end times
    if (timeInfo.start && timeInfo.end) {
      const [startH, startM] = timeInfo.start.split(":").map(Number);
      const [endH, endM] = timeInfo.end.split(":").map(Number);
      const durationMins = (endH * 60 + endM) - (startH * 60 + startM);
      if (durationMins > 0) {
        extractedData.durationMinutes = {
          value: durationMins,
          confidence: 0.85,
          source: "inference",
        };
      }
    }

    // Generate smart descriptions
    const rawOcrText = (rawData.event_description as string) || "";
    console.log("[API] Generating AI content...");
    const generatedContent = await generateEventContent(extractedData, rawOcrText);

    // Calculate average confidence
    const confidenceValues = Object.values(extractedData)
      .map((field) => (field as ExtractedField<unknown>).confidence)
      .filter((c) => c > 0);
    const avgConfidence =
      confidenceValues.length > 0
        ? confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length
        : 0;

    const result: PosterAnalysisResult = {
      extractedData,
      generatedContent,
      rawOcrText,
      processingMetadata: {
        processingTimeMs: Date.now() - startTime,
        modelUsed: "scanum-eye-pro",
        confidenceScore: Math.round(avgConfidence * 100) / 100,
      },
    };

    console.log("[API] Analysis complete. Processing time:", result.processingMetadata.processingTimeMs, "ms");
    console.log("[API] Average confidence:", result.processingMetadata.confidenceScore);

    return NextResponse.json({
      ok: true,
      data: result,
      fileId: fileNameId,
    });
  } catch (err) {
    console.error("[API ERROR] POST /api/analyze-poster", err);
    return NextResponse.json({ ok: false, error: serializeError(err) }, { status: 500 });
  }
}

