import { notFound } from 'next/navigation'
import Link from 'next/link'

import { getAccountDetail } from '../../../lib/api'
import { formatCurrency, formatDate } from '../../../lib/format'
import { Card } from '../../../components/ui/card'
import { Table, Td, Th, Tr } from '../../../components/ui/table'

interface AccountPageProps {
  params: { iban: string }
}

export const dynamic = 'force-dynamic'

export default async function AccountPage({ params }: AccountPageProps) {
  const { iban } = params

  let detail
  try {
    detail = await getAccountDetail(iban)
  } catch (error) {
    notFound()
  }

  const { account, transfers } = detail

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{account.full_name}</h2>
            <p className="font-mono text-sm text-gray-600">{account.iban}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Bakiye</p>
            <p className="text-lg font-semibold text-primary">{formatCurrency(account.balance)}</p>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Oluşturulma: {formatDate(account.created_at)}
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Son 20 Transfer</h3>
          <Link
            href={`/transfer?from=${account.iban}`}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-400"
          >
            Para Gönder
          </Link>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <thead className="bg-primary/10">
              <Tr>
                <Th>ID</Th>
                <Th>Tutar</Th>
                <Th>Gönderen</Th>
                <Th>Alıcı</Th>
                <Th>Tarih</Th>
              </Tr>
            </thead>
            <tbody>
              {transfers.map((transfer) => (
                <Tr key={transfer.id}>
                  <Td>#{transfer.id}</Td>
                  <Td>{formatCurrency(transfer.amount)}</Td>
                  <Td>
                    <div className="text-sm text-gray-900">{transfer.from_full_name}</div>
                    <div className="font-mono text-xs text-gray-500">{transfer.from_iban}</div>
                  </Td>
                  <Td>
                    <div className="text-sm text-gray-900">{transfer.to_full_name}</div>
                    <div className="font-mono text-xs text-gray-500">{transfer.to_iban}</div>
                  </Td>
                  <Td>{formatDate(transfer.created_at)}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
          {transfers.length === 0 && (
            <div className="py-8 text-center text-sm text-gray-500">Bu hesap için henüz transfer bulunmuyor.</div>
          )}
        </div>
      </Card>
    </div>
  )
}
