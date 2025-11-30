'use client'; // Wajib karena Chart butuh browser

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Registrasi elemen Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function InventoryChart() {
  // Data Dummy 1: Statistik Kondisi Barang (Pie Chart)
  const pieData = {
    labels: ['Baik', 'Rusak Ringan', 'Rusak Berat'],
    datasets: [
      {
        label: 'Jumlah Barang',
        data: [12, 5, 2], // Contoh data: 12 Baik, 5 Rusak Ringan, 2 Rusak Berat
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)', // Hijau (Baik)
          'rgba(255, 206, 86, 0.6)', // Kuning (Rusak Ringan)
          'rgba(255, 99, 132, 0.6)', // Merah (Rusak Berat)
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Data Dummy 2: Peminjaman per Bulan (Bar Chart)
  const barData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
    datasets: [
      {
        label: 'Frekuensi Peminjaman',
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: 'rgba(54, 162, 235, 0.5)', // Biru
      },
    ],
  };

  return (
    <div className="row mb-5">
      {/* Grafik 1: Kondisi Aset */}
      <div className="col-md-6 mb-4">
        <div className="card shadow-sm h-100">
          <div className="card-header bg-white fw-bold">
            📊 Kondisi Aset Kelas
          </div>
          <div className="card-body d-flex justify-content-center">
            <div style={{ width: '300px' }}>
              <Pie data={pieData} />
            </div>
          </div>
        </div>
      </div>

      {/* Grafik 2: Tren Peminjaman */}
      <div className="col-md-6 mb-4">
        <div className="card shadow-sm h-100">
          <div className="card-header bg-white fw-bold">
            📈 Tren Peminjaman Alat
          </div>
          <div className="card-body">
            <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
    </div>
  );
}