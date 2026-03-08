import { createClient } from "@/lib/supabase/server"

export async function GET() {
    const supabase = await createClient()

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const today = new Date().toISOString().split("T")[0]

    const { data: meals, error } = await supabase
        .from("meal_entries")
        .select("calories, carbs_g, protein_g, fat_g")
        .eq("user_id", user.id)
        .gte("created_at", `${today}T00:00:00`)
        .lte("created_at", `${today}T23:59:59`)

    if (error) {
        return Response.json({ error: error.message }, { status: 500 })
    }

    const totals = (meals ?? []).reduce(
        (acc, meal) => ({
            calories: acc.calories + (meal.calories ?? 0),
            carbs: acc.carbs + (meal.carbs_g ?? 0),
            protein: acc.protein + (meal.protein_g ?? 0),
            fats: acc.fats + (meal.fat_g ?? 0),
        }),
        { calories: 0, carbs: 0, protein: 0, fats: 0 }
    )

    return Response.json(totals)
}

