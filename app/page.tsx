"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { NutritionProgress } from "@/components/nutrition-progress"
import { MealUpload } from "@/components/meal-upload"
import { AnalysisResult, FoodItem } from "@/components/analysis-result"
import { createClient } from "@/lib/supabase/client"

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<FoodItem[] | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [nutrition, setNutrition] = useState({
    calories: { current: 1850, target: 2200 },
    carbs: { current: 180, target: 250 },
    protein: { current: 90, target: 120 },
    fats: { current: 50, target: 70 },
  })

  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setUser({ email: user.email })
        await loadTodayNutrition(user.id)
      }
    }
    getUser()
  }, [])

  const loadTodayNutrition = async (userId: string) => {
    const today = new Date().toISOString().split("T")[0]
    const { data: meals } = await supabase
      .from("meals")
      .select("*, foods(*)")
      .eq("user_id", userId)
      .gte("created_at", `${today}T00:00:00`)
      .lte("created_at", `${today}T23:59:59`)

    if (meals && meals.length > 0) {
      let totalCalories = 0
      let totalCarbs = 0
      let totalProtein = 0
      let totalFats = 0

      meals.forEach((meal) => {
        meal.foods?.forEach((food: { calories: number; carbs: number; protein: number; fats: number }) => {
          totalCalories += food.calories || 0
          totalCarbs += food.carbs || 0
          totalProtein += food.protein || 0
          totalFats += food.fats || 0
        })
      })

      setNutrition({
        calories: { current: totalCalories, target: 2200 },
        carbs: { current: totalCarbs, target: 250 },
        protein: { current: totalProtein, target: 120 },
        fats: { current: totalFats, target: 70 },
      })
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.refresh()
  }

  const handleUpload = async (file: File) => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    setIsAnalyzing(true)
    
    try {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setUploadedImageUrl(previewUrl)

      // Convert file to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })

      // Call AI analysis API
      const response = await fetch("/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const data = await response.json()
      setAnalysisResult(data.foods)
    } catch (error) {
      console.error("Error analyzing meal:", error)
      alert("Failed to analyze the meal. Please try again.")
      setUploadedImageUrl(null)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleConfirmAnalysis = async () => {
    if (!analysisResult || !user) return

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      // Upload image to Supabase Storage
      let imageUrl = null
      if (uploadedImageUrl) {
        const response = await fetch(uploadedImageUrl)
        const blob = await response.blob()
        const fileName = `${authUser.id}/${Date.now()}.jpg`
        
        const { data: uploadData } = await supabase.storage
          .from("meal-images")
          .upload(fileName, blob)
        
        if (uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from("meal-images")
            .getPublicUrl(fileName)
          imageUrl = publicUrl
        }
      }

      // Create meal record
      const { data: meal, error: mealError } = await supabase
        .from("meals")
        .insert({
          user_id: authUser.id,
          image_url: imageUrl,
          meal_type: "snack",
        })
        .select()
        .single()

      if (mealError) throw mealError

      // Insert food items
      const foodsToInsert = analysisResult.map((food) => ({
        meal_id: meal.id,
        name: food.name,
        calories: food.calories,
        carbs: food.carbs,
        protein: food.protein,
        fats: food.fats,
        quantity: food.quantity,
      }))

      const { error: foodsError } = await supabase
        .from("foods")
        .insert(foodsToInsert)

      if (foodsError) throw foodsError

      // Update local nutrition state
      const totals = analysisResult.reduce(
        (acc, food) => ({
          calories: acc.calories + food.calories,
          carbs: acc.carbs + food.carbs,
          protein: acc.protein + food.protein,
          fats: acc.fats + food.fats,
        }),
        { calories: 0, carbs: 0, protein: 0, fats: 0 }
      )

      setNutrition((prev) => ({
        calories: { ...prev.calories, current: prev.calories.current + totals.calories },
        carbs: { ...prev.carbs, current: prev.carbs.current + totals.carbs },
        protein: { ...prev.protein, current: prev.protein.current + totals.protein },
        fats: { ...prev.fats, current: prev.fats.current + totals.fats },
      }))

      // Clear analysis result
      setAnalysisResult(null)
      setUploadedImageUrl(null)
    } catch (error) {
      console.error("Error saving meal:", error)
      alert("Failed to save the meal. Please try again.")
    }
  }

  const handleCancelAnalysis = () => {
    setAnalysisResult(null)
    setUploadedImageUrl(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onSignOut={handleSignOut} />
      
      <main className="relative">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-background/40 via-background/80 to-background" />
        
        <div className="container relative mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground text-balance">
              Track Your Nutrition with AI Power
            </h1>
            <p className="mt-2 text-muted-foreground">
              Monitor your daily intake and get personalized insights for a healthier lifestyle.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <NutritionProgress {...nutrition} />
            
            {analysisResult ? (
              <AnalysisResult
                foods={analysisResult}
                onConfirm={handleConfirmAnalysis}
                onCancel={handleCancelAnalysis}
                imageUrl={uploadedImageUrl || undefined}
              />
            ) : (
              <MealUpload onUpload={handleUpload} isAnalyzing={isAnalyzing} />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
