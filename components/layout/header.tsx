'use client'

import { Bell, ChevronDown, LogOut, Search, Settings2, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { currentUser } from '@/lib/data/users'

const quickChips = ['RM Workspace', 'May Cycle', 'North Region']

const roleUserMap = {
  employee: { name: 'Anjali Desai', designation: 'Operations Officer', email: 'anjali.desai@company.com' },
  rm: { name: 'Suresh Kumar', designation: 'Regional Manager (South)', email: 'suresh.kumar@company.com' },
  avp: { name: 'Venkat Raman', designation: 'AVP Operations (South)', email: 'venkat.raman@company.com' },
  bh: { name: 'Amit Sharma', designation: 'Business Head', email: 'amit.sharma@company.com' },
}

export function Header() {
  const router = useRouter()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [activeRole, setActiveRole] = useState<'employee' | 'rm' | 'avp' | 'bh'>('rm')

  const activeUserData = roleUserMap[activeRole] || roleUserMap['rm']

  const [localNotifications, setLocalNotifications] = useState([
    {
      id: 1,
      type: 'warning',
      title: 'Assessment Pending Review',
      message: "Anjali Desai's assessment for May 2025 is awaiting your review",
      read: false,
    },
    {
      id: 2,
      type: 'success',
      title: 'Assessment Approved',
      message: "Neha Verma's May 2025 assessment has been approved",
      read: false,
    },
    {
      id: 3,
      type: 'info',
      title: 'Monthly Report Generated',
      message: 'Your monthly assessment report for May 2025 is ready',
      read: true,
    },
  ])

  const unreadCount = localNotifications.filter((item) => !item.read).length

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLocalNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRole = localStorage.getItem('simulated_role') as any
      if (savedRole) {
        setActiveRole(savedRole)
      }
    }
  }, [])

  const handleRoleChange = (role: 'employee' | 'rm' | 'avp' | 'bh') => {
    setActiveRole(role)
    localStorage.setItem('simulated_role', role)
    window.dispatchEvent(new CustomEvent('simulated_role_change', { detail: role }))
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-white/60 backdrop-blur-xl shadow-soft">
      <div className="mx-auto flex h-20 w-full max-w-[1680px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="relative block w-full max-w-xl group">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={17} />
              <input
                type="text"
                placeholder="Search assessments, employees, regions, reports..."
                className="w-full rounded-xl border border-border bg-white/90 py-2.5 pl-11 pr-4 text-sm text-foreground shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all hover:border-primary/50"
              />
            </label>

            <div className="hidden flex-wrap items-center gap-2 xl:flex">
              {quickChips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-lg border border-border/60 bg-gradient-to-r from-white/80 to-white/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all cursor-pointer shadow-soft"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50/70 px-3 py-2 shadow-sm mr-1">
            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider hidden md:inline">Active Role:</span>
            <select
              value={activeRole}
              onChange={(e) => handleRoleChange(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-indigo-800 outline-none border-none cursor-pointer pr-1 focus:ring-0 focus:outline-none"
            >
              <option value="employee" className="text-foreground bg-white">L1: Executive</option>
              <option value="rm" className="text-foreground bg-white">L2: Regional Manager</option>
              <option value="avp" className="text-foreground bg-white">L3: AVP Operations</option>
              <option value="bh" className="text-foreground bg-white">L4: Business Head</option>
            </select>
          </div>

          <button className="rounded-xl border border-border/60 bg-white/75 hover:bg-white p-2.5 text-muted-foreground hover:text-foreground shadow-soft transition-all hover:shadow-medium hover:border-primary/40">
            <Settings2 size={18} />
          </button>
          <div className="relative">
            <button
              onClick={() => {
                setIsNotificationsOpen((value) => !value)
                setIsProfileOpen(false)
              }}
              className="relative rounded-xl border border-border/60 bg-white/75 hover:bg-white p-2.5 text-muted-foreground hover:text-foreground shadow-soft transition-all hover:shadow-medium hover:border-primary/40 focus:outline-none"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-red-500 text-[9px] font-bold text-white ring-2 ring-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-3xl border border-border bg-white shadow-2xl z-50">
                <div className="border-b border-border bg-slate-50/90 px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground text-sm">Notifications</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{unreadCount} unread alerts</p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline focus:outline-none"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-border/65">
                  {localNotifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground">
                      No notifications found
                    </div>
                  ) : (
                    localNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          setIsNotificationsOpen(false)
                          router.push('/notifications')
                        }}
                        className={`p-4 text-left hover:bg-slate-50/50 transition-colors cursor-pointer ${
                          !notif.read ? 'bg-indigo-50/10' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span
                            className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${
                              notif.type === 'success'
                                ? 'bg-emerald-500'
                                : notif.type === 'warning'
                                  ? 'bg-amber-500'
                                  : 'bg-blue-500'
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <p className={`text-xs font-semibold text-foreground truncate ${!notif.read ? 'font-bold' : ''}`}>
                              {notif.title}
                            </p>
                            <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                              {notif.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <Link
                  href="/notifications"
                  onClick={() => setIsNotificationsOpen(false)}
                  className="block w-full border-t border-border px-5 py-3 text-center text-xs font-semibold text-indigo-600 transition hover:bg-slate-50"
                >
                  View All Notifications
                </Link>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setIsProfileOpen((value) => !value)
                setIsNotificationsOpen(false)
              }}
              className="flex items-center gap-3 rounded-2xl border border-border bg-white/80 px-3 py-2 shadow-sm transition hover:bg-white"
            >
              <div className="hidden text-right md:block">
                <p className="text-sm font-semibold text-foreground">{activeUserData.name}</p>
                <p className="text-xs text-muted-foreground">{activeUserData.designation}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-sm">
                <User size={16} />
              </div>
              <ChevronDown size={16} className="text-muted-foreground" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-3xl border border-border bg-white shadow-2xl">
                <div className="border-b border-border bg-slate-50/90 px-5 py-4">
                  <p className="font-semibold text-foreground">{activeUserData.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{activeUserData.email}</p>
                </div>
                <button className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm text-foreground transition hover:bg-muted/60">
                  <User size={16} />
                  Profile Settings
                </button>
                <button className="flex w-full items-center gap-3 border-t border-border px-5 py-3 text-left text-sm text-destructive transition hover:bg-muted/60">
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
