'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, UserCog } from 'lucide-react'

export default function TeamPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Team</h1>
          <p className="text-muted-foreground">Manage your team members and roles</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Invite Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="w-5 h-5" />
            Team Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <UserCog className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No team members yet</p>
            <p className="text-sm">Invite team members to collaborate</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
