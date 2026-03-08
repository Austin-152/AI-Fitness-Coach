import { NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"

// 最大允许的原始图片字节（建议 5MB，演示项目可以调小到 1MB）
const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5MB

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function POST(req: Request) {
  try {
    const { image, locale } = await req.json()

    if (!image) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 })
    }

    // 从 data URL 中提取 mimeType 和 base64 数据
    // 支持两种情况：data:<mime>;base64,<data> 或 直接 base64 字符串
    const dataUrlMatch = String(image).match(/^data:([^;]+);base64,(.+)$/)
    const mimeType = dataUrlMatch ? dataUrlMatch[1] : "image/jpeg"
    let base64Data = dataUrlMatch ? dataUrlMatch[2] : String(image)

    // 去掉可能的换行/空白
    base64Data = base64Data.replace(/\s/g, "")

    // MIME 校验（防止 .exe/.zip 等伪装）
    if (!mimeType.startsWith("image/")) {
      return NextResponse.json(
          { error: "Unsupported media type" },
          { status: 415 }
      )
    }

    // 可选：严格限制只允许常见图片类型
    const allowed = /^(image\/jpeg|image\/png|image\/webp)$/
    if (!allowed.test(mimeType)) {
      return NextResponse.json(
          { error: "Only jpeg/png/webp are allowed" },
          { status: 415 }
      )
    }

    // 用 Base64 长度计算解码后字节数（无需解码到 Buffer，内存友好）
    // 公式：decodedBytes = (3 * (base64Len / 4)) - padding
    const base64Len = base64Data.length
    let padding = 0
    if (base64Data.endsWith("==")) padding = 2
    else if (base64Data.endsWith("=")) padding = 1

    const decodedBytes = Math.floor((3 * (base64Len / 4))) - padding

    if (decodedBytes > MAX_IMAGE_BYTES) {
      return NextResponse.json(
          { error: `Image too large. Please provide an image under ${Math.round(MAX_IMAGE_BYTES / (1024 * 1024))}MB.` },
          { status: 413 }
      )
    }

    // （可选替代）如果你愿意并且文件不大，也可以解码后检查实际 Buffer 长度：
    // const decodedBufferLength = Buffer.from(base64Data, "base64").length
    // if (decodedBufferLength > MAX_IMAGE_BYTES) { ... }

    // 调用 Gemini（保持你原有的 prompt 逻辑）
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
      return NextResponse.json({ error: "AI returned empty response" }, { status: 500 })
    }

    // 强制 JSON 解析（防 hallucination）
    let parsed
    try {
      parsed = JSON.parse(content)
    } catch {
      // 尝试提取 JSON
      const match = content.match(/\{[\s\S]*}/)
      if (!match) {
        return NextResponse.json({ error: "Invalid JSON from AI" }, { status: 500 })
      }
      parsed = JSON.parse(match[0])
    }

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
    return NextResponse.json({ error: "AI analysis failed" }, { status: 500 })
  }
}