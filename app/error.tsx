'use client'

import { useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { FallbackProps } from 'react-error-boundary'

export default function Error({
  error,
  resetErrorBoundary,  // Use resetErrorBoundary instead of reset
}: FallbackProps) {
  useEffect(() => {
    console.error('Unhandled error:', error)
  }, [error])

  return (
    <div className="bolt-container flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="mb-4">{error.message || 'An unexpected error occurred.'}</p>
      <Button
        onClick={() => resetErrorBoundary()} // Correct usage
        className="bolt-button"
      >
        Try again
      </Button>
    </div>
  )
}
