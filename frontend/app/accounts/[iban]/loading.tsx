import AccountsTableSkeleton from '../../../components/skeletons/accounts-table-skeleton'

export default function LoadingAccount() {
  return (
    <div className="space-y-6">
      <AccountsTableSkeleton />
      <AccountsTableSkeleton />
    </div>
  )
}
