import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
    const supabase = await createClient()

    try {
        const body = await req.json()

        const {
            daily_calories,
            carbs_target_g,
            protein_target_g,
            fat_target_g
        } = body

        // 获取当前用户
        const {
            data: { user },
            error: userError
        } = await supabase.auth.getUser()

        if (userError || !user) {
            return Response.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }


        // upsert 用户 nutrition target
        const { data, error } = await supabase
            .from("nutrition_targets")
            .upsert(
                {
                    user_id: user.id,
                    daily_calories,
                    carbs_target_g,
                    protein_target_g,
                    fat_target_g
                },
                {
                    onConflict: "user_id"
                }
            )
            .select()
            .single()

        if (error) {
            return Response.json(
                { error: error.message },
                { status: 500 }
            )
        }

        return Response.json(data)

    } catch (err) {
        return Response.json(
            { error: "Invalid request body" },
            { status: 400 }
        )
    }
}


export async function GET() {
    const supabase = await createClient()

    const {
        data: { user },
        error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
        return Response.json(
            { error: "Unauthorized" },
            { status: 401 }
        )
    }

    const { data, error } = await supabase
        .from("nutrition_targets")
        .select("*")
        .eq("user_id", user.id)
        .single()

    if (error) {
        return Response.json(
            { error: error.message },
            { status: 500 }
        )
    }

    return Response.json(data)
}