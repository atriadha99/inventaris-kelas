import Link from "next/link";
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function Home() {
  // --- PERBAIKAN DISINI ---
  // Di Next.js 15+, cookies() harus menggunakan 'await'
  const cookieStore = await cookies(); 
  
  // Setup client sederhana untuk cek session (Safe Mode)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
      },
    }
  )
  
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="d-flex flex-column min-vh-100 bg-white">
      
      {/* 1. NAVBAR */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom py-3">
        <div className="container">
          <Link href="/" className="navbar-brand fw-bold d-flex align-items-center gap-2">
            <span style={{ fontSize: '1.5rem' }}>🏫</span>
            <span>SIM Inventaris</span>
          </Link>
          <div>
            {user ? (
               <Link href="/dashboard" className="btn btn-outline-primary fw-bold">
                 Dashboard Saya
               </Link>
            ) : (
               <Link href="/login" className="btn btn-primary fw-bold px-4">
                 Login Staff
               </Link>
            )}
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <header className="py-5 bg-light border-bottom mb-4">
        <div className="container py-5 text-center">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="mb-3" style={{ fontSize: '4rem' }}>📦📊</div>
              <h1 className="fw-bold display-5 mb-3 text-dark">
                Sistem Informasi Manajemen <br />
                <span className="text-primary">Inventaris Kelas</span>
              </h1>
              <p className="lead text-muted mb-4">
                Solusi digital untuk memantau, mengelola, dan melaporkan kondisi sarana prasarana sekolah secara 
                <span className="fw-bold text-dark"> Realtime</span>, 
                <span className="fw-bold text-dark"> Efisien</span>, dan 
                <span className="fw-bold text-dark"> Transparan</span>.
              </p>
              
              <div className="d-flex gap-3 justify-content-center">
                {user ? (
                  <Link href="/dashboard" className="btn btn-primary btn-lg px-5 shadow-sm">
                    Akses Dashboard &rarr;
                  </Link>
                ) : (
                  <>
                    <Link href="/login" className="btn btn-primary btn-lg px-4 shadow-sm">
                      Login Admin / Guru
                    </Link>
                    <Link href="/dashboard" className="btn btn-outline-secondary btn-lg px-4 shadow-sm">
                      Lihat Data (Tamu)
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 3. FEATURES SECTION */}
      <section className="container py-5">
        <div className="row g-4 text-center">
          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm p-3">
              <div className="card-body">
                <div className="display-6 mb-3">⚡</div>
                <h5 className="card-title fw-bold">Realtime Tracking</h5>
                <p className="card-text text-muted">
                  Pantau ketersediaan barang di setiap kelas secara langsung. Status berubah detik itu juga saat diupdate.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm p-3">
              <div className="card-body">
                <div className="display-6 mb-3">📝</div>
                <h5 className="card-title fw-bold">Pelaporan Kerusakan</h5>
                <p className="card-text text-muted">
                  Fitur pencatatan kondisi barang (Baik/Rusak) untuk mendukung pengambilan keputusan perbaikan.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm p-3">
              <div className="card-body">
                <div className="display-6 mb-3">🔒</div>
                <h5 className="card-title fw-bold">Database Cloud</h5>
                <p className="card-text text-muted">
                  Data tersimpan aman di Supabase (PostgreSQL). Tidak ada lagi data hilang karena pembukuan manual.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FOOTER */}
      <footer className="mt-auto py-4 bg-white border-top text-center">
        <div className="container">
          <p className="text-muted mb-0">
            &copy; {new Date().getFullYear()} SMK IT Project. Dibuat untuk Tugas Sistem Informasi Manajemen.
          </p>
        </div>
      </footer>
    </div>
  );
}