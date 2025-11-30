import Link from "next/link";
// import { createClient } from "@/utils/supabase/server"; // Buka komentar jika supabase sudah siap

export default async function Home() {
  // const supabase = await createClient();
  // const { data: { user } } = await supabase.auth.getUser();
  const user = { email: "admin@sekolah.id", role: "admin" };

  return (
    <main className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="container text-center">
        <div className="card shadow-lg border-0 p-5 mx-auto" style={{ maxWidth: "600px" }}>
          
          <div className="mb-4">
            <span style={{ fontSize: "4rem" }}>📦</span>
          </div>

          <h1 className="display-5 fw-bold text-dark mb-3">
            Sistem Inventaris <span className="text-primary">Kelas</span>
          </h1>

          <p className="lead text-muted mb-5">
            Platform manajemen sarana belajar yang efisien. Pantau kondisi barang, 
            lakukan peminjaman, dan lapor kerusakan untuk mata kuliah SIM.
          </p>

          <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
            {user ? (
              <Link href="/dashboard" className="btn btn-primary btn-lg px-4 gap-3">
                Buka Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn btn-primary btn-lg px-4">
                  Login Guru/Admin
                </Link>
                <Link href="/dashboard" className="btn btn-outline-secondary btn-lg px-4">
                  Lihat Inventaris (Siswa)
                </Link>
              </>
            )}
          </div>
          
        </div>
        
        <footer className="mt-5 text-muted small">
          &copy; {new Date().getFullYear()} SMK IT Project - Tugas SIM
        </footer>
      </div>
    </main>
  );
}