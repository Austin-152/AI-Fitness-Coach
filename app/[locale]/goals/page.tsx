'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'

export default function GoalsPage() {
  const t = useTranslations('goals')
  const router = useRouter()
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [isMacrosFirst, setIsMacrosFirst] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const [dailyCalories, setDailyCalories] = useState(2000)
  const [carbsPercent, setCarbsPercent] = useState(50)
  const [proteinPercent, setProteinPercent] = useState(25)

  const [carbsGrams, setCarbsGrams] = useState(200)
  const [proteinGrams, setProteinGrams] = useState(150)
  const [fatsGrams, setFatsGrams] = useState(60)

  const supabase = createClient()

  const fatsPercent = Math.max(0, 100 - carbsPercent - proteinPercent)
  const calcCarbs   = Math.round((dailyCalories * carbsPercent)   / 100 / 4)
  const calcProtein = Math.round((dailyCalories * proteinPercent) / 100 / 4)
  const calcFats    = Math.round((dailyCalories * fatsPercent)    / 100 / 9)
  const calcCalories = Math.round(carbsGrams * 4 + proteinGrams * 4 + fatsGrams * 9)

  useEffect(() => {
    const init = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser?.email) return
      setUser({ email: authUser.email })

      const { data: profile } = await supabase
        .from('profiles')
        .select('daily_calorie_target, daily_carbs_target, daily_protein_target, daily_fats_target')
        .eq('id', authUser.id)
        .single()

      if (profile) {
        const cal = profile.daily_calorie_target ?? 2000
        const cg  = profile.daily_carbs_target   ?? 200
        const pg  = profile.daily_protein_target  ?? 150
        const fg  = profile.daily_fats_target     ?? 60

        setDailyCalories(cal)
        setCarbsGrams(cg)
        setProteinGrams(pg)
        setFatsGrams(fg)

        const cCal = cg * 4, pCal = pg * 4, fCal = fg * 9
        const total = cCal + pCal + fCal
        if (total > 0) {
          const cp = Math.round((cCal / total) * 100)
          const pp = Math.round((pCal / total) * 100)
          setCarbsPercent(cp)
          setProteinPercent(Math.min(pp, 100 - cp))
        }
      }
    }
    init()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.refresh()
  }

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
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) { setSaveStatus('error'); return }

      const payload = isMacrosFirst
        ? { id: authUser.id, daily_calorie_target: calcCalories, daily_carbs_target: carbsGrams, daily_protein_target: proteinGrams, daily_fats_target: fatsGrams }
        : { id: authUser.id, daily_calorie_target: dailyCalories, daily_carbs_target: calcCarbs, daily_protein_target: calcProtein, daily_fats_target: calcFats }

      const { error } = await supabase.from('profiles').upsert(payload)
      setSaveStatus(error ? 'error' : 'success')
    } catch {
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onSignOut={handleSignOut} />

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

        {/* ══════════════════════════════════════════════════════════
            Mode A — Calories-First  (2-col grid)
            ══════════════════════════════════════════════════════════ */}
        {!isMacrosFirst && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

            {/* LEFT: inputs */}
            <div className="space-y-6">
              {/* Calorie input */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>{t('dailyCalories')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-3">
                    <Input
                      type="number"
                      value={dailyCalories}
                      onChange={(e) => setDailyCalories(Math.max(0, Number(e.target.value)))}
                      min={0} max={10000}
                      className="w-40 text-3xl font-bold h-14 text-center"
                    />
                    <span className="text-muted-foreground">{t('caloriesUnit')}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Sliders */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>{t('macroDistribution')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-7">
                  {/* Carbs */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
                        {t('carbs')}
                      </Label>
                      <span className="text-lg font-bold tabular-nums">{carbsPercent}%</span>
                    </div>
                    <Slider value={[carbsPercent]} onValueChange={handleCarbsPercentChange} min={0} max={100} step={1} />
                  </div>

                  {/* Protein */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                        {t('protein')}
                      </Label>
                      <span className="text-lg font-bold tabular-nums">{proteinPercent}%</span>
                    </div>
                    <Slider value={[proteinPercent]} onValueChange={handleProteinPercentChange} min={0} max={100} step={1} />
                  </div>

                  {/* Fats (auto) */}
                  <div className="opacity-50">
                    <div className="flex justify-between items-center mb-2">
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" />
                        {t('fatsPercent')}
                      </Label>
                      <span className="text-lg font-bold tabular-nums">{fatsPercent}%</span>
                    </div>
                    <Slider value={[fatsPercent]} min={0} max={100} step={1} disabled />
                  </div>

                  {/* Stacked bar */}
                  <div className="space-y-2 pt-1">
                    <div className="h-4 w-full rounded-full overflow-hidden flex">
                      <div className="bg-blue-500 transition-all duration-200"   style={{ width: `${carbsPercent}%` }} />
                      <div className="bg-red-500 transition-all duration-200"    style={{ width: `${proteinPercent}%` }} />
                      <div className="bg-yellow-400 transition-all duration-200" style={{ width: `${fatsPercent}%` }} />
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500   inline-block" />{t('carbs')}</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500    inline-block" />{t('protein')}</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />{t('fats')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT: results */}
            <div className="space-y-6">
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle>{t('calculated')}</CardTitle>
                  <CardDescription>{t('formula')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="flex flex-col items-center p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                      <span className="w-3 h-3 rounded-full bg-blue-500 mb-2" />
                      <span className="text-xs text-muted-foreground mb-1">{t('carbs')}</span>
                      <span className="text-4xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">{calcCarbs}</span>
                      <span className="text-xs text-muted-foreground mt-1">{t('gUnit')}</span>
                    </div>
                    <div className="flex flex-col items-center p-5 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
                      <span className="w-3 h-3 rounded-full bg-red-500 mb-2" />
                      <span className="text-xs text-muted-foreground mb-1">{t('protein')}</span>
                      <span className="text-4xl font-bold text-red-500 dark:text-red-400 tabular-nums">{calcProtein}</span>
                      <span className="text-xs text-muted-foreground mt-1">{t('gUnit')}</span>
                    </div>
                    <div className="flex flex-col items-center p-5 rounded-2xl bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-100 dark:border-yellow-900/30">
                      <span className="w-3 h-3 rounded-full bg-yellow-400 mb-2" />
                      <span className="text-xs text-muted-foreground mb-1">{t('fats')}</span>
                      <span className="text-4xl font-bold text-yellow-600 dark:text-yellow-400 tabular-nums">{calcFats}</span>
                      <span className="text-xs text-muted-foreground mt-1">{t('gUnit')}</span>
                    </div>
                  </div>

                  {/* breakdown table */}
                  <div className="rounded-xl border bg-muted/30 divide-y divide-border text-sm">
                    <div className="flex justify-between px-4 py-3">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />{t('carbs')} × 4
                      </span>
                      <span className="font-medium tabular-nums">{calcCarbs * 4} {t('kcalUnit')}</span>
                    </div>
                    <div className="flex justify-between px-4 py-3">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />{t('protein')} × 4
                      </span>
                      <span className="font-medium tabular-nums">{calcProtein * 4} {t('kcalUnit')}</span>
                    </div>
                    <div className="flex justify-between px-4 py-3">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />{t('fats')} × 9
                      </span>
                      <span className="font-medium tabular-nums">{calcFats * 9} {t('kcalUnit')}</span>
                    </div>
                    <div className="flex justify-between px-4 py-3 font-semibold text-foreground">
                      <span>{t('totalCalories')}</span>
                      <span className="tabular-nums text-primary">{dailyCalories} {t('kcalUnit')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            Mode B — Macros-First  (2-col grid)
            ══════════════════════════════════════════════════════════ */}
        {isMacrosFirst && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

            {/* LEFT: macro inputs */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>{t('macroTargets')}</CardTitle>
                <CardDescription>{t('formula')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Carbs */}
                <div>
                  <Label htmlFor="carbs-g" className="flex items-center gap-2 text-sm font-medium mb-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />{t('carbs')}
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input id="carbs-g" type="number" value={carbsGrams} min={0}
                      onChange={(e) => setCarbsGrams(Math.max(0, Number(e.target.value)))}
                      className="w-32 text-xl font-bold h-12 text-center" />
                    <span className="text-muted-foreground">{t('gUnit')}</span>
                    <span className="ml-auto text-sm text-muted-foreground tabular-nums">
                      × 4 = <span className="font-semibold text-foreground">{carbsGrams * 4}</span> {t('kcalUnit')}
                    </span>
                  </div>
                </div>

                {/* Protein */}
                <div>
                  <Label htmlFor="protein-g" className="flex items-center gap-2 text-sm font-medium mb-2">
                    <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />{t('protein')}
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input id="protein-g" type="number" value={proteinGrams} min={0}
                      onChange={(e) => setProteinGrams(Math.max(0, Number(e.target.value)))}
                      className="w-32 text-xl font-bold h-12 text-center" />
                    <span className="text-muted-foreground">{t('gUnit')}</span>
                    <span className="ml-auto text-sm text-muted-foreground tabular-nums">
                      × 4 = <span className="font-semibold text-foreground">{proteinGrams * 4}</span> {t('kcalUnit')}
                    </span>
                  </div>
                </div>

                {/* Fats */}
                <div>
                  <Label htmlFor="fats-g" className="flex items-center gap-2 text-sm font-medium mb-2">
                    <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />{t('fats')}
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input id="fats-g" type="number" value={fatsGrams} min={0}
                      onChange={(e) => setFatsGrams(Math.max(0, Number(e.target.value)))}
                      className="w-32 text-xl font-bold h-12 text-center" />
                    <span className="text-muted-foreground">{t('gUnit')}</span>
                    <span className="ml-auto text-sm text-muted-foreground tabular-nums">
                      × 9 = <span className="font-semibold text-foreground">{fatsGrams * 9}</span> {t('kcalUnit')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* RIGHT: total calories */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>{t('totalCalories')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-6xl font-bold text-primary tabular-nums">{calcCalories}</span>
                  <span className="text-xl text-muted-foreground">{t('kcalUnit')}</span>
                </div>

                {/* stacked bar */}
                <div className="h-4 w-full rounded-full overflow-hidden flex mb-3">
                  <div className="bg-blue-500   transition-all duration-200" style={{ width: `${(carbsGrams * 4   / calcCalories) * 100}%` }} />
                  <div className="bg-red-500    transition-all duration-200" style={{ width: `${(proteinGrams * 4 / calcCalories) * 100}%` }} />
                  <div className="bg-yellow-400 transition-all duration-200" style={{ width: `${(fatsGrams * 9   / calcCalories) * 100}%` }} />
                </div>

                <div className="rounded-xl border bg-muted/30 divide-y divide-border text-sm mt-4">
                  <div className="flex justify-between px-4 py-3">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                      {t('carbs')} {carbsGrams}{t('gUnit')} × 4
                    </span>
                    <span className="font-medium tabular-nums">{carbsGrams * 4} {t('kcalUnit')}</span>
                  </div>
                  <div className="flex justify-between px-4 py-3">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                      {t('protein')} {proteinGrams}{t('gUnit')} × 4
                    </span>
                    <span className="font-medium tabular-nums">{proteinGrams * 4} {t('kcalUnit')}</span>
                  </div>
                  <div className="flex justify-between px-4 py-3">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
                      {t('fats')} {fatsGrams}{t('gUnit')} × 9
                    </span>
                    <span className="font-medium tabular-nums">{fatsGrams * 9} {t('kcalUnit')}</span>
                  </div>
                  <div className="flex justify-between px-4 py-3 font-semibold text-foreground">
                    <span>{t('totalCalories')}</span>
                    <span className="tabular-nums text-primary">{calcCalories} {t('kcalUnit')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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

