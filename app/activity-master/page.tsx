'use client'

import { PencilLine, Archive, ShieldPlus, FileSpreadsheet } from 'lucide-react'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { activities } from '@/lib/data/activities'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function ActivityMasterPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Activity Master' }]} />

      <Card className="p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Master Management</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">Activity Master</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Maintain the operational task catalog, weightages, evidence formats, and lifecycle state for the monthly scorecard engine.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="lg">
              Import Catalog
            </Button>
            <Button size="lg" className="shadow-lg shadow-blue-500/20">
              Add Activity
            </Button>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 lg:grid-cols-3">
        {[
          { label: 'Total Activities', value: activities.length, tone: 'text-foreground' },
          { label: 'Active Activities', value: activities.filter((item) => item.isActive).length, tone: 'text-emerald-600' },
          { label: 'Archived Activities', value: activities.filter((item) => !item.isActive).length, tone: 'text-amber-600' },
        ].map((card) => (
          <Card key={card.label} className="p-5">
            <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
            <p className={`mt-3 text-3xl font-bold ${card.tone}`}>{card.value}</p>
          </Card>
        ))}
      </section>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.6fr)_380px]">
        <Card className="overflow-hidden">
          <CardHeader className="px-5 py-4 border-b bg-muted/20">
            <CardTitle className="text-xl font-semibold text-foreground">Operational activity catalog</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">Manage activity names, frequencies, evidence types, and activation state.</CardDescription>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table className="min-w-[980px] w-full text-sm">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  {['Activity Name', 'Frequency', 'Weightage', 'Evidence Type', 'Active Status', 'Actions'].map((label) => (
                    <TableHead key={label} className="px-4 py-4 text-left font-semibold text-foreground">
                      {label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity.id} className="bg-white/60 hover:bg-muted/30 transition-colors">
                    <TableCell className="px-4 py-4">
                      <div>
                        <p className="font-semibold text-foreground">{activity.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{activity.description}</p>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 capitalize text-muted-foreground">{activity.frequency}</TableCell>
                    <TableCell className="px-4 py-4 font-semibold text-foreground">{activity.weightage}%</TableCell>
                    <TableCell className="px-4 py-4 capitalize text-muted-foreground">{activity.evidenceType}</TableCell>
                    <TableCell className="px-4 py-4">
                      <Badge
                        variant="outline"
                        className={
                          activity.isActive
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900'
                            : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                        }
                      >
                        {activity.isActive ? 'Active' : 'Archived'}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" className="inline-flex items-center gap-2">
                          <PencilLine size={14} />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="inline-flex items-center gap-2">
                          <Archive size={14} />
                          Archive
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        <aside className="space-y-6">
          <Card className="p-5">
            <CardHeader className="p-0 mb-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <ShieldPlus size={18} />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground">Activity Form Drawer</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">Slide-in editor preview</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              {[
                { label: 'Activity Name', value: 'Operations Audit' },
                { label: 'Frequency', value: 'Monthly' },
                { label: 'Weightage', value: '18%' },
                { label: 'Evidence Type', value: 'Mixed (PDF, photo, spreadsheet)' },
              ].map((field) => (
                <div key={field.label} className="rounded-2xl border border-border bg-white/70 p-4 shadow-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{field.label}</p>
                  <p className="mt-2 font-medium text-sm text-foreground">{field.value}</p>
                </div>
              ))}
              <Button className="w-full shadow-lg shadow-blue-500/20 mt-4" size="lg">
                Save Activity
              </Button>
            </CardContent>
          </Card>

          <Card className="p-5">
            <CardHeader className="p-0 mb-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <FileSpreadsheet size={18} />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground">Management Actions</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">Common admin tasks for the master catalog</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              {[
                'Review archived activities before next cycle planning',
                'Standardize evidence-type mapping across all monthly tasks',
                'Rebalance weightages for newly introduced field priorities',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
