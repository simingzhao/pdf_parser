/*
The root server layout for the app.
Authentication functionality temporarily disabled.
*/

import { Toaster } from "@/components/ui/toaster"
import { Providers } from "@/components/utilities/providers"
import { TailwindIndicator } from "@/components/utilities/tailwind-indicator"
import { ThemeSwitcher } from "@/components/utilities/theme-switcher"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
// import { ClerkProvider } from "@clerk/nextjs" - Authentication temporarily disabled

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PDF Parser",
  description: "Upload PDFs and extract structured data with ease."
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("antialiased", inter.className)}>
        {/* Authentication temporarily disabled - ClerkProvider removed */}
        <Providers>
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
