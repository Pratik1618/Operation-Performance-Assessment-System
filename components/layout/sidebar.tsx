'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Activity,
  BarChart3,
  Bell,
  CheckCircle2,
  ClipboardList,
  FileBarChart2,
  LayoutDashboard,
  Menu,
  Settings,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import { useState, useEffect } from 'react'

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(true)
  const [activeRole, setActiveRole] = useState<'employee' | 'rm' | 'avp' | 'bh'>('rm')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRole = localStorage.getItem('simulated_role') as any
      if (savedRole) setActiveRole(savedRole)
    }

    const handleRoleChange = (e: CustomEvent) => {
      setActiveRole(e.detail)
    }

    window.addEventListener('simulated_role_change' as any, handleRoleChange)
    return () => {
      window.removeEventListener('simulated_role_change' as any, handleRoleChange)
    }
  }, [])

  const isEmployee = activeRole === 'employee'

  const menuGroups = [
    {
      label: 'Workspace',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
        {
          icon: ClipboardList,
          label: isEmployee ? 'My Scorecards' : 'Regional Portfolio',
          href: '/my-assessments',
        },
        {
          icon: ShieldCheck,
          label: isEmployee ? 'My Assessment History' : 'Assessments',
          href: '/assessments',
        },
        { icon: Activity, label: 'Activity Master', href: '/activity-master' },
        ...(!isEmployee
          ? [{ icon: CheckCircle2, label: 'Approvals', href: '/approvals' }]
          : [{ icon: CheckCircle2, label: 'Track Submissions', href: '/approvals' }]),
      ],
    },
    {
      label: 'Insights',
      items: [
        { icon: FileBarChart2, label: 'Reports', href: '/reports' },
        { icon: BarChart3, label: 'Analytics', href: '/analytics' },
        { icon: Bell, label: 'Notifications', href: '/notifications' },
        { icon: Settings, label: 'Settings', href: '/settings' },
      ],
    },
  ]

  return (
    <>
      <button
        onClick={() => setIsOpen((value) => !value)}
        className="fixed left-4 top-4 z-50 rounded border border-border bg-card p-2 text-foreground shadow-sm lg:hidden"
      >
        {isOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-40 flex w-[288px] flex-col border-r border-sidebar-border bg-gradient-to-b from-sidebar to-sidebar/95 text-sidebar-foreground transition-transform duration-300 lg:relative lg:translate-x-0 shadow-lg-custom`}
      >
        <div className="border-b border-sidebar-border/50 px-6 pb-4 pt-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-sidebar-primary">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">Operation Performance</p>
              <h1 className="text-sm font-bold text-white">Assessment System</h1>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {menuGroups.map((group) => (
            <div key={group.label} className="mb-6">
              <p className="px-4 text-xs font-semibold text-white/50 mb-2">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2 text-sm font-medium rounded transition-colors ${
                        isActive
                          ? 'bg-sidebar-primary text-white'
                          : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-white/10'
                      }`}
                    >
                      <Icon size={18} className="flex-shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-sidebar-border/50 px-4 py-4">
          <div className="rounded border border-white/10 bg-white/5 p-3 text-xs">
            <p className="text-white/60 font-medium">Status: Active</p>
            <p className="text-white/40 text-[11px] mt-1">v1.0.0 · Production</p>
          </div>
        </div>
      </aside>

      {isOpen && <div className="fixed inset-0 z-30 bg-slate-950/35 lg:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
