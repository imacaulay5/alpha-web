'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAppState } from '@/contexts/AppStateContext'
import { getBills } from '@/services/bills.service'
import { getExpenses } from '@/services/expenses.service'
import type { Bill, Expense } from '@/types/models'
import { AccountType, BillStatus, Capability, ExpenseStatus } from '@/types/enums'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  FileText,
  Receipt,
  FolderKanban,
  CheckCircle,
  AlertCircle,
  CreditCard,
  CalendarClock,
  Wand2,
  ArrowRight,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getQuickActions } from '@/lib/quick-actions'
import { addDays, differenceInDays, endOfMonth, formatDistanceToNow, isAfter, isBefore, parseISO, startOfMonth } from 'date-fns'

type DashboardStat = {
  title: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: typeof CalendarClock
}

type RecentActivity = {
  id: string
  message: string
  time: string
  status: 'success' | 'warning'
}

type AiNextStep = {
  id: string
  title: string
  detail: string
  href: string
  priority: 'high' | 'medium' | 'low'
}

type CloseChecklistItem = {
  id: string
  label: string
  detail: string
  href: string
  done: boolean
}

type MonthlySummary = {
  headline: string
  body: string
  highlights: string[]
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

function getPersonalStats(bills: Bill[], expenses: Expense[]): DashboardStat[] {
  const now = new Date()
  const weekFromNow = addDays(now, 7)
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const unpaidBills = bills.filter(
    bill => bill.status !== BillStatus.paid && bill.status !== BillStatus.cancelled
  )
  const dueThisWeek = unpaidBills.filter((bill) => {
    const dueDate = parseISO(bill.due_date)
    return !isBefore(dueDate, now) && !isAfter(dueDate, weekFromNow)
  })
  const paidThisMonth = bills.filter((bill) => {
    if (bill.status !== BillStatus.paid || !bill.paid_at) return false
    const paidAt = parseISO(bill.paid_at)
    return !isBefore(paidAt, monthStart) && !isAfter(paidAt, monthEnd)
  })
  const expensesThisMonth = expenses.filter((expense) => {
    const expenseDate = parseISO(expense.expense_date)
    return !isBefore(expenseDate, monthStart) && !isAfter(expenseDate, monthEnd)
  })

  return [
    {
      title: 'Upcoming Bills',
      value: unpaidBills.length.toString(),
      change: `${dueThisWeek.length} due this week`,
      trend: dueThisWeek.length > 0 ? 'up' : 'down',
      icon: CalendarClock,
    },
    {
      title: 'Bills Due',
      value: formatCurrency(unpaidBills.reduce((sum, bill) => sum + bill.amount, 0)),
      change: `${unpaidBills.length} unpaid`,
      trend: unpaidBills.length > 0 ? 'up' : 'down',
      icon: CreditCard,
    },
    {
      title: 'Payments Made',
      value: paidThisMonth.length.toString(),
      change: `${formatCurrency(paidThisMonth.reduce((sum, bill) => sum + bill.amount, 0))} this month`,
      trend: 'down',
      icon: DollarSign,
    },
    {
      title: 'Monthly Spending',
      value: formatCurrency(expensesThisMonth.reduce((sum, expense) => sum + expense.amount, 0)),
      change: `${expensesThisMonth.length} expenses`,
      trend: expensesThisMonth.length > 0 ? 'up' : 'down',
      icon: Receipt,
    },
  ]
}

function getRecentPersonalActivity(bills: Bill[], expenses: Expense[]): RecentActivity[] {
  const billActivities = bills.map((bill) => ({
    id: `bill-${bill.id}`,
    message: `${bill.status === BillStatus.paid ? 'Paid' : 'Added'} bill: ${bill.name}`,
    time: formatDistanceToNow(parseISO(bill.updated_at || bill.created_at), { addSuffix: true }),
    status: bill.status === BillStatus.overdue ? 'warning' as const : 'success' as const,
    date: parseISO(bill.updated_at || bill.created_at),
  }))

  const expenseActivities = expenses.map((expense) => ({
    id: `expense-${expense.id}`,
    message: `Recorded expense: ${expense.merchant || expense.description || 'Expense'}`,
    time: formatDistanceToNow(parseISO(expense.updated_at || expense.created_at), { addSuffix: true }),
    status: expense.status === ExpenseStatus.rejected ? 'warning' as const : 'success' as const,
    date: parseISO(expense.updated_at || expense.created_at),
  }))

  return [...billActivities, ...expenseActivities]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 4)
    .map(({ date: _date, ...activity }) => activity)
}

function getPersonalMonthlySummary(bills: Bill[], expenses: Expense[]): MonthlySummary {
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  const expensesThisMonth = expenses.filter((expense) => {
    const expenseDate = parseISO(expense.expense_date)
    return !isBefore(expenseDate, monthStart) && !isAfter(expenseDate, monthEnd)
  })
  const paidBillsThisMonth = bills.filter((bill) => {
    if (bill.status !== BillStatus.paid || !bill.paid_at) return false
    const paidAt = parseISO(bill.paid_at)
    return !isBefore(paidAt, monthStart) && !isAfter(paidAt, monthEnd)
  })
  const unpaidBills = bills.filter(
    bill => bill.status !== BillStatus.paid && bill.status !== BillStatus.cancelled
  )
  const overdueBills = unpaidBills.filter(bill => differenceInDays(parseISO(bill.due_date), now) < 0)
  const expenseTotal = expensesThisMonth.reduce((sum, expense) => sum + expense.amount, 0)
  const paidBillTotal = paidBillsThisMonth.reduce((sum, bill) => sum + bill.amount, 0)
  const unpaidBillTotal = unpaidBills.reduce((sum, bill) => sum + bill.amount, 0)
  const categoryTotals = expensesThisMonth.reduce<Record<string, number>>((totals, expense) => {
    const category = expense.category || 'Uncategorized'
    totals[category] = (totals[category] || 0) + expense.amount
    return totals
  }, {})
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]

  if (expensesThisMonth.length === 0 && paidBillsThisMonth.length === 0 && unpaidBills.length === 0) {
    return {
      headline: 'No money movement tracked yet this month.',
      body: 'Add bills and expenses as they happen and Alpha will turn them into a month-end summary.',
      highlights: [
        'Start with one recent expense.',
        'Add upcoming bills before their due dates.',
        'Use Tax Prep once records start building up.',
      ],
    }
  }

  return {
    headline: overdueBills.length > 0
      ? `${overdueBills.length} overdue ${overdueBills.length === 1 ? 'bill needs' : 'bills need'} attention.`
      : unpaidBills.length > 0
        ? `${formatCurrency(unpaidBillTotal)} in bills is still open.`
        : 'Tracked bills are settled for now.',
    body: `This month includes ${formatCurrency(expenseTotal)} in expenses and ${formatCurrency(paidBillTotal)} in paid bills.`,
    highlights: [
      topCategory ? `${topCategory[0]} is the largest expense category at ${formatCurrency(topCategory[1])}.` : 'No expense categories recorded yet.',
      unpaidBills.length ? `${unpaidBills.length} unpaid ${unpaidBills.length === 1 ? 'bill remains' : 'bills remain'} on the list.` : 'No unpaid bills are currently tracked.',
      overdueBills.length ? 'Handle overdue bills before closing the month.' : 'Keep recording new spending so reports stay useful.',
    ],
  }
}

function getSampleMonthlySummary(accountType: AccountType): MonthlySummary {
  if (accountType === AccountType.freelancer) {
    return {
      headline: 'This month is invoice-first.',
      body: 'Tracked work, open invoices, and tax set-asides should stay connected so cash does not surprise you.',
      highlights: [
        'Convert recent billable work into draft invoices.',
        'Follow up on sent or overdue invoices.',
        'Review expenses before estimating quarterly taxes.',
      ],
    }
  }

  return {
    headline: 'This month needs a cashflow pass.',
    body: 'Review receivables, upcoming bills, and expense capture before moving into deeper accounting work.',
    highlights: [
      'Collect or remind on open invoices.',
      'Capture missing vendor bills and expenses.',
      'Use Tax Prep once income and expenses look complete.',
    ],
  }
}

function getPersonalNextSteps(bills: Bill[], expenses: Expense[]): AiNextStep[] {
  const now = new Date()
  const unpaidBills = bills.filter(
    bill => bill.status !== BillStatus.paid && bill.status !== BillStatus.cancelled
  )
  const overdueBills = unpaidBills.filter(bill => differenceInDays(parseISO(bill.due_date), now) < 0)
  const billsDueThisWeek = unpaidBills.filter((bill) => {
    const dueDate = parseISO(bill.due_date)
    return !isBefore(dueDate, now) && !isAfter(dueDate, addDays(now, 7))
  })
  const uncategorizedExpenses = expenses.filter((expense) => !expense.category)
  const submittedExpenses = expenses.filter((expense) => expense.status === ExpenseStatus.submitted)
  const nextSteps: AiNextStep[] = []

  if (overdueBills.length > 0) {
    nextSteps.push({
      id: 'overdue-bills',
      title: `${overdueBills.length} overdue ${overdueBills.length === 1 ? 'bill' : 'bills'}`,
      detail: `Review ${formatCurrency(overdueBills.reduce((sum, bill) => sum + bill.amount, 0))} in overdue payments.`,
      href: '/bills',
      priority: 'high',
    })
  }

  if (billsDueThisWeek.length > 0) {
    nextSteps.push({
      id: 'bills-due-this-week',
      title: `${billsDueThisWeek.length} ${billsDueThisWeek.length === 1 ? 'bill is' : 'bills are'} due this week`,
      detail: 'Pay or mark them paid to keep the dashboard current.',
      href: '/bills',
      priority: 'medium',
    })
  }

  if (uncategorizedExpenses.length > 0) {
    nextSteps.push({
      id: 'categorize-expenses',
      title: `${uncategorizedExpenses.length} expenses need categories`,
      detail: 'Categorized expenses make reports and tax exports cleaner.',
      href: '/expenses',
      priority: 'medium',
    })
  }

  if (submittedExpenses.length > 0) {
    nextSteps.push({
      id: 'submitted-expenses',
      title: `${submittedExpenses.length} expenses are waiting`,
      detail: 'Review pending expenses before month end.',
      href: '/expenses',
      priority: 'low',
    })
  }

  if (nextSteps.length === 0) {
    nextSteps.push({
      id: 'clean-month',
      title: 'Your records look current',
      detail: 'Add new bills or expenses as they come in and Alpha will surface what needs attention.',
      href: '/expenses',
      priority: 'low',
    })
  }

  return nextSteps.slice(0, 3)
}

function getSampleNextSteps(accountType: AccountType): AiNextStep[] {
  if (accountType === AccountType.freelancer) {
    return [
      {
        id: 'draft-invoices',
        title: 'Turn tracked work into invoices',
        detail: 'Review recent billable hours and draft invoices for active clients.',
        href: '/invoices',
        priority: 'high',
      },
      {
        id: 'expense-review',
        title: 'Check this month\'s expenses',
        detail: 'Categorize spending before tax prep gets noisy.',
        href: '/expenses',
        priority: 'medium',
      },
      {
        id: 'tax-prep',
        title: 'Estimate your quarterly tax set-aside',
        detail: 'Use income and expense totals to keep cash reserved.',
        href: '/tax',
        priority: 'low',
      },
    ]
  }

  return [
    {
      id: 'cashflow-review',
      title: 'Review open invoices and bills',
      detail: 'Keep receivables and upcoming payments visible in one routine.',
      href: '/dashboard',
      priority: 'high',
    },
    {
      id: 'client-follow-up',
      title: 'Follow up on unpaid invoices',
      detail: 'A quick payment reminder can protect this month\'s cashflow.',
      href: '/invoices',
      priority: 'medium',
    },
    {
      id: 'tax-ready',
      title: 'Prepare tax-ready records',
      detail: 'Make sure income and expenses are categorized before export.',
      href: '/tax',
      priority: 'low',
    },
  ]
}

function getPriorityVariant(priority: AiNextStep['priority']): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (priority) {
    case 'high':
      return 'destructive'
    case 'medium':
      return 'secondary'
    default:
      return 'outline'
  }
}

function getMonthlyCloseChecklist(accountType: AccountType, bills: Bill[], expenses: Expense[]): CloseChecklistItem[] {
  if (accountType === AccountType.personal) {
    const unpaidBills = bills.filter(
      bill => bill.status !== BillStatus.paid && bill.status !== BillStatus.cancelled
    )
    const uncategorizedExpenses = expenses.filter((expense) => !expense.category)
    const monthStart = startOfMonth(new Date())
    const expensesThisMonth = expenses.filter((expense) => {
      const expenseDate = parseISO(expense.expense_date)
      return !isBefore(expenseDate, monthStart)
    })

    return [
      {
        id: 'personal-bills',
        label: 'Review unpaid bills',
        detail: unpaidBills.length ? `${unpaidBills.length} bills still need attention.` : 'All tracked bills are settled.',
        href: '/bills',
        done: unpaidBills.length === 0,
      },
      {
        id: 'personal-expenses',
        label: 'Categorize spending',
        detail: uncategorizedExpenses.length ? `${uncategorizedExpenses.length} expenses need categories.` : 'Expenses are ready for reporting.',
        href: '/expenses',
        done: uncategorizedExpenses.length === 0,
      },
      {
        id: 'personal-tax',
        label: 'Prepare tax records',
        detail: expensesThisMonth.length ? `${expensesThisMonth.length} expenses can feed tax prep.` : 'Add this month\'s expenses before export.',
        href: '/tax',
        done: expensesThisMonth.length > 0,
      },
    ]
  }

  return [
    {
      id: 'business-invoices',
      label: 'Review open invoices',
      detail: 'Draft reminders for sent or overdue invoices.',
      href: '/invoices',
      done: false,
    },
    {
      id: 'business-expenses',
      label: 'Capture missing expenses',
      detail: 'Use smart capture to keep spending categorized.',
      href: '/expenses',
      done: false,
    },
    {
      id: 'business-tax',
      label: 'Check tax prep',
      detail: 'Review income and expenses before exporting records.',
      href: '/tax',
      done: false,
    },
  ]
}

// Freelancer account dashboard stats
const freelancerStats: DashboardStat[] = [
  { title: 'Billable Hours', value: '142h', change: '+12.5%', trend: 'up', icon: Clock },
  { title: 'Revenue MTD', value: '$8,450', change: '+18.3%', trend: 'up', icon: DollarSign },
  { title: 'Outstanding', value: '$2,340', change: '-8.2%', trend: 'down', icon: FileText },
  { title: 'Active Projects', value: '5', change: '+1', trend: 'up', icon: FolderKanban },
]

// Business account dashboard stats
const businessStats: DashboardStat[] = [
  { title: 'Revenue MTD', value: '$45,670', change: '+22.5%', trend: 'up', icon: DollarSign },
  { title: 'Profit Margin', value: '32%', change: '+4.2%', trend: 'up', icon: TrendingUp },
  { title: 'Team Hours', value: '1,245h', change: '+8.3%', trend: 'up', icon: Clock },
  { title: 'Pending Approvals', value: '8', change: '-3', trend: 'down', icon: AlertCircle },
]

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { hasCapability } = useAppState()
  const [personalBills, setPersonalBills] = useState<Bill[]>([])
  const [personalExpenses, setPersonalExpenses] = useState<Expense[]>([])
  const [personalDashboardError, setPersonalDashboardError] = useState<string | null>(null)
  const [closeGuideOpen, setCloseGuideOpen] = useState(false)
  const [activeCloseStepId, setActiveCloseStepId] = useState<string | null>(null)

  const accountType = user?.account_type || AccountType.personal

  useEffect(() => {
    if (accountType !== AccountType.personal) return

    let isMounted = true

    const loadPersonalDashboard = async () => {
      try {
        const [bills, expenses] = await Promise.all([getBills(), getExpenses()])
        if (!isMounted) return
        setPersonalBills(bills)
        setPersonalExpenses(expenses)
        setPersonalDashboardError(null)
      } catch (error) {
        if (!isMounted) return
        setPersonalDashboardError(error instanceof Error ? error.message : 'Failed to load dashboard data')
      }
    }

    loadPersonalDashboard()

    return () => {
      isMounted = false
    }
  }, [accountType])

  const getStatsForAccountType = (): DashboardStat[] => {
    switch (accountType) {
      case AccountType.personal:
        return getPersonalStats(personalBills, personalExpenses)
      case AccountType.freelancer:
        return freelancerStats
      case AccountType.business:
        return businessStats
      default:
        return getPersonalStats(personalBills, personalExpenses)
    }
  }

  const stats = getStatsForAccountType()
  const quickActions = getQuickActions(accountType)

  const recentActivities =
    accountType === AccountType.personal
      ? getRecentPersonalActivity(personalBills, personalExpenses)
      : [
          { id: 'time-1', message: 'Logged 4 hours on Project Alpha', time: '2 mins ago', status: 'success' as const },
          { id: 'invoice-1', message: 'Invoice #INV-042 sent to Acme Corp', time: '1 hour ago', status: 'success' as const },
          { id: 'expense-1', message: 'Expense report pending approval', time: '3 hours ago', status: 'warning' as const },
          { id: 'project-1', message: 'New project created: Website Redesign', time: '1 day ago', status: 'success' as const },
        ]
  const aiNextSteps =
    accountType === AccountType.personal
      ? getPersonalNextSteps(personalBills, personalExpenses)
      : getSampleNextSteps(accountType)
  const monthlyCloseChecklist = getMonthlyCloseChecklist(accountType, personalBills, personalExpenses)
  const monthlySummary =
    accountType === AccountType.personal
      ? getPersonalMonthlySummary(personalBills, personalExpenses)
      : getSampleMonthlySummary(accountType)
  const completedCloseSteps = monthlyCloseChecklist.filter(item => item.done).length
  const monthlyCloseProgress = Math.round((completedCloseSteps / monthlyCloseChecklist.length) * 100)
  const activeCloseStep =
    monthlyCloseChecklist.find(item => item.id === activeCloseStepId) ??
    monthlyCloseChecklist.find(item => !item.done) ??
    monthlyCloseChecklist[0]

  const unpaidBills = personalBills.filter(
    bill => bill.status !== BillStatus.paid && bill.status !== BillStatus.cancelled
  )
  const overdueBills = unpaidBills.filter(bill => differenceInDays(parseISO(bill.due_date), new Date()) < 0)
  const billsDueThisWeek = unpaidBills.filter((bill) => {
    const dueDate = parseISO(bill.due_date)
    return !isBefore(dueDate, new Date()) && !isAfter(dueDate, addDays(new Date(), 7))
  })
  const pendingExpenses = personalExpenses.filter(expense => expense.status === ExpenseStatus.submitted)

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
      <div>
        <h1 className="text-2xl font-bold">Money Overview</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name?.split(' ')[0] || 'there'} — here are the financial items that need attention.
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Alpha Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {aiNextSteps.map((step) => (
              <button
                key={step.id}
                onClick={() => router.push(step.href)}
                className="rounded-lg border bg-background p-4 text-left transition-colors hover:bg-accent"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <Badge variant={getPriorityVariant(step.priority)}>
                    {step.priority}
                  </Badge>
                  <Wand2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <h2 className="text-sm font-semibold">{step.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{step.detail}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Monthly Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-semibold">{monthlySummary.headline}</p>
              <p className="mt-2 text-sm text-muted-foreground">{monthlySummary.body}</p>
            </div>
            <div className="space-y-2">
              {monthlySummary.highlights.map((highlight) => (
                <div key={highlight} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                  <span className="text-muted-foreground">{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => router.push(action.href)}
                className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md text-left ${action.cardBg}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <action.icon className={`w-6 h-6 ${action.cardIconColor}`} />
                </div>
                <h3 className="font-medium mb-1">{action.label}</h3>
                <p className="text-sm opacity-80">{action.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {personalDashboardError && (
        <Card>
          <CardContent className="py-4 text-sm text-destructive">
            {personalDashboardError}
          </CardContent>
        </Card>
      )}

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
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Monthly Close
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {completedCloseSteps}/{monthlyCloseChecklist.length} steps ready
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveCloseStepId(activeCloseStep.id)
                  setCloseGuideOpen(true)
                }}
                className="shrink-0 gap-2"
              >
                Start close
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={monthlyCloseProgress} className="mb-4" />
            <div className="space-y-3">
              {monthlyCloseChecklist.map((item) => (
                <button
                  key={item.id}
                  onClick={() => router.push(item.href)}
                  className="flex w-full items-start gap-3 rounded-lg bg-muted/50 p-3 text-left transition-colors hover:bg-accent"
                >
                  {item.done ? (
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                  ) : (
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
                  )}
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{item.label}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{item.detail}</span>
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  {getStatusIcon(activity.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">No recent activity yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {hasCapability(Capability.viewBills) && (
                <>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Overdue Bills</span>
                    <Badge variant="destructive">
                      {accountType === AccountType.personal ? overdueBills.length : 1}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Due This Week</span>
                    <Badge variant="secondary">
                      {accountType === AccountType.personal ? billsDueThisWeek.length : 3}
                    </Badge>
                  </div>
                </>
              )}
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
                  <Badge variant="secondary">
                    {accountType === AccountType.personal ? pendingExpenses.length : 3}
                  </Badge>
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

      <Dialog open={closeGuideOpen} onOpenChange={setCloseGuideOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Guided Monthly Close</DialogTitle>
            <DialogDescription>
              Work through the few checks that keep records clean before month end.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{completedCloseSteps}/{monthlyCloseChecklist.length} steps ready</span>
                <span className="text-muted-foreground">{monthlyCloseProgress}%</span>
              </div>
              <Progress value={monthlyCloseProgress} />
            </div>

            <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-2">
                {monthlyCloseChecklist.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveCloseStepId(item.id)}
                    className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                      activeCloseStep.id === item.id ? 'border-primary bg-primary/5' : 'bg-muted/30 hover:bg-accent'
                    }`}
                  >
                    {item.done ? (
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    ) : (
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
                    )}
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{item.label}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">{item.done ? 'Ready' : 'Needs review'}</span>
                    </span>
                  </button>
                ))}
              </div>

              <div className="rounded-lg border bg-background p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Badge variant={activeCloseStep.done ? 'default' : 'secondary'}>
                    {activeCloseStep.done ? 'Ready' : 'Review'}
                  </Badge>
                  <h2 className="text-sm font-semibold">{activeCloseStep.label}</h2>
                </div>
                <p className="text-sm text-muted-foreground">{activeCloseStep.detail}</p>
                <div className="mt-5 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                  Finish this step in its workspace, then return to the dashboard. Alpha will refresh the close status from your records.
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCloseGuideOpen(false)}>
              Close
            </Button>
            <Button
              type="button"
              onClick={() => router.push(activeCloseStep.href)}
              className="gap-2"
            >
              Open step
              <ArrowRight className="h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
