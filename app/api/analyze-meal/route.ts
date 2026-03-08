import { NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"

// 1MB
const MAX_IMAGE_SIZE = 1_000_000

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function POST(req: Request) {
  try {
    const { image, locale } = await req.json()

    if (!image) {
      return NextResponse.json(
          { error: "Image is required" },
          { status: 400 }
      )
    }

    // 1️⃣ 防止 Base64 过大
    const size = Buffer.byteLength(image, "utf8")

    if (size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
          { error: "Image too large. Please compress below 1MB." },
          { status: 413 }
      )
    }

    // 从 data URL 中提取 mimeType 和 base64 数据
    // 格式: data:<mimeType>;base64,<data>
    const dataUrlMatch = image.match(/^data:([^;]+);base64,(.+)$/)
    const mimeType = dataUrlMatch ? dataUrlMatch[1] : "image/jpeg"
    const base64Data = dataUrlMatch ? dataUrlMatch[2] : image

    // 2️⃣ 调用 Gemini
    const dishLanguageInstruction =
      locale === "zh"
        ? 'The "dish" field MUST be written in Simplified Chinese (简体中文).'
        : 'The "dish" field MUST be written in English.'

    const geminiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
            {
              text: `You are a nutrition analysis assistant.

              Analyze the food image carefully.
              
              1. Identify all visible food items in the image.
              2. Estimate each item's portion size.
              3. Estimate calories, protein, carbs, and fat for the entire meal.
              
              If multiple foods are present:
              - combine the food names into a single dish name using "&".
              - Example: "fried rice & fries", "steak & mashed potatoes".
              
              ${dishLanguageInstruction}
              
              Return ONLY valid JSON (no markdown, no explanation).
              
              {
                "dish": "string",
                "nutrition": {
                  "calories": number,
                  "protein_g": number,
                  "carbs_g": number,
                  "fat_g": number
                }
              }`
            },
          ],
        },
      ],
    })

    let content = geminiResponse.text

    if (!content) {
      throw new Error("AI returned empty response")
    }

    // 强制 JSON 解析（防 hallucination）
    let parsed

    try {
      parsed = JSON.parse(content)
    } catch {
      // 尝试提取 JSON
      const match = content.match(/\{[\s\S]*\}/)

      if (!match) {
        throw new Error("Invalid JSON from AI")
      }

      parsed = JSON.parse(match[0])
    }

    // 统一转换为前端 FoodItem[] 格式
    const foods = [
      {
        name: parsed.dish ?? "Unknown dish",
        calories: parsed.nutrition?.calories ?? 0,
        carbs: parsed.nutrition?.carbs_g ?? 0,
        protein: parsed.nutrition?.protein_g ?? 0,
        fats: parsed.nutrition?.fat_g ?? 0,
        quantity: "1 serving",
      },
    ]

    return NextResponse.json({ foods })
  } catch (error) {
    console.error("AI analyze error:", error)

    return NextResponse.json(
        { error: "AI analysis failed" },
        { status: 500 }
    )
  }
}