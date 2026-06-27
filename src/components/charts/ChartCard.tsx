'use client'
/**
 * ChartCard — the frame every chart sits in.
 *
 * Card shell + muted title on the one type scale + a restrained framer-motion
 * enter (fade + slight rise), gated on prefers-reduced-motion. Optional header
 * action slot (e.g. a refresh control).
 */
import { type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { TYPE, MOTION } from './tokens'

export interface ChartCardProps {
  title?: ReactNode
  action?: ReactNode
  className?: string
  contentClassName?: string
  children: ReactNode
}

export function ChartCard({ title, action, className, contentClassName, children }: ChartCardProps) {
  const reduce = useReducedMotion()
  const motionProps = reduce
    ? {}
    : { initial: MOTION.enter.initial, animate: MOTION.enter.animate, transition: MOTION.enter.transition }

  return (
    <motion.div {...motionProps}>
      <Card className={cn('border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900', className)}>
        {title !== undefined && (
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={TYPE.chartTitle}>{title}</CardTitle>
            {action}
          </CardHeader>
        )}
        <CardContent className={cn('pt-2', contentClassName)}>{children}</CardContent>
      </Card>
    </motion.div>
  )
}
