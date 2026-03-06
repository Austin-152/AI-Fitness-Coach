'use client'

import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'

import { cn } from '@/lib/utils'

type ProgressProps = React.ComponentProps<typeof ProgressPrimitive.Root> & {
    indicatorClassName?: string
}

function Progress({
                      className,
                      value,
                      max = 100,
                      indicatorClassName,
                      ...props
                  }: ProgressProps) {
    const safeMax = Number.isFinite(max) && max > 0 ? max : 100
    const numericValue = typeof value === 'number' && Number.isFinite(value) ? value : 0
    const clampedValue = Math.max(0, Math.min(numericValue, safeMax))
    const offset = 100 - (clampedValue / safeMax) * 100

    return (
        <ProgressPrimitive.Root
            data-slot="progress"
            value={clampedValue}
            max={safeMax}
            className={cn(
                'relative h-2 w-full overflow-hidden rounded-full bg-primary/20',
                className,
            )}
            style={{ transform: 'translateZ(0)' }}
            {...props}
        >
            <ProgressPrimitive.Indicator
                data-slot="progress-indicator"
                className={cn(
                    'h-full w-full bg-primary transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)]',
                    indicatorClassName,
                )}
                style={{ transform: `translateX(-${offset}%)` }}
            />
        </ProgressPrimitive.Root>
    )
}

export { Progress }
