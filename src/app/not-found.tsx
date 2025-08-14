export default function NotFound() {
  return (
    <main className="flex h-[60vh] flex-col items-center justify-center text-center p-6">
      <h1 className="text-4xl font-bold mb-4">Halaman Tidak Ditemukan</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
      </p>
      <a
        href="/dashboard"
        className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition hover:opacity-90"
      >
        Kembali ke Dashboard
      </a>
    </main>
  );
}
