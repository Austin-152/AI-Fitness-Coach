"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"

export interface FoodItem {
  name: string
  calories: number
  carbs: number
  protein: number
  fats: number
  quantity: string
}

interface AnalysisResultProps {
  foods: FoodItem[]
  onConfirm: () => void
  onCancel: () => void
  imageUrl?: string
}

export function AnalysisResult({ foods, onConfirm, onCancel, imageUrl }: AnalysisResultProps) {
  const totals = foods.reduce(
    (acc, food) => ({
      calories: acc.calories + food.calories,
      carbs: acc.carbs + food.carbs,
      protein: acc.protein + food.protein,
      fats: acc.fats + food.fats,
    }),
    { calories: 0, carbs: 0, protein: 0, fats: 0 }
  )

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground">Analysis Result</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Analyzed meal"
            className="mx-auto max-h-[150px] rounded-lg object-contain"
          />
        )}
        
        <div className="space-y-3">
          {foods.map((food, index) => (
            <div
              key={index}
              className="rounded-lg bg-muted/50 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">{food.name}</span>
                <span className="text-sm text-muted-foreground">{food.quantity}</span>
              </div>
              <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
                <div className="text-center">
                  <span className="block text-chart-1 font-semibold">{food.calories}</span>
                  <span className="text-muted-foreground">kcal</span>
                </div>
                <div className="text-center">
                  <span className="block text-chart-2 font-semibold">{food.carbs}g</span>
                  <span className="text-muted-foreground">Carbs</span>
                </div>
                <div className="text-center">
                  <span className="block text-chart-3 font-semibold">{food.protein}g</span>
                  <span className="text-muted-foreground">Protein</span>
                </div>
                <div className="text-center">
                  <span className="block text-chart-4 font-semibold">{food.fats}g</span>
                  <span className="text-muted-foreground">Fats</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg bg-primary/10 p-3">
          <div className="text-sm font-semibold text-foreground">Total</div>
          <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
            <div className="text-center">
              <span className="block text-chart-1 font-bold">{totals.calories}</span>
              <span className="text-muted-foreground">kcal</span>
            </div>
            <div className="text-center">
              <span className="block text-chart-2 font-bold">{totals.carbs}g</span>
              <span className="text-muted-foreground">Carbs</span>
            </div>
            <div className="text-center">
              <span className="block text-chart-3 font-bold">{totals.protein}g</span>
              <span className="text-muted-foreground">Protein</span>
            </div>
            <div className="text-center">
              <span className="block text-chart-4 font-bold">{totals.fats}g</span>
              <span className="text-muted-foreground">Fats</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Check className="mr-2 h-4 w-4" />
            Add to Log
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
