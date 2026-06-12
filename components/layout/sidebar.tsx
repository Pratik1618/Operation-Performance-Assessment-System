'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  Bell,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  FileBarChart2,
  HardHat,
  HeadphonesIcon,
  LayoutDashboard,
  ListChecks,
  MapPin,
  Menu,
  MessageSquare,
  Package,
  Scale,
  Settings,
  Shield,
  ShirtIcon,
  ClipboardCheck,
  Star,
  Users2,
  X,
  AlertTriangle,
  FileText,
  ChevronLeft,
  ChevronRight,
  UserX,
  RefreshCw,
  Clock,
  Smartphone,
  ShieldAlert,
  AlertCircle,
  Calendar
} from 'lucide-react'
import { useState } from 'react'
import { useOCRMS } from '@/lib/context/ocrms-context'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(true)
  const { currentRole, sidebarCollapsed, setSidebarCollapsed } = useOCRMS()

  const menuGroups = [
    {
      label: 'Overview',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
      ],
    },
    {
      label: 'Operations',
      items: [
        { icon: ListChecks, label: 'My Tasks', href: '/my-tasks', highlight: true },
        { icon: Building2, label: 'Site Operations', href: '/site-operations' },
      ],
    },
    {
      label: 'Management',
      items: [
        { icon: CheckCircle2, label: 'Reviews & Approvals', href: '/reviews' },
        { icon: ClipboardList, label: 'Activity Master', href: '/activity-master' },
      ],
    },
    {
      label: 'Insights',
      items: [
        { icon: FileBarChart2, label: 'Reports', href: '/reports' },
        { icon: BarChart3, label: 'Analytics', href: '/analytics' },
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
        } fixed inset-y-0 left-0 z-40 flex flex-col border-r border-sidebar-border bg-gradient-to-b from-sidebar to-sidebar/95 text-sidebar-foreground transition-all duration-300 lg:relative lg:translate-x-0 shadow-lg-custom flex-shrink-0 ${
          sidebarCollapsed ? 'w-[272px] lg:w-[68px]' : 'w-[272px]'
        }`}
      >
        <div className={`border-b border-sidebar-border/50 pb-4 pt-5 transition-all duration-300 ${
          sidebarCollapsed ? 'px-3.5 lg:px-3 lg:flex lg:justify-center' : 'px-5'
        }`}>
          <div className={`flex items-center transition-all duration-300 ${
            sidebarCollapsed ? 'gap-0 lg:justify-center' : 'gap-2.5'
          }`}>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 to-teal-500 flex-shrink-0 hover:scale-105 active:scale-95 hover:shadow-[0_0_12px_rgba(16,185,129,0.5)] transition-all cursor-pointer border-0 outline-none p-0"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ClipboardCheck size={16} className="text-white" />
            </button>
            <div className={`transition-all duration-300 overflow-hidden ${
              sidebarCollapsed ? 'lg:max-w-0 lg:opacity-0 lg:ml-0' : 'max-w-[200px] opacity-100'
            }`}>
              <p className="text-[9px] font-bold uppercase tracking-widest text-white/50 whitespace-nowrap">Operations Performance</p>
              <h1 className="text-lg font-black tracking-widest text-white leading-none mt-0.5">OPAS</h1>
            </div>
          </div>
        </div>

        <nav className={`flex-1 overflow-y-auto py-3 scrollbar-none transition-all duration-300 ${
          sidebarCollapsed ? 'px-2.5 lg:px-1.5' : 'px-2.5'
        }`}>
          {menuGroups.map((group, groupIdx) => (
            <div key={group.label} className="mb-4">
              {sidebarCollapsed && groupIdx > 0 && (
                <div className="mx-2 my-3 border-t border-white/10 hidden lg:block animate-in fade-in duration-300" />
              )}
              <p className={`px-3 text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5 transition-all duration-300 ${
                sidebarCollapsed ? 'lg:hidden lg:opacity-0 lg:h-0 lg:mb-0' : 'opacity-100'
              }`}>
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon
                  
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

                  const isHighlighted = 'highlight' in item && item.highlight

                  const itemLink = (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-2.5 transition-all duration-200 rounded-xl ${
                        sidebarCollapsed
                          ? 'px-3 py-[7px] lg:px-0 lg:py-0 lg:w-9 lg:h-9 lg:justify-center lg:mx-auto lg:gap-0'
                          : 'px-3 py-[7px]'
                      } ${
                        isActive
                          ? 'bg-white/15 text-white shadow-sm'
                          : isHighlighted
                            ? 'text-emerald-300 hover:text-white hover:bg-white/10'
                            : 'text-sidebar-foreground/65 hover:text-sidebar-foreground hover:bg-white/8'
                      }`}
                    >
                      <Icon size={16} className="flex-shrink-0" />
                      <span className={`truncate transition-all duration-300 ${
                        sidebarCollapsed ? 'lg:hidden lg:opacity-0' : 'opacity-100'
                      }`}>
                        {item.label}
                      </span>
                      {isHighlighted && !isActive && (
                        <span className={`ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse ${
                          sidebarCollapsed ? 'lg:hidden' : ''
                        }`} />
                      )}
                    </Link>
                  )

                  if (sidebarCollapsed) {
                    return (
                      <Tooltip key={item.href}>
                        <TooltipTrigger render={itemLink} />
                        <TooltipContent side="right" className="hidden lg:inline-flex bg-slate-900 text-white font-medium border border-white/10 shadow-lg px-3 py-1.5 text-xs">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    )
                  }

                  return itemLink
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className={`border-t border-sidebar-border/50 px-3 py-3 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:px-2' : ''
        }`}>
          {sidebarCollapsed ? (
            <>
              {/* Show compact version on desktop, full version on mobile */}
              <div className="rounded-lg border border-white/10 bg-white/5 p-1 text-[10px] font-bold text-white/55 hidden lg:block text-center select-none">
                v2
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-2.5 text-xs lg:hidden">
                <p className="text-white/55 font-medium text-[11px]">OPAS v2.0</p>
                <p className="text-white/35 text-[10px] mt-0.5">Facility Ops · Production</p>
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-white/10 bg-white/5 p-2.5 text-xs">
              <p className="text-white/55 font-medium text-[11px]">OPAS v2.0</p>
              <p className="text-white/35 text-[10px] mt-0.5">Facility Ops · Production</p>
            </div>
          )}
        </div>
      </aside>

      {isOpen && <div className="fixed inset-0 z-30 bg-slate-950/35 lg:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
