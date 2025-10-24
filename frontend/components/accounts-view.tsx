'use client'

import Link from 'next/link'
import useSWR from 'swr'
import { useMemo, useState } from 'react'

import { getAccounts } from '../lib/api'
import { formatCurrency, formatDate } from '../lib/format'
import { Card } from './ui/card'
import { Table, Td, Th, Tr } from './ui/table'
import AccountsTableSkeleton from './skeletons/accounts-table-skeleton'

export default function AccountsView() {
  const { data, error, isLoading } = useSWR('accounts', () => getAccounts())
  const [search, setSearch] = useState('')
  const [createdAtAsc, setCreatedAtAsc] = useState(false)

  const filteredAccounts = useMemo(() => {
    if (!data) return []
    const term = search.trim().toLowerCase()
    const items = data.filter((account) => {
      if (!term) return true
      return (
        account.full_name.toLowerCase().includes(term) ||
        account.iban.toLowerCase().includes(term)
      )
    })

    return items.sort((a, b) => {
      const aDate = new Date(a.created_at).getTime()
      const bDate = new Date(b.created_at).getTime()
      return createdAtAsc ? aDate - bDate : bDate - aDate
    })
  }, [data, search, createdAtAsc])

  const hasSearch = search.trim().length > 0
  const hasLoaded = !isLoading && !!data

  return (
    <Card>
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <label className="w-full md:max-w-xs">
          <span className="sr-only">Ara</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Ad veya IBAN ile ara"
            className="w-full rounded-md border border-primary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            aria-label="Hesap ara"
          />
        </label>
        <Link
          href="/transfer"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-400"
        >
          Para Gönder
        </Link>
      </div>
      <div className="overflow-x-auto">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700" role="alert">
            {error.message}
          </div>
        )}
        {isLoading ? (
          <AccountsTableSkeleton />
        ) : (
          <Table>
            <thead className="bg-primary/10">
              <Tr>
                <Th scope="col">Ad Soyad</Th>
                <Th scope="col">IBAN</Th>
                <Th scope="col" className="cursor-pointer">
                  Bakiye
                </Th>
                <Th scope="col">
                  <button
                    type="button"
                    onClick={() => setCreatedAtAsc((prev) => !prev)}
                    className="flex items-center gap-1 text-left text-gray-600 hover:text-primary"
                    aria-label={`Oluşturulma tarihine göre ${createdAtAsc ? 'azalan' : 'artan'} sırala`}
                  >
                    Oluşturulma
                    <span aria-hidden>{createdAtAsc ? '▴' : '▾'}</span>
                  </button>
                </Th>
                <Th scope="col">Aksiyonlar</Th>
              </Tr>
            </thead>
            <tbody>
              {filteredAccounts.map((account) => (
                <Tr key={account.iban} className="hover:bg-primary/5">
                  <Td className="font-medium">{account.full_name}</Td>
                  <Td className="font-mono">{account.iban}</Td>
                  <Td>{formatCurrency(account.balance)}</Td>
                  <Td>{formatDate(account.created_at)}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/accounts/${account.iban}`}
                        className="inline-flex items-center justify-center rounded-md border border-primary/30 bg-white px-4 py-2 text-primary hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary-400"
                      >
                        Detay
                      </Link>
                      <Link
                        href={`/transfer?from=${account.iban}`}
                        className="inline-flex items-center justify-center rounded-md border border-primary/30 bg-white px-4 py-2 text-primary hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary-400"
                      >
                        Para Gönder
                      </Link>
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
        {hasLoaded && filteredAccounts.length === 0 && (
          <div className="py-8 text-center text-sm text-gray-500">
            {hasSearch ? 'Aramanızla eşleşen hesap bulunamadı.' : 'Henüz hesap bulunmuyor.'}
          </div>
        )}
      </div>
    </Card>
  )
}
