"use client"

import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Brain, Camera, TrendingUp, Utensils } from "lucide-react"
import { useTranslations } from "next-intl"

const featureIcons = [Camera, Brain, TrendingUp, Utensils]
const featureKeys = ["photoRecognition", "aiAnalysis", "progressTracking", "personalizedInsights"] as const

export default function AboutPage() {
  const t = useTranslations("about")

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            {t("title")}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
          {featureKeys.map((key, i) => {
            const Icon = featureIcons[i]
            return (
              <Card key={key} className="border shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{t(`features.${key}.title`)}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{t(`features.${key}.description`)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mx-auto mt-12 max-w-3xl">
          <Card className="border shadow-sm">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-foreground">{t("mission.title")}</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {t("mission.paragraph1")}
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {t("mission.paragraph2")}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
