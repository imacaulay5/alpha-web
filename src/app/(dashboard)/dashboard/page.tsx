'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useAppState } from '@/contexts/AppStateContext'
import { AccountType, Capability } from '@/types/enums'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Clock,
  FileText,
  Receipt,
  FolderKanban,
  CheckCircle,
  AlertCircle,
  Plus,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

// Personal account dashboard stats
const personalStats = [
  { title: 'Bills This Month', value: '$1,234', change: '+5.2%', trend: 'up', icon: Receipt },
  { title: 'Payments Made', value: '12', change: '-2.1%', trend: 'down', icon: DollarSign },
]

// Freelancer account dashboard stats
const freelancerStats = [
  { title: 'Billable Hours', value: '142h', change: '+12.5%', trend: 'up', icon: Clock },
  { title: 'Revenue MTD', value: '$8,450', change: '+18.3%', trend: 'up', icon: DollarSign },
  { title: 'Outstanding', value: '$2,340', change: '-8.2%', trend: 'down', icon: FileText },
  { title: 'Active Projects', value: '5', change: '+1', trend: 'up', icon: FolderKanban },
]

// Business account dashboard stats
const businessStats = [
  { title: 'Revenue MTD', value: '$45,670', change: '+22.5%', trend: 'up', icon: DollarSign },
  { title: 'Profit Margin', value: '32%', change: '+4.2%', trend: 'up', icon: TrendingUp },
  { title: 'Team Hours', value: '1,245h', change: '+8.3%', trend: 'up', icon: Clock },
  { title: 'Pending Approvals', value: '8', change: '-3', trend: 'down', icon: AlertCircle },
]

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { hasCapability } = useAppState()

  const accountType = user?.account_type || AccountType.personal

  const getStatsForAccountType = () => {
    switch (accountType) {
      case AccountType.personal:
        return personalStats
      case AccountType.freelancer:
        return freelancerStats
      case AccountType.business:
        return businessStats
      default:
        return personalStats
    }
  }

  const stats = getStatsForAccountType()

  const quickActions = [
    {
      title: 'Log Time',
      description: 'Track your work hours',
      icon: Clock,
      action: () => router.push('/time-entries'),
      capability: Capability.trackTime,
      color: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Create Invoice',
      description: 'Bill your clients',
      icon: FileText,
      action: () => router.push('/invoices'),
      capability: Capability.createInvoices,
      color: 'bg-green-50 hover:bg-green-100 dark:bg-green-950 dark:hover:bg-green-900',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Add Expense',
      description: 'Record an expense',
      icon: Receipt,
      action: () => router.push('/expenses'),
      capability: Capability.submitExpenses,
      color: 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-950 dark:hover:bg-purple-900',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: 'New Project',
      description: 'Start a new project',
      icon: FolderKanban,
      action: () => router.push('/projects'),
      capability: Capability.createProjects,
      color: 'bg-orange-50 hover:bg-orange-100 dark:bg-orange-950 dark:hover:bg-orange-900',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
  ]

  const visibleQuickActions = quickActions.filter((action) =>
    hasCapability(action.capability)
  )

  const recentActivities = [
    { id: 1, message: 'Logged 4 hours on Project Alpha', time: '2 mins ago', status: 'success' },
    { id: 2, message: 'Invoice #INV-042 sent to Acme Corp', time: '1 hour ago', status: 'success' },
    { id: 3, message: 'Expense report pending approval', time: '3 hours ago', status: 'warning' },
    { id: 4, message: 'New project created: Website Redesign', time: '1 day ago', status: 'success' },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      default:
        return <CheckCircle className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name?.split(' ')[0] || 'there'}!
          </p>
        </div>
        <div className="flex gap-2">
          {hasCapability(Capability.trackTime) && (
            <Button onClick={() => router.push('/time-entries')} className="gap-2">
              <Plus className="w-4 h-4" />
              Log Time
            </Button>
          )}
          {hasCapability(Capability.createInvoices) && (
            <Button onClick={() => router.push('/invoices')} variant="outline" className="gap-2">
              <FileText className="w-4 h-4" />
              New Invoice
            </Button>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {visibleQuickActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {visibleQuickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md text-left ${action.color}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <action.icon className={`w-6 h-6 ${action.iconColor}`} />
                  </div>
                  <h3 className="font-medium mb-1">{action.title}</h3>
                  <p className="text-sm opacity-80">{action.description}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${stats.length > 2 ? 'lg:grid-cols-4' : ''} gap-6`}>
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {stat.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  {getStatusIcon(activity.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {hasCapability(Capability.viewInvoices) && (
                <>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Overdue Invoices</span>
                    <Badge variant="destructive">2</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Draft Invoices</span>
                    <Badge variant="secondary">5</Badge>
                  </div>
                </>
              )}
              {hasCapability(Capability.viewOwnTimeEntries) && (
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Hours This Week</span>
                  <Badge variant="outline">32h</Badge>
                </div>
              )}
              {hasCapability(Capability.viewOwnExpenses) && (
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Pending Expenses</span>
                  <Badge variant="secondary">3</Badge>
                </div>
              )}
              {accountType === AccountType.business && hasCapability(Capability.viewTeamActivity) && (
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Team Members</span>
                  <Badge variant="outline">12</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
