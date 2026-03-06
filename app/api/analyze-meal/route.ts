import { generateObject } from "ai"
import { gateway } from "@ai-sdk/gateway"
import { z } from "zod"

const FoodSchema = z.object({
  name: z.string().describe("Name of the food item"),
  calories: z.number().describe("Estimated calories in kcal"),
  carbs: z.number().describe("Estimated carbohydrates in grams"),
  protein: z.number().describe("Estimated protein in grams"),
  fats: z.number().describe("Estimated fats in grams"),
  quantity: z.string().describe("Estimated quantity/portion size"),
})

const AnalysisSchema = z.object({
  foods: z.array(FoodSchema).describe("List of identified food items with nutritional information"),
})

export async function POST(request: Request) {
  try {
    const { image } = await request.json()

    if (!image) {
      return Response.json({ error: "No image provided" }, { status: 400 })
    }

    const { object } = await generateObject({
      model: gateway("openai/gpt-4o-mini"),
      schema: AnalysisSchema,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this meal photo and identify all food items visible. For each food item, estimate:
              1. Name of the food
              2. Calories (in kcal)
              3. Carbohydrates (in grams)
              4. Protein (in grams)
              5. Fats (in grams)
              6. Quantity/portion size

              Be as accurate as possible with your nutritional estimates based on typical serving sizes.
              If you cannot identify certain foods, make your best reasonable estimate.`,
            },
            {
              type: "image",
              image: image,
            },
          ],
        },
      ],
    })

    return Response.json(object)
  } catch (error) {
    console.error("Error analyzing meal:", error)
    return Response.json(
      { error: "Failed to analyze meal" },
      { status: 500 }
    )
  }
}
