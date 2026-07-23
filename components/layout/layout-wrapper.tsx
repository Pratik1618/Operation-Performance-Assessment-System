'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { useOCRMS } from '@/lib/context/ocrms-context'
import { Loader2 } from 'lucide-react'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, isLoadingAuth } = useOCRMS()

  const isLoginPage = pathname === '/login'

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated && !isLoginPage) {
      router.push('/login')
    }
  }, [isLoadingAuth, isAuthenticated, isLoginPage, router])

  if (isLoadingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isLoginPage) {
    return <main className="min-h-screen bg-background">{children}</main>
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto bg-background">
          <div className="mx-auto w-full max-w-[1680px] px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
