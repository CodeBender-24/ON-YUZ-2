import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

type ButtonVariant = 'primary' | 'ghost'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-400 disabled:opacity-50',
  ghost:
    'inline-flex items-center justify-center rounded-md border border-primary/30 bg-white px-4 py-2 text-primary hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary-400 disabled:opacity-50'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', ...props },
  ref
) {
  return <button ref={ref} className={clsx(variantClasses[variant], className)} {...props} />
})
