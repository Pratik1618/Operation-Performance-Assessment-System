"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-emerald-600" />
        ),
        info: (
          <InfoIcon className="size-4 text-blue-600" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4 text-amber-600" />
        ),
        error: (
          <OctagonXIcon className="size-4 text-rose-600" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin text-zinc-500" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:!bg-zinc-950 group-[.toaster]:!text-zinc-50 group-[.toaster]:!border-zinc-800 group-[.toaster]:!shadow-xl",
          title: "group-[.toast]:font-semibold group-[.toast]:!text-white",
          description: "group-[.toast]:!text-zinc-400 text-xs",
          actionButton:
            "group-[.toast]:!bg-zinc-50 group-[.toast]:!text-zinc-900",
          cancelButton:
            "group-[.toast]:!bg-zinc-800 group-[.toast]:!text-zinc-400",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
