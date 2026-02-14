'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getTimeEntries, createTimeEntry, updateTimeEntry, deleteTimeEntry } from '@/services/time-entries.service'
import { getProjects } from '@/services/projects.service'
import type { TimeEntry, Project } from '@/types/models'
import { TimeEntryStatus, timeEntryStatusLabels } from '@/types/enums'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Clock, Pencil, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'

function formatDuration(minutes: number | null | undefined): string {
  if (!minutes) return '-'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

function getStatusVariant(status: TimeEntryStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case TimeEntryStatus.approved:
      return 'default'
    case TimeEntryStatus.submitted:
      return 'secondary'
    case TimeEntryStatus.rejected:
      return 'destructive'
    case TimeEntryStatus.invoiced:
      return 'outline'
    default:
      return 'secondary'
  }
}

export default function TimeEntriesPage() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    project_id: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    start_time: '09:00',
    end_time: '17:00',
    notes: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setError(null)
      const [entriesData, projectsData] = await Promise.all([
        getTimeEntries(),
        getProjects(),
      ])
      setEntries(entriesData)
      setProjects(projectsData)
    } catch (err) {
      console.error('Failed to load time entries:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const openCreateDialog = () => {
    setSelectedEntry(null)
    setFormData({
      project_id: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      start_time: '09:00',
      end_time: '17:00',
      notes: '',
    })
    setDialogOpen(true)
  }

  const openEditDialog = (entry: TimeEntry) => {
    setSelectedEntry(entry)
    const startDate = parseISO(entry.start_at)
    const endDate = entry.end_at ? parseISO(entry.end_at) : startDate
    setFormData({
      project_id: entry.project_id || '',
      date: format(startDate, 'yyyy-MM-dd'),
      start_time: format(startDate, 'HH:mm'),
      end_time: format(endDate, 'HH:mm'),
      notes: entry.notes || '',
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const startAt = `${formData.date}T${formData.start_time}:00`
      const endAt = `${formData.date}T${formData.end_time}:00`
      const startDate = new Date(startAt)
      const endDate = new Date(endAt)
      const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000)

      const entryData = {
        user_id: user?.id!,
        project_id: formData.project_id || undefined,
        start_at: startAt,
        end_at: endAt,
        duration_minutes: durationMinutes,
        notes: formData.notes || undefined,
        status: TimeEntryStatus.draft,
      }

      if (selectedEntry) {
        await updateTimeEntry(selectedEntry.id, entryData)
        toast.success('Time entry updated')
      } else {
        await createTimeEntry(entryData)
        toast.success('Time entry created')
      }
      setDialogOpen(false)
      loadData()
    } catch (error) {
      toast.error('Failed to save time entry')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedEntry) return

    try {
      await deleteTimeEntry(selectedEntry.id)
      toast.success('Time entry deleted')
      setDeleteDialogOpen(false)
      setSelectedEntry(null)
      loadData()
    } catch (error) {
      toast.error('Failed to delete time entry')
    }
  }

  // Calculate total hours
  const totalMinutes = entries.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0)
  const totalHours = (totalMinutes / 60).toFixed(1)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="w-12 h-12 mx-auto mb-4 text-destructive opacity-50" />
            <p className="text-destructive font-medium">Error loading data</p>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
            <Button onClick={loadData} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Time Entries</h1>
          <p className="text-muted-foreground">Track and manage your work hours</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          Log Time
        </Button>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entries.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours}h</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
          </CardContent>
        </Card>
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No time entries yet</p>
            <p className="text-sm text-muted-foreground">Start tracking your time to see entries here</p>
            <Button onClick={openCreateDialog} className="mt-4 gap-2">
              <Plus className="w-4 h-4" />
              Log Time
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Time Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {format(parseISO(entry.start_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      {entry.project?.name || '-'}
                    </TableCell>
                    <TableCell>{formatDuration(entry.duration_minutes)}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {entry.notes || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(entry.status)}>
                        {timeEntryStatusLabels[entry.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(entry)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedEntry(entry)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedEntry ? 'Edit Time Entry' : 'Log Time'}
            </DialogTitle>
            <DialogDescription>
              {selectedEntry ? 'Update time entry details' : 'Record your work hours'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="project">Project</Label>
                <Select
                  value={formData.project_id}
                  onValueChange={(value) => setFormData({ ...formData, project_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="What did you work on?"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {selectedEntry ? 'Save Changes' : 'Log Time'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Time Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this time entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
