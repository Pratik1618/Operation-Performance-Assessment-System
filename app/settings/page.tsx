'use client'

import { useState } from 'react'
import { Mail, MapPin, Phone, Save, ShieldCheck, SlidersHorizontal, UserCircle2, Sparkles, Calendar } from 'lucide-react'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useOCRMS, type ScoringPolicy } from '@/lib/context/ocrms-context'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { currentRole, currentUser, scoringPolicy, setScoringPolicy, runTaskGenerationEngine } = useOCRMS()
  
  const [profileData, setProfileData] = useState({
    name: currentUser.userName,
    email: `${currentUser.role}@opas.com`,
    phone: '9876543210',
    designation: currentUser.designation,
    region: 'North',
    state: 'Delhi NCR'
  })

  // Date for engine simulation
  const [simDate, setSimDate] = useState('2026-06-01')

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveProfile = () => {
    toast.success('Changes Saved', { description: 'Profile information updated successfully.' })
  }

  const triggerEngineSimulation = () => {
    const generatedCount = runTaskGenerationEngine(simDate)
    if (generatedCount > 0) {
      toast.success('Simulation Completed', { 
        description: `Task Generation Engine ran for ${simDate}. Instantiated ${generatedCount} new performance tasks!` 
      })
    } else {
      toast.info('Simulation Completed', { 
        description: `No new tasks generated. Tasks for date ${simDate} already exist.` 
      })
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Settings' }]} />

      <Card className="p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">System Preferences</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Manage scoring policies, profile details, and trigger task generation simulation.
        </p>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          
          {/* CONFIGURABLE SCORING POLICY */}
          <Card className="p-6 shadow-soft border rounded-2xl bg-white">
            <CardHeader className="p-0 mb-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
                  <SlidersHorizontal size={18} />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground">Scoring & Performance Policy</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Define how performance weights and supervisor reviews contribute to final scoring.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 space-y-4">
              {[
                { 
                  key: 'avp_only' as ScoringPolicy, 
                  name: 'AVP Score Only', 
                  description: 'Final rating is determined solely by AVP Operations approval score.' 
                },
                { 
                  key: 'average' as ScoringPolicy, 
                  name: 'Average of OE + RM + AVP', 
                  description: 'Final rating is calculated as the average: (OE Self + RM Review + AVP Approval) / 3.' 
                },
                { 
                  key: 'weighted' as ScoringPolicy, 
                  name: 'Weighted Formula (15% OE, 35% RM, 50% AVP)', 
                  description: 'Final rating weights: 15% OE Self Rating, 35% RM Review Rating, and 50% AVP Approval Rating.' 
                }
              ].map((policy) => (
                <div 
                  key={policy.key} 
                  onClick={() => setScoringPolicy(policy.key)}
                  className={`flex items-start justify-between rounded-2xl border p-4 shadow-sm cursor-pointer transition-all ${
                    scoringPolicy === policy.key 
                      ? 'bg-indigo-50/70 border-indigo-300 text-indigo-900 ring-2 ring-indigo-100' 
                      : 'bg-white border-border text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1 pr-4">
                    <p className="font-bold text-sm">{policy.name}</p>
                    <p className="text-xs text-muted-foreground">{policy.description}</p>
                  </div>
                  <input
                    type="radio"
                    name="scoring_policy"
                    checked={scoringPolicy === policy.key}
                    onChange={() => setScoringPolicy(policy.key)}
                    className="h-4.5 w-4.5 text-indigo-600 border-slate-350 focus:ring-indigo-500 cursor-pointer mt-1"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* TASK GENERATION SIMULATOR */}
          <Card className="p-6 shadow-soft border rounded-2xl bg-white">
            <CardHeader className="p-0 mb-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-600">
                  <Sparkles size={18} />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground">Task Generation Simulator</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Simulate time forwards to generate task checklists for target dates.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 space-y-4">
              <div className="bg-slate-50 border p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                  <Calendar size={18} className="text-slate-400" />
                  <div className="space-y-1 flex-1">
                    <Label htmlFor="simDate" className="text-xs font-bold text-slate-600">Target Date to Generate</Label>
                    <Input
                      type="date"
                      id="simDate"
                      value={simDate}
                      onChange={(e) => setSimDate(e.target.value)}
                      className="h-9 mt-1 rounded-xl"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={triggerEngineSimulation}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold h-10 rounded-xl px-4 text-xs gap-1.5 shadow-sm"
                >
                  <Sparkles size={13} className="fill-white" /> Run Generation Engine
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Profile details */}
          <Card className="p-6 shadow-soft border rounded-2xl bg-white">
            <CardHeader className="p-0 mb-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                  <UserCircle2 size={18} />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground">Profile Settings</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">Primary identity and workspace details</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-xs font-bold text-slate-600">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                    className="h-10 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="designation" className="text-xs font-bold text-slate-600">Designation</Label>
                  <Input
                    id="designation"
                    disabled
                    value={profileData.designation}
                    className="h-10 rounded-xl text-xs bg-slate-50 border-slate-200 text-slate-500"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                    <Mail size={13} /> Email
                  </Label>
                  <Input
                    id="email"
                    value={profileData.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    className="h-10 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phone" className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                    <Phone size={13} /> Phone
                  </Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                    className="h-10 rounded-xl text-xs"
                  />
                </div>
              </div>

              <Button onClick={handleSaveProfile} className="mt-2 flex items-center gap-1.5 shadow-md shadow-blue-500/25 h-10 rounded-xl text-xs font-bold" size="lg">
                <Save size={14} />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="p-5 shadow-soft border rounded-2xl bg-white text-center">
            <div className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-2xl font-bold text-white shadow-md mb-3">
                {currentUser.userName.charAt(0)}
              </div>
              <p className="text-sm font-extrabold text-slate-800">{currentUser.userName}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mt-0.5">{currentUser.designation}</p>
            </div>
            <div className="mt-4 rounded-xl border bg-slate-50 p-3 text-xs text-slate-600 font-semibold text-left">
              Role Code: <span className="font-extrabold text-slate-800">{currentUser.code}</span>
            </div>
          </Card>

          <Card className="p-5 shadow-soft border rounded-2xl bg-white">
            <CardHeader className="p-0 mb-4 border-b pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-emerald-600" size={15} />
                <CardTitle className="text-xs font-bold text-slate-800">Security Credentials</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0 space-y-2">
              <Button variant="outline" className="w-full justify-start text-[11px] font-bold rounded-xl h-10 border-slate-200 hover:bg-slate-50">
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start text-[11px] font-bold rounded-xl h-10 border-slate-200 hover:bg-slate-50">
                Manage Two-Factor Authentication
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
