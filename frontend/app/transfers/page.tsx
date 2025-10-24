import Link from 'next/link'

import { getTransfers } from '../../lib/api'
import { formatCurrency, formatDate } from '../../lib/format'
import { Card } from '../../components/ui/card'
import { Table, Td, Th, Tr } from '../../components/ui/table'

interface TransfersPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

const PAGE_SIZE = 20

export const dynamic = 'force-dynamic'

export default async function TransfersPage({ searchParams }: TransfersPageProps) {
  const pageParam = Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page
  const highlightParam = Array.isArray(searchParams.highlight)
    ? searchParams.highlight[0]
    : searchParams.highlight
  const page = pageParam ? Math.max(1, Number(pageParam)) : 1
  const offset = (page - 1) * PAGE_SIZE

  const transfers = await getTransfers(PAGE_SIZE, offset)
  const highlightId = highlightParam ? Number(highlightParam) : null
  const baseLinkClass =
    'inline-flex items-center justify-center rounded-md border border-primary/30 bg-white px-4 py-2 text-primary hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary-400 disabled:opacity-50'
  const prevDisabled = page <= 1
  const nextDisabled = transfers.length < PAGE_SIZE

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Transferler</h2>
        <Link
          href="/transfer"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-400"
        >
          Yeni Transfer
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
            {transfers.map((transfer) => {
              const isHighlighted = highlightId === transfer.id
              return (
                <Tr
                  key={transfer.id}
                  className={isHighlighted ? 'bg-primary/5 font-semibold' : 'hover:bg-primary/5'}
                  aria-live={isHighlighted ? 'polite' : undefined}
                >
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
              )
            })}
          </tbody>
        </Table>
        {transfers.length === 0 && (
          <div className="py-8 text-center text-sm text-gray-500">Henüz transfer bulunmuyor.</div>
        )}
      </div>
      <div className="mt-6 flex items-center justify-between">
        <Link
          className={`${baseLinkClass} ${prevDisabled ? 'pointer-events-none opacity-50' : ''}`}
          aria-disabled={prevDisabled}
          tabIndex={prevDisabled ? -1 : undefined}
          href={prevDisabled ? '#' : `/transfers?page=${page - 1}`}
          aria-label="Önceki sayfa"
        >
          Önceki
        </Link>
        <span className="text-sm text-gray-600">Sayfa {page}</span>
        <Link
          className={`${baseLinkClass} ${nextDisabled ? 'pointer-events-none opacity-50' : ''}`}
          aria-disabled={nextDisabled}
          tabIndex={nextDisabled ? -1 : undefined}
          href={nextDisabled ? '#' : `/transfers?page=${page + 1}`}
          aria-label="Sonraki sayfa"
        >
          Sonraki
        </Link>
      </div>
    </Card>
  )
}
