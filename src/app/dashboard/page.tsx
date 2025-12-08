'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import InventoryChart from "@/components/InventoryChart";

// Tipe Data Barang
type Item = {
  id: string;
  name: string;
  code: string;
  condition: string;
  status: string;
};

// Tipe Data Peminjaman (Join dengan Barang)
type Loan = {
  id: number;
  borrower_name: string;
  borrower_class: string;
  duration: number;
  loan_date: string;
  status: string;
  items: { // Hasil Join
    name: string;
    code: string;
  } | null;
  item_id: string;
};

export default function InventoryDashboard() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // --- STATE ---
  const [items, setItems] = useState<Item[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]); // State untuk data peminjam
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // State Modal Admin
  const [showItemModal, setShowItemModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [itemForm, setItemForm] = useState({ name: '', code: '', condition: 'Baik', status: 'Tersedia' });

  // State Modal Tamu
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [loanForm, setLoanForm] = useState({ borrower_name: '', borrower_class: '', duration: 1 });
  const [selectedLoanItem, setSelectedLoanItem] = useState<Item | null>(null);

  // --- FETCH DATA ---
  
  // 1. Ambil Data Barang
  const fetchItems = useCallback(async () => {
    const { data } = await supabase.from('items').select('*').order('created_at', { ascending: false });
    setItems(data || []);
  }, [supabase]);

  // 2. Ambil Data Peminjaman (Khusus Admin)
  const fetchLoans = useCallback(async () => {
    // Syntax select('*, items(*)') adalah cara Supabase melakukan JOIN tabel
    const { data, error } = await supabase
      .from('loans')
      .select('*, items(name, code)')
      .eq('status', 'Pending') // Hanya ambil yang statusnya masih dipinjam
      .order('id', { ascending: false });

    if (error) console.error("Error ambil loans:", error);
    else setLoans(data as unknown as Loan[] || []);
  }, [supabase]);

  // Init Data
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      await fetchItems();
      if (user) await fetchLoans(); // Hanya ambil data pinjaman jika admin
      
      setLoading(false);
    };
    init();
  }, [fetchItems, fetchLoans, supabase]);

  // --- LOGIC LOGOUT ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  // --- LOGIC BARANG (ADMIN) ---
  const handleAddNew = () => { setIsEditing(false); setItemForm({ name: '', code: '', condition: 'Baik', status: 'Tersedia' }); setShowItemModal(true); };
  const handleEdit = (item: Item) => { setIsEditing(true); setCurrentItem(item); setItemForm({ name: item.name, code: item.code, condition: item.condition, status: item.status }); setShowItemModal(true); };
  
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && currentItem) {
      await supabase.from('items').update(itemForm).eq('id', currentItem.id);
    } else {
      await supabase.from('items').insert([itemForm]);
    }
    setShowItemModal(false);
    fetchItems();
  };

  const handleDelete = async (id: string) => { 
    if (confirm('Hapus item ini?')) { 
      await supabase.from('items').delete().eq('id', id); 
      fetchItems(); 
    } 
  };

  // --- LOGIC PEMINJAMAN (TAMU) ---
  const handleBorrowClick = (item: Item) => {
    setSelectedLoanItem(item);
    setLoanForm({ borrower_name: '', borrower_class: '', duration: 1 });
    setShowLoanModal(true);
  };

  const handleSubmitLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoanItem) return;

    // Insert ke tabel loans
    const { error } = await supabase.from('loans').insert([{
      item_id: selectedLoanItem.id,
      borrower_name: loanForm.borrower_name,
      borrower_class: loanForm.borrower_class,
      duration: loanForm.duration,
      status: 'Pending'
    }]);

    if (!error) {
      // Update status barang
      await supabase.from('items').update({ status: 'Diproses' }).eq('id', selectedLoanItem.id);
      alert('Berhasil diajukan!');
      setShowLoanModal(false);
      fetchItems();
    } else {
      alert('Gagal: ' + error.message);
    }
  };

  // --- LOGIC PENGEMBALIAN BARANG (ADMIN) ---
  const handleReturnItem = async (loan: Loan) => {
    if(!confirm(`Barang "${loan.items?.name}" sudah dikembalikan?`)) return;

    // 1. Update status peminjaman jadi 'Returned' (Selesai)
    await supabase.from('loans').update({ status: 'Returned', return_date: new Date() }).eq('id', loan.id);

    // 2. Update status barang jadi 'Tersedia' lagi
    await supabase.from('items').update({ status: 'Tersedia' }).eq('id', loan.item_id);

    // 3. Refresh data
    fetchItems();
    fetchLoans();
  };

  return (
    <div className="container py-5">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <div>
          <h2 className="fw-bold mb-1">Dashboard Inventaris</h2>
          <p className="text-muted mb-0">
            {currentUser ? `Halo Admin, ${currentUser.user_metadata?.full_name || 'Staff'}` : "Portal Peminjaman Siswa"}
          </p>
        </div>
        
        <div className="d-flex gap-2">
          {currentUser ? (
            <>
              <button className="btn btn-outline-danger" onClick={handleLogout}>🚪 Logout</button>
              <button className="btn btn-primary" onClick={handleAddNew}>+ Barang Baru</button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => router.push('/login')}>🔐 Login Guru</button>
          )}
        </div>
      </div>

      <InventoryChart />

      {/* --- BAGIAN 1: TABEL MONITORING PEMINJAMAN (HANYA ADMIN) --- */}
      {currentUser && (
        <div className="card shadow border-primary mb-5">
          <div className="card-header bg-primary text-white py-3 d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold">📢 Monitoring Peminjaman Aktif</h5>
            <span className="badge bg-white text-primary">{loans.length} Barang Keluar</span>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Nama Peminjam</th>
                    <th>Barang</th>
                    <th>Tgl Pinjam</th>
                    <th>Lama</th>
                    <th className="text-end pe-4">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-4 text-muted">Tidak ada peminjaman aktif saat ini.</td></tr>
                  ) : (
                    loans.map((loan) => (
                      <tr key={loan.id}>
                        <td className="ps-4">
                          <div className="fw-bold text-dark">{loan.borrower_name}</div>
                          <div className="small text-muted">{loan.borrower_class}</div>
                        </td>
                        <td>
                          <div className="fw-bold">{loan.items?.name || 'Item dihapus'}</div>
                          <div className="small text-muted font-monospace">{loan.items?.code}</div>
                        </td>
                        <td>{new Date(loan.loan_date).toLocaleDateString('id-ID')}</td>
                        <td>
                          <span className="badge bg-warning text-dark">
                            ⏱️ {loan.duration} Hari
                          </span>
                        </td>
                        <td className="text-end pe-4">
                          <button 
                            className="btn btn-sm btn-outline-success fw-bold"
                            title="Tandai Sudah Kembali"
                            onClick={() => handleReturnItem(loan)}
                          >
                            ✅ Selesai
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
      )}

      {/* --- BAGIAN 2: DAFTAR SEMUA BARANG --- */}
      <div className="card shadow-sm">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-bold">📦 Master Data Barang</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Nama Barang</th>
                  <th>Kondisi</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-5">⏳ Loading...</td></tr>
                ) : items.map((item) => (
                  <tr key={item.id}>
                    <td className="ps-4 fw-bold">
                      {item.name} <br/>
                      <small className="text-muted fw-normal">{item.code}</small>
                    </td>
                    <td><span className={`badge rounded-pill ${item.condition === 'Baik' ? 'bg-success' : 'bg-danger'}`}>{item.condition}</span></td>
                    <td>
                      <span className={`fw-bold ${item.status === 'Tersedia' ? 'text-primary' : 'text-warning'}`}>{item.status}</span>
                    </td>
                    <td className="text-end pe-4">
                      {currentUser ? (
                        <>
                          <button className="btn btn-sm btn-outline-info me-1" onClick={() => handleEdit(item)}>✏️</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item.id)}>🗑️</button>
                        </>
                      ) : (
                        item.status === 'Tersedia' ? (
                          <button className="btn btn-sm btn-success" onClick={() => handleBorrowClick(item)}>👆 Pinjam</button>
                        ) : (
                          <button className="btn btn-sm btn-secondary" disabled>Dipinjam</button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL ADMIN & TAMU (SAMA SEPERTI KODE SEBELUMNYA) */}
      {showItemModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">Kelola Barang</h5><button type="button" className="btn-close" onClick={()=>setShowItemModal(false)}></button></div>
              <form onSubmit={handleSaveItem}>
                <div className="modal-body">
                   <div className="mb-2"><label>Nama</label><input className="form-control" value={itemForm.name} onChange={e=>setItemForm({...itemForm, name: e.target.value})} required/></div>
                   <div className="mb-2"><label>Kode</label><input className="form-control" value={itemForm.code} onChange={e=>setItemForm({...itemForm, code: e.target.value})} required/></div>
                   <div className="row">
                     <div className="col"><label>Kondisi</label><select className="form-select" value={itemForm.condition} onChange={e=>setItemForm({...itemForm, condition: e.target.value})}><option>Baik</option><option>Rusak</option></select></div>
                     <div className="col"><label>Status</label><select className="form-select" value={itemForm.status} onChange={e=>setItemForm({...itemForm, status: e.target.value})}><option>Tersedia</option><option>Dipinjam</option><option>Diproses</option></select></div>
                   </div>
                </div>
                <div className="modal-footer"><button className="btn btn-secondary" onClick={()=>setShowItemModal(false)}>Batal</button><button className="btn btn-primary">Simpan</button></div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showLoanModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-success text-white"><h5 className="modal-title">Form Peminjaman</h5><button type="button" className="btn-close" onClick={()=>setShowLoanModal(false)}></button></div>
              <form onSubmit={handleSubmitLoan}>
                <div className="modal-body">
                   <p className="mb-2">Meminjam: <strong>{selectedLoanItem?.name}</strong></p>
                   <div className="mb-2"><label>Nama Siswa</label><input className="form-control" value={loanForm.borrower_name} onChange={e=>setLoanForm({...loanForm, borrower_name: e.target.value})} required/></div>
                   <div className="mb-2"><label>Kelas</label><input className="form-control" value={loanForm.borrower_class} onChange={e=>setLoanForm({...loanForm, borrower_class: e.target.value})} required/></div>
                   <div className="mb-2"><label>Lama (Hari)</label><input type="number" className="form-control" min="1" value={loanForm.duration} onChange={e=>setLoanForm({...loanForm, duration: parseInt(e.target.value)})} required/></div>
                </div>
                <div className="modal-footer"><button className="btn btn-secondary" onClick={()=>setShowLoanModal(false)}>Batal</button><button className="btn btn-success">Ajukan</button></div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}