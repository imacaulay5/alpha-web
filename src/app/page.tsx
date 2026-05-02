'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, CheckCircle2, FileText, ReceiptText, Search } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { AmountlyLogo } from '@/components/AmountlyLogo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const workflows = [
  {
    icon: ReceiptText,
    title: 'Bills and expenses',
    detail: 'Track what was paid, what is due, and what needs a receipt.',
  },
  {
    icon: FileText,
    title: 'Invoices and follow-ups',
    detail: 'Keep receivables and payment reminders visible without digging.',
  },
  {
    icon: CheckCircle2,
    title: 'Tax-ready records',
    detail: 'Prepare clean exports once income and expenses are categorized.',
  },
]

function ProductSnapshot() {
  const previewRows = [
    ['Bills', '$2,840 due', '3 upcoming payments'],
    ['Expenses', '$615 this month', '4 need categories'],
    ['Invoices', '$4,200 open', '2 ready for follow-up'],
    ['Tax records', 'Ready export', 'Income and expenses sorted'],
  ]

  return (
    <Card className="bg-card/80">
      <CardHeader>
        <CardTitle className="text-lg">
          Workspace preview
        </CardTitle>
        <p className="text-sm leading-6 text-muted-foreground">
          The everyday money tasks in one clean place.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-lg border bg-background">
          {previewRows.map(([label, value, detail]) => (
            <div
              key={label}
              className="grid gap-1 border-b p-4 last:border-b-0 sm:grid-cols-[7rem_1fr]"
            >
              <div className="text-sm font-medium text-muted-foreground">{label}</div>
              <div>
                <div className="text-sm font-semibold">{value}</div>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{detail}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-lg border bg-background p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Search className="h-4 w-4 text-muted-foreground" />
            Financial Search
          </div>
          <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            Search overdue bills, tax expenses, receipts...
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function HomePage() {
  const router = useRouter()
  const { recoveryPath, isAuthenticated, isLoading, session } = useAuth()

  useEffect(() => {
    if (isLoading) return

    if (isAuthenticated) {
      router.replace('/dashboard')
      return
    }

    if (session && recoveryPath) {
      router.replace(recoveryPath)
    }
  }, [isAuthenticated, isLoading, recoveryPath, router, session])

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3" aria-label="Amountly home">
            <AmountlyLogo />
            <span className="text-lg font-semibold">Amountly</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Button asChild variant="ghost" className="h-9 px-3">
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild className="h-9 px-4">
              <Link href="/signup">Get started</Link>
            </Button>
          </nav>
        </header>

        <section className="grid flex-1 items-center gap-8 py-14 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="max-w-xl">
            <h1 className="text-4xl font-bold leading-tight tracking-normal sm:text-5xl">
              Know what needs attention next.
            </h1>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              Amountly is a simple accounting workspace for bills, expenses, invoices, and tax prep. It keeps the next financial action clear without turning your day into accounting work.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-11 px-5">
                <Link href="/signup">
                  Create your workspace
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 px-5">
                <Link href="/login">Log In</Link>
              </Button>
            </div>
          </div>

          <ProductSnapshot />
        </section>

        <section className="grid gap-4 pb-10 md:grid-cols-3">
          {workflows.map((workflow) => (
            <Card key={workflow.title}>
              <CardContent className="p-5">
                <workflow.icon className="h-5 w-5 text-muted-foreground" />
                <h2 className="mt-4 text-base font-semibold">{workflow.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{workflow.detail}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </main>
  )
}
