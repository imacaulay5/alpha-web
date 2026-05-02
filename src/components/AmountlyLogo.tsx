import { cn } from '@/components/ui/utils'

type AmountlyLogoProps = {
  className?: string
}

export function AmountlyLogo({ className }: AmountlyLogoProps) {
  return (
    <span
      className={cn('relative inline-flex h-9 w-9 overflow-hidden', className)}
      aria-hidden="true"
    >
      <img
        src="/amountly-logo-light.png"
        alt=""
        className="h-full w-full object-contain dark:hidden"
      />
      <img
        src="/amountly-logo-dark.png"
        alt=""
        className="hidden h-full w-full object-contain dark:block"
      />
    </span>
  )
}
