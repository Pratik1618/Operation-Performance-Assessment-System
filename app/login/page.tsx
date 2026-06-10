'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOCRMS } from '@/lib/context/ocrms-context'
import { Lock, Mail, Shield, Sparkles, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const { setCurrentRole } = useOCRMS()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    setTimeout(() => {
      // Default fallback simulated role (e.g. 'oe' or keeping the current active role)
      // Since actual authentication token handles roles in production
      setCurrentRole('oe')
      toast.success('Successfully Authenticated', {
        description: `Logged in as ${email || 'user@opas.com'}`,
      })
      setIsSubmitting(false)
      router.push('/')
    }, 800)
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 overflow-hidden font-sans">
      {/* Background accents */}
      <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
      <div className="absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-teal-500/5 blur-3xl" />

      <Card className="w-full max-w-[420px] mx-4 rounded-3xl border border-slate-200/80 bg-white shadow-xl p-8 z-10">
        <CardContent className="p-0 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 shadow-md">
              <Sparkles size={20} className="text-white" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight mt-3">
              Operation Performance Assessment System
            </h2>
            <p className="text-xs text-muted-foreground">Sign in to access your dashboard workspace.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">
                  <Mail size={14} />
                </span>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border rounded-xl h-9.5 pl-9 pr-3 text-xs bg-slate-50 border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all font-medium text-slate-700"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">
                  <Lock size={14} />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border rounded-xl h-9.5 pl-9 pr-3 text-xs bg-slate-50 border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all font-medium text-slate-700"
                />
              </div>
            </div>

            {/* Session Settings */}
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-450 pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input type="checkbox" defaultChecked className="rounded border-slate-350 text-emerald-600 focus:ring-emerald-500" />
                <span>Remember me</span>
              </label>
              <span className="text-emerald-700 hover:underline cursor-pointer">Forgot password?</span>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0a2b13] hover:bg-[#08220f] text-white rounded-xl h-10 text-xs font-bold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 border-0 mt-3 cursor-pointer"
            >
              {isSubmitting ? (
                'Signing you in...'
              ) : (
                <>
                  Sign In
                  <ArrowRight size={13} />
                </>
              )}
            </Button>
          </form>

          {/* Secure disclaimer */}
          <div className="flex items-center justify-center gap-1.5 text-[9px] font-bold text-slate-400 border-t pt-4 uppercase tracking-wider">
            <Shield size={11} className="text-slate-300" />
            <span>Secure System Access Authorization</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
