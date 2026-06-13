'use client'

import { Bell, ChevronDown, LogOut, Search, Settings2, User } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useOCRMS, roleConfigs } from '@/lib/context/ocrms-context'
import type { UserRole } from '@/lib/types'
import { toast } from 'sonner'

const quickChips = ['June 2025', 'North Region', '12 Sites Active']

const roleUserMap: Record<UserRole, { name: string; designation: string; email: string }> = {
  oe: { name: 'Ravi Shankar', designation: 'Operation Executive', email: 'ravi.shankar@opas.com' },
  rm: { name: 'Suresh Kumar', designation: 'Regional Manager (North)', email: 'suresh.kumar@opas.com' },
  avp: { name: 'Venkat Raman', designation: 'AVP Operations', email: 'venkat.raman@opas.com' },
  bh: { name: 'Priya Saxena', designation: 'Business Head', email: 'priya.saxena@opas.com' },
  hr: { name: 'Neha Verma', designation: 'HR Manager', email: 'neha.verma@opas.com' },
  procurement: { name: 'Amit Sharma', designation: 'Procurement Head', email: 'amit.sharma@opas.com' },
  dr: { name: 'Rajesh Khanna', designation: 'Operation Director', email: 'rajesh.khanna@opas.com' },
  th: { name: 'Vikram Sen', designation: 'Trainer Head', email: 'vikram.sen@opas.com' },
  trainers: { name: 'Geeta Joshi', designation: 'Trainer', email: 'geeta.joshi@opas.com' },
  commerical: { name: 'Anil Mehta', designation: 'Commercial Team', email: 'anil.mehta@opas.com' },
  hod: { name: 'Sanjay Gupta', designation: 'Back Office HOD', email: 'sanjay.gupta@opas.com' },
  hr_dr: { name: 'Meenakshi Sharma', designation: 'HR Director', email: 'meenakshi.sharma@opas.com' },
}

const roleLabelMap: Record<UserRole, string> = {
  oe: 'OE: Operation Executive',
  rm: 'RM: Regional Manager',
  avp: 'AVP: Operations',
  bh: 'BH: Business Head',
  hr: 'HR: HR Team',
  procurement: 'PROC: Procurement',
  dr: 'DR: Operation Director',
  th: 'TH: Trainer Head',
  trainers: 'TRN: Trainers',
  commerical: 'COMM: Commercial',
  hod: 'HOD: Back Office HOD',
  hr_dr: 'HRDR: HR Director',
}

export function Header() {
  const router = useRouter()
  const { currentRole, setCurrentRole } = useOCRMS()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  const activeUserData = roleUserMap[currentRole]

  const [localNotifications, setLocalNotifications] = useState([
    {
      id: 1,
      type: 'warning',
      title: 'Overdue Tasks',
      message: '5 daily reports are overdue across 3 sites. Immediate action required.',
      read: false,
    },
    {
      id: 2,
      type: 'success',
      title: 'Site Visit Completed',
      message: 'Infosys Gurgaon Tower A — site visit completed with 30/34 checklist score.',
      read: false,
    },
    {
      id: 3,
      type: 'info',
      title: 'Grievance Escalated',
      message: 'Geeta Devi harassment complaint escalated to AVP for review.',
      read: true,
    },
    {
      id: 4,
      type: 'warning',
      title: 'Incident Alert',
      message: 'Critical incident at DLF Cyber Hub Delhi — server room fire. Investigation ongoing.',
      read: false,
    },
    {
      id: 5,
      type: 'info',
      title: 'Action Required: Site Visit Today',
      message: 'You have a planned visit to Wipro Hinjewadi Campus today (May 25, 2025). Please submit the site visit report upon arrival.',
      read: false,
    },
  ])

  const unreadCount = localNotifications.filter((item) => !item.read).length

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLocalNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-white/60 backdrop-blur-xl shadow-soft">
      <div className="mx-auto flex h-16 w-full max-w-[1680px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="relative block w-full max-w-md group">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
              <input
                type="text"
                placeholder="Search tasks, sites, employees, reports..."
                className="w-full rounded-xl border border-border bg-white/90 py-2 pl-10 pr-4 text-sm text-foreground shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all hover:border-primary/50"
              />
            </label>

            <div className="hidden flex-wrap items-center gap-1.5 xl:flex">
              {quickChips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-lg border border-border/60 bg-gradient-to-r from-white/80 to-white/60 px-3 py-1 text-[11px] font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all cursor-pointer shadow-soft"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-indigo-100 bg-indigo-50/70 px-2.5 py-1.5 shadow-sm">
            <span className="text-[9px] font-bold text-indigo-700 uppercase tracking-wider hidden md:inline">Role:</span>
            <select
              value={currentRole}
              onChange={(e) => handleRoleChange(e.target.value as UserRole)}
              className="bg-transparent text-[11px] font-bold text-indigo-800 outline-none border-none cursor-pointer pr-1 focus:ring-0 focus:outline-none"
            >
              {roleConfigs.map((rc) => (
                <option key={rc.role} value={rc.role} className="text-foreground bg-white">
                  {roleLabelMap[rc.role]}
                </option>
              ))}
            </select>
          </div>

          <button className="rounded-xl border border-border/60 bg-white/75 hover:bg-white p-2 text-muted-foreground hover:text-foreground shadow-soft transition-all hover:shadow-medium hover:border-primary/40">
            <Settings2 size={16} />
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
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-red-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-3 w-[400px] overflow-hidden rounded-2xl border border-border bg-white shadow-2xl z-50">
                <div className="border-b border-border bg-slate-50/90 px-4 py-3.5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-foreground text-sm">Notifications</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{unreadCount} unread alerts</p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-extrabold text-indigo-600 hover:text-indigo-800 hover:underline focus:outline-none"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-border/65">
                  {localNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        setIsNotificationsOpen(false)
                        router.push('/notifications')
                      }}
                      className={`p-4 text-left hover:bg-slate-50/50 transition-colors cursor-pointer ${
                        !notif.read ? 'bg-indigo-50/20' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                            notif.type === 'success'
                              ? 'bg-emerald-500'
                              : notif.type === 'warning'
                                ? 'bg-amber-500'
                                : 'bg-blue-500'
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm text-slate-800 truncate ${!notif.read ? 'font-bold' : 'font-semibold'}`}>
                            {notif.title}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {notif.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/notifications"
                  onClick={() => setIsNotificationsOpen(false)}
                  className="block w-full border-t border-border px-4 py-3 text-center text-xs font-bold text-indigo-600 transition hover:bg-slate-50 bg-slate-50/40"
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
              className="flex items-center gap-2.5 rounded-xl border border-border bg-white/80 px-2.5 py-1.5 shadow-sm transition hover:bg-white"
            >
              <div className="hidden text-right md:block">
                <p className="text-xs font-semibold text-foreground">{activeUserData.name}</p>
                <p className="text-[10px] text-muted-foreground">{activeUserData.designation}</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-sm">
                <User size={14} />
              </div>
              <ChevronDown size={14} className="text-muted-foreground" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-60 overflow-hidden rounded-2xl border border-border bg-white shadow-2xl z-50">
                <div className="border-b border-border bg-slate-50/90 px-4 py-3">
                  <p className="font-semibold text-foreground text-sm">{activeUserData.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{activeUserData.email}</p>
                </div>
                <button className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-foreground transition hover:bg-muted/60">
                  <User size={14} />
                  Profile Settings
                </button>
                <button
                  onClick={() => {
                    setIsProfileOpen(false)
                    toast.success('Logged out successfully')
                    router.push('/login')
                  }}
                  className="flex w-full items-center gap-3 border-t border-border px-4 py-2.5 text-left text-sm text-destructive transition hover:bg-muted/60 cursor-pointer"
                >
                  <LogOut size={14} />
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
