"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { NutritionProgress } from "@/components/nutrition-progress"
import { MealUpload } from "@/components/meal-upload"
import { AnalysisResult, FoodItem } from "@/components/analysis-result"
import { createClient } from "@/lib/supabase/client"
import { useTranslations, useLocale } from "next-intl"

export default function HomePage() {
  //i18n setting
  const t = useTranslations("home")
  const locale = useLocale()
  const router = useRouter()
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<FoodItem[] | null>(null)
  const [currentIntake, setCurrentIntake] = useState({
    calories: 0,
    carbs: 0,
    protein: 0,
    fats: 0,
  })
  const [targets, setTargets] = useState({
    calories: 0,
    carbs: 0,
    protein: 0,
    fats: 0,
  })
  const [isLoadingTargets, setIsLoadingTargets] = useState(true)

  const supabase = createClient()

  // Fetch nutrition targets independently so only the target numbers update
  useEffect(() => {
    const fetchTargets = async () => {
      try {
        const res = await fetch("/api/nutrition-target")
        if (res.ok) {
          const data = await res.json()
          setTargets({
            calories: data.daily_calories ?? 0,
            carbs: data.carbs_target_g ?? 0,
            protein: data.protein_target_g ?? 0,
            fats: data.fat_target_g ?? 0,
          })
        }
      } catch (e) {
        console.error("Failed to fetch nutrition targets:", e)
      } finally {
        setIsLoadingTargets(false)
      }
    }
    fetchTargets()
  }, [])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setUser({ email: user.email })
        await loadTodayNutrition()
      }
    }
    getUser()
  }, [])

  const loadTodayNutrition = async () => {
    try {
      const res = await fetch("/api/get-today-nutrition")
      if (res.ok) {
        const data = await res.json()
        setCurrentIntake({
          calories: data.calories ?? 0,
          carbs: data.carbs ?? 0,
          protein: data.protein ?? 0,
          fats: data.fats ?? 0,
        })
      }
    } catch (e) {
      console.error("Failed to fetch today's nutrition:", e)
    }
  }


  const handleUpload = async (file: File) => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    setIsAnalyzing(true)
    
    try {
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
        body: JSON.stringify({ image: base64, locale }),
      })

      if (!response.ok) {
        console.error("Analysis failed:", response.status, response.statusText)
        alert(t("analysisFailed"))
        return
      }

      const data = await response.json()
      setAnalysisResult(data.foods)
    } catch (error) {
      console.error("Error analyzing meal:", error)
      alert("Failed to analyze the meal. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleConfirmAnalysis = async () => {
    if (!analysisResult || !user) return

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return


      // Aggregate all food items into totals
      const totals = analysisResult.reduce(
        (acc, food) => ({
          calories: acc.calories + food.calories,
          carbs: acc.carbs + food.carbs,
          protein: acc.protein + food.protein,
          fats: acc.fats + food.fats,
        }),
        { calories: 0, carbs: 0, protein: 0, fats: 0 }
      )

      // Insert into meal_entries (one record per meal)
      const { error: mealError } = await supabase
        .from("meal_entries")
        .insert({
          user_id: authUser.id,
          meal_name: analysisResult[0]?.name ?? "Meal",
          calories: totals.calories,
          carbs_g: totals.carbs,
          protein_g: totals.protein,
          fat_g: totals.fats,
        })

      if (mealError) {
        console.error("Error saving meal:", mealError)
        alert(t("saveFailed"))
        return
      }

      // Update local nutrition state
      setCurrentIntake((prev) => ({
        calories: prev.calories + totals.calories,
        carbs: prev.carbs + totals.carbs,
        protein: prev.protein + totals.protein,
        fats: prev.fats + totals.fats,
      }))

      // Clear analysis result
      setAnalysisResult(null)
    } catch (error) {
      console.error("Error saving meal:", error)
      alert("Failed to save the meal. Please try again.")
    }
  }

  const handleCancelAnalysis = () => {
    setAnalysisResult(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="relative">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        />
        <div className="absolute inset-0 bg-linear-to-l from-background/40 via-background/80 to-background" />
        
        <div className="container relative mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground text-balance">
              {t("title")}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <NutritionProgress
              calories={{ current: currentIntake.calories, target: targets.calories }}
              carbs={{ current: currentIntake.carbs, target: targets.carbs }}
              protein={{ current: currentIntake.protein, target: targets.protein }}
              fats={{ current: currentIntake.fats, target: targets.fats }}
              isLoadingTargets={isLoadingTargets}
            />
            
            {analysisResult ? (
              <AnalysisResult
                foods={analysisResult}
                onConfirm={handleConfirmAnalysis}
                onCancel={handleCancelAnalysis}
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
