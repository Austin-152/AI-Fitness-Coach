'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface MacrosFirstPanelProps {
  carbsGrams: number
  proteinGrams: number
  fatsGrams: number
  setCarbsGrams: (v: number) => void
  setProteinGrams: (v: number) => void
  setFatsGrams: (v: number) => void
}

export function MacrosFirstPanel({
  carbsGrams,
  proteinGrams,
  fatsGrams,
  setCarbsGrams,
  setProteinGrams,
  setFatsGrams,
}: MacrosFirstPanelProps) {
  const t = useTranslations('goals')

  const calcCalories = Math.round(carbsGrams * 4 + proteinGrams * 4 + fatsGrams * 9)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* LEFT: macro inputs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>{t('macroTargets')}</CardTitle>
          <CardDescription>{t('formula')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
  )
}

