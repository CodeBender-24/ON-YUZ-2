import Link from 'next/link'

export default function AccountNotFound() {
  return (
    <div className="rounded-md border border-primary/20 bg-white p-6 text-center text-sm text-gray-600">
      Hesap bulunamadı.
      <div className="mt-4">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-400"
        >
          Hesaplara dön
        </Link>
      </div>
    </div>
  )
}
