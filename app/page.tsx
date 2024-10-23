import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

export default function Home() {
  return (
    <div className="bolt-container flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold mb-4">
          Virtual Mentor
        </h1>
        <p className="mt-3 text-2xl">
          Your AI-powered guide to skill development
        </p>
        <div className="flex items-center justify-center mt-8">
          <Button asChild className="bolt-button">
            <a href="/dashboard">
              Get Started
              <Sparkles className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </main>
      <footer className="flex items-center justify-center w-full h-24 border-t">
        Powered by Next.js, Mistral AI, and IndexedDB
      </footer>
    </div>
  )
}