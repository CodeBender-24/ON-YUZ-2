export function formatCurrency(value: string | number): string {
  const amount = typeof value === 'string' ? Number(value) : value
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount)
}

export function formatDate(value: string): string {
  const date = new Date(value)
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}
