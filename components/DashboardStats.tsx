import React, { useEffect, useState } from 'react';
import { getDashboardStats, DashboardStats as Stats } from '@/lib/api/petugas/get-dashboard-stats/router';
import KGBWarningCard from './KGBWarningCard';

const DashboardStats: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!stats) return <p>Data tidak tersedia</p>;

  return (
    <div className="space-y-6">
      {/* Statistik Gender */}
      <section>
        <h2 className="text-lg font-semibold text-blue-700 mb-2">Statistik Pegawai</h2>
        <div className="flex gap-8 bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm">
          <div>
            <h3 className="text-sm font-medium text-gray-700">Laki-laki</h3>
            <p className="text-lg font-semibold text-gray-900">{stats.genderCount.lakiLaki}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700">Perempuan</h3>
            <p className="text-lg font-semibold text-gray-900">{stats.genderCount.perempuan}</p>
          </div>
        </div>
      </section>

      {/* 2 Pegawai dengan KGB Terdekat */}
      <section>
        <h2 className="text-lg font-semibold text-red-700 mb-2">2 Pegawai dengan KGB Terdekat</h2>
        <div className="space-y-3">
          {stats.upcomingKGB.map((p) => (
            <KGBWarningCard
              key={p.NIP}
              nama={p.Nama}
              tanggal={new Date(p.KGB_Berikutnya).toLocaleDateString('id-ID')}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardStats;
