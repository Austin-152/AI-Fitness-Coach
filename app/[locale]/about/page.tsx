"use client"

import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Brain, Camera, TrendingUp, Utensils } from "lucide-react"

const features = [
  {
    icon: Camera,
    title: "Photo Recognition",
    description: "Simply snap a photo of your meal and our AI will identify all the foods automatically.",
  },
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Advanced machine learning algorithms estimate calories and macronutrients with high accuracy.",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Monitor your daily, weekly, and monthly nutrition trends to stay on track with your goals.",
  },
  {
    icon: Utensils,
    title: "Personalized Insights",
    description: "Get customized recommendations based on your dietary preferences and fitness objectives.",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            About AI Fitness Coach
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Your intelligent companion for nutrition tracking and healthier eating habits.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <Card key={feature.title} className="border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-3xl">
          <Card className="border shadow-sm">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-foreground">Our Mission</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                At AI Fitness Coach, we believe that tracking your nutrition should be effortless.
                Our mission is to leverage cutting-edge AI technology to help you understand what
                you eat, make informed dietary choices, and achieve your health and fitness goals
                without the hassle of manual food logging.
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Whether you are trying to lose weight, build muscle, or simply maintain a balanced
                diet, our intelligent system adapts to your needs and provides personalized guidance
                every step of the way.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
