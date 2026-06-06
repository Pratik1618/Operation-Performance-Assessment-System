'use client'

import { useState } from 'react'
import { Mail, MapPin, Phone, Save, ShieldCheck, SlidersHorizontal, UserCircle2 } from 'lucide-react'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { currentUser } from '@/lib/data/users'

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone,
    designation: currentUser.designation,
    region: currentUser.region,
    state: currentUser.state,
  })

  const handleChange = (field: string, value: string) => {
    setFormData((previous) => ({ ...previous, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Settings' }]} />

      <Card className="p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">System Preferences</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Manage your user profile, notification behavior, and security preferences for the Operations Performance Assessment System.
        </p>
      </Card>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.45fr)_380px]">
        <div className="space-y-6">
          <Card className="p-6">
            <CardHeader className="p-0 mb-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <UserCircle2 size={18} />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground">Profile Settings</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">Primary identity and workspace details</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(event) => handleChange('name', event.target.value)}
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Input
                    id="designation"
                    value={formData.designation}
                    onChange={(event) => handleChange('designation', event.target.value)}
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail size={15} />
                    Email
                  </Label>
                  <Input
                    id="email"
                    value={formData.email}
                    onChange={(event) => handleChange('email', event.target.value)}
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone size={15} />
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(event) => handleChange('phone', event.target.value)}
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region" className="flex items-center gap-2">
                    <MapPin size={15} />
                    Region
                  </Label>
                  <Input
                    id="region"
                    value={formData.region}
                    onChange={(event) => handleChange('region', event.target.value)}
                    className="h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(event) => handleChange('state', event.target.value)}
                    className="h-10 rounded-xl"
                  />
                </div>
              </div>

              <Button className="mt-6 flex items-center gap-2 shadow-lg shadow-blue-500/20" size="lg">
                <Save size={16} />
                Save Changes
              </Button>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardHeader className="p-0 mb-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <SlidersHorizontal size={18} />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground">Notification Preferences</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">Control what the system pushes to your inbox</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 space-y-4">
              {[
                { name: 'Assessment Updates', description: 'Get notified when assessments are updated' },
                { name: 'Approval Reminders', description: 'Receive reminders for pending approvals' },
                { name: 'Weekly Report', description: 'Send weekly performance summary' },
                { name: 'System Updates', description: 'Receive important system notifications' },
              ].map((preference) => (
                <div key={preference.name} className="flex items-center justify-between rounded-2xl border border-border bg-white/75 p-4 shadow-sm">
                  <div>
                    <p className="font-semibold text-sm text-foreground">{preference.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{preference.description}</p>
                  </div>
                  <Checkbox defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-500 text-2xl font-bold text-white shadow-md">
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <p className="text-base font-bold text-foreground">{currentUser.name}</p>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{currentUser.role}</p>
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-border bg-white/75 p-4 text-xs text-muted-foreground shadow-sm">
              Current workspace: <span className="font-medium text-foreground">{currentUser.region}</span> region · {currentUser.designation}
            </div>
          </Card>

          <Card className="p-6">
            <CardHeader className="p-0 mb-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-violet-50 p-3 text-violet-600 dark:bg-violet-950 dark:text-violet-400">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold text-foreground">Password & Security</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">Authentication and controls</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 space-y-3">
              <Button variant="outline" className="w-full justify-start text-xs font-semibold rounded-xl h-12">
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start text-xs font-semibold rounded-xl h-12">
                Configure Two-Factor Authentication
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
