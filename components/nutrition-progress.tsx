"use client"

import { Card, CardContent } from "@/components/ui/card"

interface NutrientProgressProps {
  label: string
  current: number
  target: number
  unit: string
  color: string
}

function NutrientProgress({ label, current, target, unit, color }: NutrientProgressProps) {
  const percentage = Math.min((current / target) * 100, 100)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-foreground">{label}</span>
        <span className="text-sm">
          <span className={color}>{current}</span>
          <span className="text-muted-foreground"> / {target} {unit}</span>
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color.replace("text-", "bg-")}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

interface NutritionProgressProps {
  calories: { current: number; target: number }
  carbs: { current: number; target: number }
  protein: { current: number; target: number }
  fats: { current: number; target: number }
}

export function NutritionProgress({
  calories,
  carbs,
  protein,
  fats,
}: NutritionProgressProps) {
  return (
    <Card className="border shadow-sm">
      <CardContent className="space-y-6 p-6">
        <NutrientProgress
          label="Total Calories"
          current={calories.current}
          target={calories.target}
          unit="kcal"
          color="text-chart-1"
        />
        <NutrientProgress
          label="Carbs"
          current={carbs.current}
          target={carbs.target}
          unit="g"
          color="text-chart-2"
        />
        <NutrientProgress
          label="Protein"
          current={protein.current}
          target={protein.target}
          unit="g"
          color="text-chart-3"
        />
        <NutrientProgress
          label="Fats"
          current={fats.current}
          target={fats.target}
          unit="g"
          color="text-chart-4"
        />
      </CardContent>
    </Card>
  )
}
