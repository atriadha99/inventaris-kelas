'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr'; // Library koneksi client
import InventoryChart from "@/components/InventoryChart";

// Tipe data sesuaikan dengan Supabase
type Item = {
  id: number;
  name: string;
  code: string;
  condition: string;
  status: string;
};

export default function InventoryDashboard() {
  // --- KONEKSI SUPABASE ---
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // --- STATE ---
  const [items, setItems] = useState<Item[]>([]); // Kosongkan dulu
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  
  // State Form
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    condition: 'Baik',
    status: 'Tersedia'
  });

  // --- 1. READ (Ambil Data) ---
  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('id', { ascending: false }); // Urutkan dari yang terbaru
    
    if (error) console.error('Error fetch:', error);
    else setItems(data || []);
    
    setLoading(false);
  };

  // Jalankan fetchItems saat halaman pertama kali dibuka
  useEffect(() => {
    fetchItems();
  }, []);

  // --- HANDLERS ---

  const handleAddNew = () => {
    setIsEditing(false);
    setFormData({ name: '', code: '', condition: 'Baik', status: 'Tersedia' });
    setShowModal(true);
  };

  const handleEdit = (item: Item) => {
    setIsEditing(true);
    setCurrentItem(item);
    setFormData({ 
      name: item.name, 
      code: item.code, 
      condition: item.condition, 
      status: item.status 
    });
    setShowModal(true);
  };

  // --- 2. DELETE (Hapus Data) ---
  const handleDelete = async (id: number) => {
    if (confirm('Yakin ingin menghapus barang ini secara permanen?')) {
      const { error } = await supabase.from('items').delete().eq('id', id);
      
      if (!error) {
        fetchItems(); // Refresh tabel
      } else {
        alert('Gagal menghapus: ' + error.message);
      }
    }
  };

  // --- 3. CREATE & UPDATE (Simpan Data) ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && currentItem) {
      // UPDATE KE SUPABASE
      const { error } = await supabase
        .from('items')
        .update(formData) // Kirim data form
        .eq('id', currentItem.id); // Cari berdasarkan ID

      if (error) alert('Gagal update: ' + error.message);

    } else {
      // INSERT (CREATE) KE SUPABASE
      const { error } = await supabase
        .from('items')
        .insert([formData]); // Insert data baru

      if (error) alert('Gagal simpan: ' + error.message);
    }

    setShowModal(false);
    fetchItems(); // Refresh data otomatis agar tampil di tabel
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Dashboard Inventaris</h2>
          <p className="text-muted">Database Terhubung: Supabase Cloud</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddNew}>
          + Tambah Barang
        </button>
      </div>

      <InventoryChart />

      <div className="card shadow-sm mt-4">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-bold">📋 Daftar Barang (Realtime)</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Nama Barang</th>
                  <th>Kode</th>
                  <th>Kondisi</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-5">⏳ Mengambil data dari database...</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-5">Belum ada data di database. Silakan tambah barang.</td></tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id}>
                      <td className="ps-4 fw-bold">{item.name}</td>
                      <td><code>{item.code}</code></td>
                      <td>
                        <span className={`badge rounded-pill ${
                          item.condition === 'Baik' ? 'bg-success' : 
                          item.condition === 'Rusak Ringan' ? 'bg-warning text-dark' : 'bg-danger'
                        }`}>
                          {item.condition}
                        </span>
                      </td>
                      <td>
                        <span className={`fw-bold ${item.status === 'Tersedia' ? 'text-primary' : 'text-muted'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <button className="btn btn-sm btn-outline-info me-2" onClick={() => handleEdit(item)}>
                          ✏️ Edit
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item.id)}>
                          🗑️ Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL FORM (Sama seperti sebelumnya) */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {isEditing ? 'Edit Data Database' : 'Input Data Baru'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nama Barang</label>
                    <input type="text" className="form-control" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Kode Barang</label>
                    <input type="text" className="form-control" required value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} />
                  </div>
                  <div className="row">
                    <div className="col-6 mb-3">
                      <label className="form-label">Kondisi</label>
                      <select className="form-select" value={formData.condition} onChange={(e) => setFormData({...formData, condition: e.target.value})}>
                        <option value="Baik">Baik</option>
                        <option value="Rusak Ringan">Rusak Ringan</option>
                        <option value="Rusak Berat">Rusak Berat</option>
                      </select>
                    </div>
                    <div className="col-6 mb-3">
                      <label className="form-label">Status</label>
                      <select className="form-select" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                        <option value="Tersedia">Tersedia</option>
                        <option value="Dipinjam">Dipinjam</option>
                        <option value="Habis">Habis</option>
                        <option value="Gudang">Gudang</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                  <button type="submit" className="btn btn-primary">Simpan ke Database</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}