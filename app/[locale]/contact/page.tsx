"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, MapPin, Phone } from "lucide-react"
import { useTranslations } from "next-intl"

export default function ContactPage() {
  const t = useTranslations("contact")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-background">

      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            {t("title")}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <Card className="border shadow-sm">
              <CardContent className="flex items-start gap-4 p-6">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{t("email.label")}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t("email.value")}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardContent className="flex items-start gap-4 p-6">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{t("phone.label")}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t("phone.value")}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardContent className="flex items-start gap-4 p-6">
                <div className="rounded-lg bg-primary/10 p-2">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{t("address.label")}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("address.line1")}<br />
                    {t("address.line2")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle>{t("form.title")}</CardTitle>
              <CardDescription>
                {t("form.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="rounded-lg bg-primary/10 p-6 text-center">
                  <p className="font-semibold text-primary">{t("success.title")}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t("success.description")}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("form.name.label")}</Label>
                    <Input id="name" placeholder={t("form.name.placeholder")} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("form.email.label")}</Label>
                    <Input id="email" type="email" placeholder={t("form.email.placeholder")} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">{t("form.message.label")}</Label>
                    <Textarea
                      id="message"
                      placeholder={t("form.message.placeholder")}
                      rows={4}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t("form.submitting") : t("form.submit")}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
