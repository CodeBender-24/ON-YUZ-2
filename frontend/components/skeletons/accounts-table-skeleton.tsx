export default function AccountsTableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-12 w-full animate-pulse rounded-md bg-primary/10" />
      ))}
    </div>
  )
}
