'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useAppState, type TabId } from '@/contexts/AppStateContext'
import { cn } from '@/components/ui/utils'
import {
  LayoutDashboard,
  Clock,
  FileText,
  Receipt,
  FolderKanban,
  Users,
  UserCog,
  Settings,
  Moon,
  Sun,
  LogOut,
  ChevronDown,
  Loader2,
  PanelLeft,
  CreditCard,
  BookOpen,
  Calculator,
  Banknote,
  Package,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from 'next-themes'
import { FloatingActionButton } from '@/components/FloatingActionButton'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Clock,
  FileText,
  Receipt,
  FolderKanban,
  Users,
  UserCog,
  Settings,
  CreditCard,
  BookOpen,
  Calculator,
  Banknote,
  Package,
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { logout, user, isLoading, isAuthenticated } = useAuth()
  const { visibleTabs, organization } = useAppState()
  const { theme, setTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const getActiveTab = (): TabId | null => {
    const tab = visibleTabs.find((t) => t.path === pathname)
    return tab?.id ?? null
  }

  const activeTab = getActiveTab()

  const getUserInitials = () => {
    if (!user?.name) return '?'
    return user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <aside
        className={cn(
          'shrink-0 border-r bg-sidebar flex flex-col overflow-hidden transition-all duration-300 ease-in-out',
          sidebarOpen ? 'w-64' : 'w-0 border-r-0'
        )}
      >
        <div className="w-64 flex flex-col h-full">
          <div className="flex items-center gap-2 px-4 py-4 border-b">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              A
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Alpha</span>
              <span className="truncate text-xs text-muted-foreground">
                {organization?.name || 'Personal'}
              </span>
            </div>
          </div>
          <nav className="flex-1 overflow-auto p-2">
            <div className="text-xs font-medium text-muted-foreground px-2 py-2">
              Navigation
            </div>
            <ul className="space-y-1">
              {visibleTabs.map((tab) => {
                const Icon = iconMap[tab.icon] || LayoutDashboard
                return (
                  <li key={tab.id}>
                    <button
                      onClick={() => router.push(tab.path)}
                      className={cn(
                        'flex items-center gap-3 w-full rounded-md px-2 py-2 text-sm transition-colors',
                        'hover:bg-accent hover:text-accent-foreground',
                        activeTab === tab.id &&
                          'bg-accent text-accent-foreground font-medium'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>
          <div className="p-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="w-full gap-2"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
          <div className="flex h-full items-center px-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-7 w-7"
            >
              <PanelLeft className="h-4 w-4" />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
            <div className="flex-1" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar_url} />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline-block">{user?.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.name}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      <FloatingActionButton />
    </div>
  )
}
