'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useTranslations } from 'next-intl'
import { CaloriesFirstPanel } from '@/components/calories-first-panel'
import { MacrosFirstPanel } from '@/components/macros-first-panel'

export default function GoalsPage() {
  const t = useTranslations('goals')
  const [isMacrosFirst, setIsMacrosFirst] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const [dailyCalories, setDailyCalories] = useState(2000)
  const [carbsPercent, setCarbsPercent] = useState(50)
  const [proteinPercent, setProteinPercent] = useState(25)

  const [carbsGrams, setCarbsGrams] = useState(200)
  const [proteinGrams, setProteinGrams] = useState(150)
  const [fatsGrams, setFatsGrams] = useState(60)



  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch('/api/nutrition-target')

        if (!res.ok) return

        const data = await res.json()

        if (!data) return

        const cal = data.daily_calories ?? 2000
        const cg  = data.carbs_target_g ?? 200
        const pg  = data.protein_target_g ?? 150
        const fg  = data.fat_target_g ?? 60

        setDailyCalories(cal)
        setCarbsGrams(cg)
        setProteinGrams(pg)
        setFatsGrams(fg)

        const cCal = cg * 4
        const pCal = pg * 4
        const fCal = fg * 9

        const total = cCal + pCal + fCal

        if (total > 0) {
          const cp = Math.round((cCal / total) * 100)
          const pp = Math.round((pCal / total) * 100)

          setCarbsPercent(cp)
          setProteinPercent(Math.min(pp, 100 - cp))
        }

      } catch (err) {
        console.error("Failed to load nutrition target", err)
      }
    }

    init()
  }, [])


  const handleCarbsPercentChange = (val: number[]) => {
    const v = val[0]
    setCarbsPercent(v)
    if (v + proteinPercent > 100) setProteinPercent(100 - v)
  }

  const handleProteinPercentChange = (val: number[]) => {
    const v = val[0]
    setProteinPercent(v)
    if (carbsPercent + v > 100) setCarbsPercent(100 - v)
  }

  const handleSave = async () => {
    setSaveStatus('idle')
    setIsSaving(true)
    try {
      const fatsPercent  = Math.max(0, 100 - carbsPercent - proteinPercent)
      const calcCarbs    = Math.round((dailyCalories * carbsPercent)   / 100 / 4)
      const calcProtein  = Math.round((dailyCalories * proteinPercent) / 100 / 4)
      const calcFats     = Math.round((dailyCalories * fatsPercent)    / 100 / 9)
      const calcCalories = Math.round(carbsGrams * 4 + proteinGrams * 4 + fatsGrams * 9)

      const body = isMacrosFirst
        ? { daily_calories: calcCalories, carbs_target_g: carbsGrams, protein_target_g: proteinGrams, fat_target_g: fatsGrams }
        : { daily_calories: dailyCalories, carbs_target_g: calcCarbs, protein_target_g: calcProtein, fat_target_g: calcFats }

      const res = await fetch('/api/nutrition-target', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        console.error('Failed to save nutrition target:', errData ?? res.statusText)
        setSaveStatus('error')
      } else {
        setSaveStatus('success')
      }
    } catch (err) {
      console.error('Unexpected error saving nutrition target:', err)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">

      <main className="container mx-auto px-6 py-8">

        {/* ── Top bar: title + mode switch ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('title')}</h1>
            <p className="mt-1 text-muted-foreground">{t('subtitle')}</p>
          </div>

          <Card className="sm:w-auto w-full shrink-0">
            <CardContent className="py-3 px-5">
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium transition-colors whitespace-nowrap ${!isMacrosFirst ? 'text-primary' : 'text-muted-foreground'}`}>
                  {t('caloriesFirst')}
                </span>
                <Switch checked={isMacrosFirst} onCheckedChange={setIsMacrosFirst} />
                <span className={`text-sm font-medium transition-colors whitespace-nowrap ${isMacrosFirst ? 'text-primary' : 'text-muted-foreground'}`}>
                  {t('macrosFirst')}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 text-center">
                {isMacrosFirst ? t('macrosFirstDesc') : t('caloriesFirstDesc')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ══ Mode A — Calories-First ══ */}
        {!isMacrosFirst && (
          <CaloriesFirstPanel
            dailyCalories={dailyCalories}
            setDailyCalories={setDailyCalories}
            carbsPercent={carbsPercent}
            proteinPercent={proteinPercent}
            onCarbsChange={handleCarbsPercentChange}
            onProteinChange={handleProteinPercentChange}
          />
        )}

        {/* ══ Mode B — Macros-First ══ */}
        {isMacrosFirst && (
          <MacrosFirstPanel
            carbsGrams={carbsGrams}
            proteinGrams={proteinGrams}
            fatsGrams={fatsGrams}
            setCarbsGrams={setCarbsGrams}
            setProteinGrams={setProteinGrams}
            setFatsGrams={setFatsGrams}
          />
        )}

        {/* ── Save ── */}
        <div className="mt-1 flex flex-col items-end gap-2">
          {saveStatus === 'success' && (
            <p className="text-sm text-green-600 dark:text-green-400">{t('saveSuccess')}</p>
          )}
          {saveStatus === 'error' && (
            <p className="text-sm text-red-500">{t('saveError')}</p>
          )}
          <Button onClick={handleSave} disabled={isSaving} size="lg" className="px-12">
            {isSaving ? t('saving') : t('save')}
          </Button>
        </div>

      </main>
    </div>
  )
}

