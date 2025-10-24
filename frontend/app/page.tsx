import AccountsView from '../components/accounts-view'

export default function HomePage() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-primary/20 bg-white p-6 shadow-sm">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Alternatif Bank Demo</h1>
        <p className="mt-2 text-gray-600">
          Bu proje Alternatif Bank deneyimini yerel ortamda taklit eden bir demo uygulamasıdır.
        </p>
      </section>
      <AccountsView />
    </div>
  )
}
