'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg('Login gagal: Email atau password salah.');
      setLoading(false);
    } else {
      // Jika sukses, arahkan ke dashboard
      router.push('/dashboard');
      router.refresh(); // Refresh agar session terbaca
    }
  };

  return (
    <div className="d-flex min-vh-100 align-items-center justify-content-center bg-light">
      <div className="card shadow-lg border-0" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="card-body p-5">
          
          {/* HEADER */}
          <div className="text-center mb-4">
            <div style={{ fontSize: '3rem' }}>🔐</div>
            <h3 className="fw-bold mt-2">Login Admin</h3>
            <p className="text-muted small">Sistem Informasi Manajemen Inventaris</p>
          </div>

          {/* ALERT ERROR */}
          {errorMsg && (
            <div className="alert alert-danger text-center p-2 small mb-3">
              {errorMsg}
            </div>
          )}

          {/* FORM LOGIN */}
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label fw-bold small">Email Sekolah</label>
              <input
                type="email"
                className="form-control"
                placeholder="admin@sekolah.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold small">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-100 py-2 fw-bold" 
              disabled={loading}
            >
              {loading ? 'Memproses...' : 'Masuk Dashboard'}
            </button>
          </form>

          {/* LINK REGISTER (YANG BARU DITAMBAHKAN) */}
          <div className="text-center mt-3">
            <Link href="/register" className="text-decoration-none small text-muted">
              Belum punya akun? <span className="text-primary fw-bold">Daftar Guru Baru</span>
            </Link>
          </div>

          {/* FOOTER LINK */}
          <div className="text-center mt-4 pt-3 border-top">
            <Link href="/" className="text-decoration-none text-muted small">
              &larr; Kembali ke Halaman Utama
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}