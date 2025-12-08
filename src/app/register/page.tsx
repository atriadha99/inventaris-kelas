'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    secretCode: '' // Fitur keamanan sederhana
  });
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // 1. Validasi Kode Sekolah (Agar siswa iseng tidak bisa daftar)
    // Ganti 'GURU123' dengan kode terserah Anda
    if (formData.secretCode !== 'GURU123') {
      setErrorMsg('Kode Sekolah salah! Hubungi Kepala Sekolah.');
      setLoading(false);
      return;
    }

    // 2. Daftar ke Supabase
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.name, // Simpan nama lengkap
        },
      },
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      alert('Pendaftaran Berhasil! Silakan login.');
      router.push('/login'); // Lempar ke halaman login
    }
    
    setLoading(false);
  };

  return (
    <div className="d-flex min-vh-100 align-items-center justify-content-center bg-light">
      <div className="card shadow-lg border-0" style={{ maxWidth: '450px', width: '100%' }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <div style={{ fontSize: '3rem' }}>📝</div>
            <h3 className="fw-bold mt-2">Daftar Akun Baru</h3>
            <p className="text-muted small">Khusus Guru & Staff TU</p>
          </div>

          {errorMsg && (
            <div className="alert alert-danger text-center p-2 small mb-3">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="mb-3">
              <label className="form-label fw-bold small">Nama Lengkap</label>
              <input
                type="text"
                className="form-control"
                placeholder="Budi Santoso, S.Kom"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold small">Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="nama@sekolah.id"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold small">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Minimal 6 karakter"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            {/* Field Kode Rahasia */}
            <div className="mb-4">
              <label className="form-label fw-bold small text-danger">Kode Sekolah (Token)</label>
              <input
                type="text"
                className="form-control border-danger"
                placeholder="Masukkan Token Guru..."
                required
                value={formData.secretCode}
                onChange={(e) => setFormData({...formData, secretCode: e.target.value})}
              />
              <div className="form-text text-muted small">
                *Minta kode ini ke Kepala Lab/IT Support.
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-success w-100 py-2 fw-bold" 
              disabled={loading}
            >
              {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
            </button>
          </form>

          <div className="text-center mt-4 pt-3 border-top">
            <p className="small text-muted mb-1">Sudah punya akun?</p>
            <Link href="/login" className="text-decoration-none fw-bold">
              Login disini &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}