/*
The root server layout for the app.
*/

import { Toaster } from "@/components/ui/toaster"
import { Providers } from "@/components/utilities/providers"
import { TailwindIndicator } from "@/components/utilities/tailwind-indicator"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeSwitcher } from "@/components/utilities/theme-switcher"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PDF Parser",
  description: "Extract structured data from your PDF files."
}

export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "bg-background mx-auto min-h-screen w-full scroll-smooth antialiased",
          inter.className
        )}
      >
        <Providers
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <header className="border-b">
            <div className="container mx-auto flex items-center justify-between p-4">
              <h1 className="text-xl font-bold">PDF Parser</h1>
              <ThemeSwitcher />
            </div>
          </header>

          {children}

          <TailwindIndicator />

          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
