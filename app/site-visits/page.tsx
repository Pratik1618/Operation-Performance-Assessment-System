'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RedirectSiteVisits() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/site-operations')
  }, [router])

  return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="text-center space-y-2">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600 mx-auto" />
        <p className="text-xs font-semibold text-slate-500">Redirecting to Site Operations Workspace...</p>
      </div>
    </div>
  )
}
