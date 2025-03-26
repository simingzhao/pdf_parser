"use client"

import { LucideIcon } from "lucide-react"
import React from "react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="bg-muted flex size-20 items-center justify-center rounded-full">
        <Icon className="text-muted-foreground size-10" />
      </div>
      <h2 className="mt-6 text-2xl font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-2 max-w-md">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
