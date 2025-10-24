const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {})
    },
    cache: 'no-store'
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Bilinmeyen hata' }))
    const message = data?.error || data?.detail || res.statusText
    throw new Error(message)
  }

  return res.json() as Promise<T>
}

export interface AccountDTO {
  full_name: string
  iban: string
  balance: string
  created_at: string
}

export interface TransferDTO {
  id: number
  amount: string
  from_full_name?: string
  from_iban?: string
  to_full_name?: string
  to_iban?: string
  created_at: string
}

export interface AccountDetailDTO {
  account: AccountDTO
  transfers: TransferDTO[]
}

export async function getAccounts(): Promise<AccountDTO[]> {
  return fetchJSON<AccountDTO[]>('/api/accounts')
}

export async function getAccountDetail(iban: string): Promise<AccountDetailDTO> {
  return fetchJSON<AccountDetailDTO>(`/api/accounts/${iban}`)
}

export async function getTransfers(limit: number, offset: number): Promise<TransferDTO[]> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) })
  return fetchJSON<TransferDTO[]>(`/api/transfers?${params.toString()}`)
}

export interface TransferCreateDTO {
  fromIban: string
  toIban: string
  amount: string
}

export interface TransferCreatedDTO {
  id: number
}

export interface ApiError {
  error: string
}

export async function createTransfer(payload: TransferCreateDTO): Promise<TransferCreatedDTO> {
  return fetchJSON<TransferCreatedDTO>('/api/transfers', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}
