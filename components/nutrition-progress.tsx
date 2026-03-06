"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface NutrientProgressProps {
  label: string
  current: number
  target: number
  unit: string
  textColorClass: string
  indicatorColorClass: string
}

function NutrientProgress({
  label,
  current,
  target,
  unit,
  textColorClass,
  indicatorColorClass,
}: NutrientProgressProps) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-foreground">{label}</span>
        <span className="text-sm">
          <span className={textColorClass}>{current}</span>
          <span className="text-muted-foreground"> / {target} {unit}</span>
        </span>
      </div>
      <Progress
        value={percentage}
        className="h-2.5 bg-muted"
        indicatorClassName={indicatorColorClass}
      />
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
  const t = useTranslations("nutrition")

  return (
    <Card className="border shadow-sm">
      <CardContent className="space-y-6 p-6">
        <NutrientProgress
          label={t("totalCalories")}
          current={calories.current}
          target={calories.target}
          unit={t("kcal")}
          textColorClass="text-chart-1"
          indicatorColorClass="bg-chart-1"
        />
        <NutrientProgress
          label={t("carbs")}
          current={carbs.current}
          target={carbs.target}
          unit={t("g")}
          textColorClass="text-chart-2"
          indicatorColorClass="bg-chart-2"
        />
        <NutrientProgress
          label={t("protein")}
          current={protein.current}
          target={protein.target}
          unit={t("g")}
          textColorClass="text-chart-3"
          indicatorColorClass="bg-chart-3"
        />
        <NutrientProgress
          label={t("fats")}
          current={fats.current}
          target={fats.target}
          unit={t("g")}
          textColorClass="text-chart-4"
          indicatorColorClass="bg-chart-4"
        />
      </CardContent>
    </Card>
  )
}
