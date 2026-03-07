'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

interface CaloriesFirstPanelProps {
  dailyCalories: number
  setDailyCalories: (v: number) => void
  carbsPercent: number
  proteinPercent: number
  onCarbsChange: (val: number[]) => void
  onProteinChange: (val: number[]) => void
}

export function CaloriesFirstPanel({
  dailyCalories,
  setDailyCalories,
  carbsPercent,
  proteinPercent,
  onCarbsChange,
  onProteinChange,
}: CaloriesFirstPanelProps) {
  const t = useTranslations('goals')

  const fatsPercent = Math.max(0, 100 - carbsPercent - proteinPercent)
  const calcCarbs   = Math.round((dailyCalories * carbsPercent)   / 100 / 4)
  const calcProtein = Math.round((dailyCalories * proteinPercent) / 100 / 4)
  const calcFats    = Math.round((dailyCalories * fatsPercent)    / 100 / 9)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* LEFT: inputs */}
      <div className="space-y-6">
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

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>{t('macroDistribution')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-7">
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
                  {t('carbs')}
                </Label>
                <span className="text-lg font-bold tabular-nums">{carbsPercent}%</span>
              </div>
              <Slider value={[carbsPercent]} onValueChange={onCarbsChange} min={0} max={100} step={1} />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                  {t('protein')}
                </Label>
                <span className="text-lg font-bold tabular-nums">{proteinPercent}%</span>
              </div>
              <Slider value={[proteinPercent]} onValueChange={onProteinChange} min={0} max={100} step={1} />
            </div>

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
  )
}

