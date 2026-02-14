'use client'

import { useState, useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet'
import {
  Plus,
  FileText,
  Receipt,
  Clock,
  FolderKanban,
  Users,
  DollarSign,
  Zap
} from 'lucide-react'
import { cn } from './ui/utils'
import { useCapability } from '@/hooks/useCapability'
import { Capability } from '@/types/enums'

interface QuickAction {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  action: () => void
  color: string
  capability?: Capability
}

interface FloatingActionButtonProps {
  onAction?: (actionId: string) => void
}

export function FloatingActionButton({ onAction }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Capability checks
  const canTrackTime = useCapability(Capability.trackTime)
  const canCreateInvoices = useCapability(Capability.createInvoices)
  const canSubmitExpenses = useCapability(Capability.submitExpenses)
  const canCreateProjects = useCapability(Capability.createProjects)
  const canManageClients = useCapability(Capability.manageClients)
  const canInviteTeam = useCapability(Capability.inviteTeamMembers)

  // Define all possible quick actions
  const allActions: QuickAction[] = useMemo(() => [
    {
      id: 'time-entry',
      label: 'Log Time',
      icon: Clock,
      action: () => {
        router.push('/time-entries?action=create')
        onAction?.('time-entry')
      },
      color: 'bg-blue-600 hover:bg-blue-700 text-white',
      capability: Capability.trackTime,
    },
    {
      id: 'invoice',
      label: 'New Invoice',
      icon: FileText,
      action: () => {
        router.push('/invoices?action=create')
        onAction?.('invoice')
      },
      color: 'bg-green-600 hover:bg-green-700 text-white',
      capability: Capability.createInvoices,
    },
    {
      id: 'expense',
      label: 'Add Expense',
      icon: Receipt,
      action: () => {
        router.push('/expenses?action=create')
        onAction?.('expense')
      },
      color: 'bg-orange-600 hover:bg-orange-700 text-white',
      capability: Capability.submitExpenses,
    },
    {
      id: 'project',
      label: 'New Project',
      icon: FolderKanban,
      action: () => {
        router.push('/projects?action=create')
        onAction?.('project')
      },
      color: 'bg-purple-600 hover:bg-purple-700 text-white',
      capability: Capability.createProjects,
    },
    {
      id: 'client',
      label: 'Add Client',
      icon: Users,
      action: () => {
        router.push('/clients?action=create')
        onAction?.('client')
      },
      color: 'bg-cyan-600 hover:bg-cyan-700 text-white',
      capability: Capability.manageClients,
    },
  ], [router, onAction])

  // Get context-aware actions based on current page
  const quickActions = useMemo(() => {
    const capabilityCheck: Record<Capability, boolean> = {
      [Capability.trackTime]: canTrackTime,
      [Capability.createInvoices]: canCreateInvoices,
      [Capability.submitExpenses]: canSubmitExpenses,
      [Capability.createProjects]: canCreateProjects,
      [Capability.manageClients]: canManageClients,
      [Capability.inviteTeamMembers]: canInviteTeam,
    } as Record<Capability, boolean>

    // Filter actions by capability
    const availableActions = allActions.filter(action => {
      if (!action.capability) return true
      return capabilityCheck[action.capability] ?? false
    })

    // Get page-specific primary actions
    const getPageActions = (): string[] => {
      switch (pathname) {
        case '/time-entries':
          return ['time-entry', 'invoice']
        case '/invoices':
          return ['invoice', 'time-entry']
        case '/expenses':
          return ['expense', 'invoice']
        case '/projects':
          return ['project', 'time-entry']
        case '/clients':
          return ['client', 'project']
        case '/team':
          return ['time-entry', 'invoice']
        case '/dashboard':
        default:
          return ['time-entry', 'invoice', 'expense']
      }
    }

    const pageActionIds = getPageActions()

    // Sort actions: page-specific first, then others
    const sortedActions = availableActions.sort((a, b) => {
      const aIndex = pageActionIds.indexOf(a.id)
      const bIndex = pageActionIds.indexOf(b.id)

      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
      if (aIndex !== -1) return -1
      if (bIndex !== -1) return 1
      return 0
    })

    // Return top 3 actions for the current context
    return sortedActions.slice(0, 3)
  }, [pathname, allActions, canTrackTime, canCreateInvoices, canSubmitExpenses, canCreateProjects, canManageClients, canInviteTeam])

  const handleAction = (action: QuickAction) => {
    action.action()
    setIsOpen(false)
  }

  // Don't show FAB if no actions available
  if (quickActions.length === 0) {
    return null
  }

  return (
    <>
      {/* Desktop FAB */}
      <div className="fixed bottom-6 right-6 z-50 hidden md:flex flex-col gap-2">
        {isOpen && (
          <div className="flex flex-col gap-2 animate-in slide-in-from-bottom-2">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                onClick={() => handleAction(action)}
                size="lg"
                className={cn(
                  'h-12 w-12 rounded-full shadow-lg transition-all duration-200 hover:scale-105',
                  action.color
                )}
                title={action.label}
              >
                <action.icon className="h-5 w-5" />
                <span className="sr-only">{action.label}</span>
              </Button>
            ))}
          </div>
        )}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className={cn(
            'h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all duration-200',
            isOpen ? 'rotate-45' : 'hover:scale-105'
          )}
        >
          <Plus className="h-6 w-6" />
          <span className="sr-only">Quick Actions</span>
        </Button>
      </div>

      {/* Mobile Sheet */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105"
            >
              <Zap className="h-6 w-6" />
              <span className="sr-only">Quick Actions</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto">
            <SheetHeader className="text-left">
              <SheetTitle>Quick Actions</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-3 gap-3 mt-6 mb-4">
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  onClick={() => handleAction(action)}
                  size="lg"
                  className={cn(
                    'h-20 flex-col gap-2 transition-all duration-200',
                    action.color
                  )}
                >
                  <action.icon className="h-6 w-6" />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
