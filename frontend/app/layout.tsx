import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'Alternatif Bank Demo',
  description: 'Bu proje Alternatif Bank deneyimini yerel ortamda taklit eden bir demo uygulamasıdır.'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-white text-gray-900">
        <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-6">
          <header className="mb-8 flex flex-col gap-4 border-b border-primary/20 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="text-2xl font-semibold text-gray-900 hover:text-primary">
              Alternatif Bank Demo
            </Link>
            <nav className="flex flex-wrap gap-3 text-sm font-medium">
              <Link href="/" className="text-primary hover:underline">
                Hesaplar
              </Link>
              <Link href="/transfer" className="text-primary hover:underline">
                Para Gönder
              </Link>
              <Link href="/transfers" className="text-primary hover:underline">
                Transferler
              </Link>
            </nav>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="mt-10 text-sm text-gray-500">
            © {new Date().getFullYear()} Alternatif Bank Demo
          </footer>
        </div>
      </body>
    </html>
  )
}
