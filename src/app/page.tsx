'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const { recoveryPath, isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/dashboard')
      } else if (recoveryPath) {
        router.replace(recoveryPath)
      } else {
        router.replace('/login')
      }
    }
  }, [isAuthenticated, isLoading, recoveryPath, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}
