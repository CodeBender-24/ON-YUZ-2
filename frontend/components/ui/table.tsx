import clsx from 'clsx'
import type {
  HTMLAttributes,
  TableHTMLAttributes,
  ThHTMLAttributes,
  TdHTMLAttributes
} from 'react'

export function Table({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return <table className={clsx('min-w-full divide-y divide-primary/20 text-left text-sm text-gray-700', className)} {...props} />
}

export function Th({ className, ...props }: ThHTMLAttributes<HTMLTableHeaderCellElement>) {
  return <th className={clsx('px-4 py-3 font-medium text-gray-600', className)} {...props} />
}

export function Td({ className, ...props }: TdHTMLAttributes<HTMLTableDataCellElement>) {
  return <td className={clsx('px-4 py-3 align-middle text-gray-900', className)} {...props} />
}

export function Tr({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={clsx('even:bg-primary/5', className)} {...props} />
}
