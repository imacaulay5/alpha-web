'use client'

import Link from 'next/link'
import { ArrowRight, LockKeyhole } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type DeferredModuleKey, deferredModuleDetails } from '@/lib/product-scope'

type DeferredModuleNoticeProps = {
  moduleKey: DeferredModuleKey
}

export function DeferredModuleNotice({ moduleKey }: DeferredModuleNoticeProps) {
  const details = deferredModuleDetails[moduleKey]

  return (
    <div className="p-6">
      <Card className="mx-auto max-w-3xl border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="mb-3 flex items-center gap-2">
            <Badge variant="secondary">Future module</Badge>
            <LockKeyhole className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">{details.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-muted-foreground">{details.description}</p>
          <div className="rounded-lg bg-background p-4">
            <p className="text-sm font-medium">V1 focus instead</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {details.focus.map((item) => (
                <div key={item} className="rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/dashboard">
                Back to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/tax">Open Tax Prep</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/expenses">Open Expenses</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
