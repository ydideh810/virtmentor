import './globals.css'
import type { Metadata } from 'next'
import { Tektur } from 'next/font/google'
import { Toaster } from "@/components/ui/toaster"
import { ErrorBoundary } from 'react-error-boundary'
import Error from './error'

const tektur = Tektur({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-tektur',
})

export const metadata: Metadata = {
  title: 'Virtual Mentor - Skill Development RAG Agent',
  description: 'Personalized learning paths and weekly goals for skill development',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={tektur.variable}>
      <head>
        <link rel="icon" href="/vm.ico" type="image/x-icon" />
        <title>Virtual Mentor - Skill Development RAG Agent</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body>
        <ErrorBoundary FallbackComponent={Error}>
          {children}
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  )
}
