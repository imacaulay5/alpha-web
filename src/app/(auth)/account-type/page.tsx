'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { AccountType, accountTypeLabels } from '@/types/enums'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Briefcase, Building2, Loader2, Check } from 'lucide-react'
import { cn } from '@/components/ui/utils'

const accountTypeOptions = [
  {
    type: AccountType.personal,
    icon: User,
    title: accountTypeLabels[AccountType.personal],
    description: 'Track personal expenses, bills, and simple invoicing for yourself.',
    features: ['Expense tracking', 'Simple invoicing', 'Basic reports'],
  },
  {
    type: AccountType.freelancer,
    icon: Briefcase,
    title: accountTypeLabels[AccountType.freelancer],
    description: 'Full-featured time tracking, project management, and invoicing for independent work.',
    features: ['Time tracking', 'Project & client management', 'Professional invoicing', 'Reports & analytics'],
  },
  {
    type: AccountType.business,
    icon: Building2,
    title: accountTypeLabels[AccountType.business],
    description: 'Complete business management with team collaboration and role-based access.',
    features: ['Everything in Freelancer', 'Team management', 'Role-based access', 'Approvals & workflows'],
  },
]

export default function AccountTypeSelectionPage() {
  const router = useRouter()
  const { setAccountType, isLoading } = useAuth()
  const [selectedType, setSelectedType] = useState<AccountType | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleContinue = async () => {
    if (!selectedType) return

    setError(null)
    const result = await setAccountType(selectedType)
    if (result.error) {
      setError(result.error)
    } else if (selectedType === AccountType.business) {
      router.push('/onboarding')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="w-full max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Choose your account type</h1>
        <p className="text-muted-foreground mt-2">
          Select the option that best describes how you&apos;ll use Alpha
        </p>
      </div>

      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md mb-6 text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {accountTypeOptions.map((option) => {
          const Icon = option.icon
          const isSelected = selectedType === option.type

          return (
            <Card
              key={option.type}
              className={cn(
                'cursor-pointer transition-all hover:border-primary/50',
                isSelected && 'border-primary ring-2 ring-primary ring-offset-2'
              )}
              onClick={() => setSelectedType(option.type)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div
                    className={cn(
                      'p-2 rounded-lg',
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  {isSelected && (
                    <div className="p-1 rounded-full bg-primary">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <CardTitle className="text-lg">{option.title}</CardTitle>
                <CardDescription>{option.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {option.features.map((feature) => (
                    <li key={feature} className="flex items-center text-sm">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleContinue}
          disabled={!selectedType || isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Continue
        </Button>
      </div>
    </div>
  )
}
