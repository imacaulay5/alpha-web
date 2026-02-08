'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Clock } from 'lucide-react'

export default function TimeEntriesPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Time Entries</h1>
          <p className="text-muted-foreground">Track and manage your work hours</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Log Time
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Time Entries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No time entries yet</p>
            <p className="text-sm">Start tracking your time to see entries here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
