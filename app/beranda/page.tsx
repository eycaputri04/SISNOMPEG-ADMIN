"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient, User } from "@supabase/auth-helpers-nextjs";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import DashboardCard from "@/components/DashboardCard";
import ActivityCard from "@/components/ActivityCard";
import KGBWarningCard from "@/components/KGBWarningCard";
import { AlertTriangle, ArrowUpCircle, BarChart2 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { getTotalPegawai } from "@/lib/api/petugas/get-count/router";
import { getTotalStruktur } from "@/lib/api/struktur/get-count/router";
import { getAktivitasTerbaru } from "@/lib/api/aktivitas/get-aktivitas/router";
import { getDashboardStats } from "@/lib/api/petugas/get-dashboard-stats/router";
import { getAllCatatanKarir } from "@/lib/api/catatan-karir/get-catatan-karir/router";
import { getAllPegawai } from "@/lib/api/petugas/get-petugas/router";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

interface Pegawai {
  nip: string;
  nama: string;
  pangkat_golongan: string;
  jenis_kelamin: string;
}

interface CatatanKarir {
  NIP: string;
  Status: string;
  Tanggal_Layak: string;
  Potensi_Pangkat_Baru: string;
}

interface DashboardStats {
  genderCount: {
    lakiLaki: number;
    perempuan: number;
  };
  upcomingKGB: { Nama: string; KGB_Berikutnya: string }[];
}

export default function BerandaPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);

  const [totalPegawai, setTotalPegawai] = useState(0);
  const [totalStruktur, setTotalStruktur] = useState(0);
  const [aktivitas, setAktivitas] = useState<
    { jenis: string; waktu: string; keterangan: string }[]
  >([]);
  const [chartData, setChartData] = useState<
    { pangkat: string; laki: number; perempuan: number }[]
  >([]);
  const [kgbMendatang, setKgbMendatang] = useState<
    { nama: string; kgb_berikutnya: string }[]
  >([]);
  const [peringatanPangkat, setPeringatanPangkat] = useState<
    { nama: string; tanggalLayak: string; pangkatBaru: string }[]
  >([]);

  // 🔐 Cek sesi login
  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!isMounted) return;
      if (error) {
        console.error("Gagal memeriksa sesi:", error.message);
        return;
      }

      if (!data.session) {
        router.replace("/"); // redirect kalau belum login
      } else {
        setUser(data.session.user);
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [router, supabase]);

  // 📊 Ambil data dashboard
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [
          pegawaiCount,
          strukturCount,
          aktivitasData,
          dashboardStats,
          pegawaiData,
          catatanData,
        ] = await Promise.all([
          getTotalPegawai(),
          getTotalStruktur(),
          getAktivitasTerbaru(),
          getDashboardStats(),
          getAllPegawai(),
          getAllCatatanKarir(),
        ]);

        setTotalPegawai(pegawaiCount);
        setTotalStruktur(strukturCount);
        setAktivitas(aktivitasData);

        const stats = dashboardStats as DashboardStats;

        setKgbMendatang(
          stats.upcomingKGB.map((p) => ({
            nama: p.Nama,
            kgb_berikutnya: p.KGB_Berikutnya,
          }))
        );

        // Filter pegawai yang layak naik pangkat
        const dataLayak = (catatanData as CatatanKarir[])
          .filter((c) => c.Status === "Layak")
          .map((c) => {
            const pegawai = (pegawaiData as Pegawai[]).find((p) => p.nip === c.NIP);
            return {
              nama: pegawai ? pegawai.nama : c.NIP,
              tanggalLayak: c.Tanggal_Layak,
              pangkatBaru: c.Potensi_Pangkat_Baru,
            };
          })
          .sort(
            (a, b) =>
              new Date(a.tanggalLayak).getTime() - new Date(b.tanggalLayak).getTime()
          )
          .slice(0, 3);

        setPeringatanPangkat(dataLayak);

        // Hitung jumlah pegawai per pangkat berdasarkan jenis kelamin
        const pangkatMap: Record<string, { laki: number; perempuan: number }> = {};
        (pegawaiData as Pegawai[]).forEach((p) => {
          const key = p.pangkat_golongan || "Tidak Diketahui";
          if (!pangkatMap[key]) pangkatMap[key] = { laki: 0, perempuan: 0 };
          if (p.jenis_kelamin?.toLowerCase() === "laki-laki") pangkatMap[key].laki++;
          else if (p.jenis_kelamin?.toLowerCase() === "perempuan")
            pangkatMap[key].perempuan++;
        });

        setChartData(
          Object.entries(pangkatMap).map(([pangkat, val]) => ({
            pangkat,
            laki: val.laki,
            perempuan: val.perempuan,
          }))
        );
      } catch (err) {
        console.error("Gagal memuat data dashboard:", err);
      }
    };

    fetchAllData();
  }, []);

  // 🕒 Fungsi waktu relatif
  const waktuRelatif = (iso: string) => {
    const now = new Date();
    const waktu = new Date(iso);
    const selisihMenit = Math.floor((now.getTime() - waktu.getTime()) / 60000);
    if (selisihMenit < 1) return "Baru saja";
    if (selisihMenit < 60) return `${selisihMenit} menit yang lalu`;
    const jam = Math.floor(selisihMenit / 60);
    return `${jam} jam yang lalu`;
  };

  // 🧍 Jika belum login
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        Memeriksa sesi login...
      </div>
    );
  }

  // 💡 Render Dashboard
  return (
    <div className={`flex ${poppins.className} bg-gray-100 min-h-screen`}>
      <Sidebar active="Beranda" />
      <main className="flex-1 ml-54 py-20 px-10 overflow-y-auto transition-all duration-300">
        <Navbar title="Beranda" titleClassName="text-black" />

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 mt-4">
          <DashboardCard
            icon="mdi:account-group"
            title="Total Pegawai"
            value={totalPegawai}
            valueClassName="text-black"
            onClick={() => router.push("/pegawai")}
          />
          <DashboardCard
            icon="mdi:sitemap-outline"
            title="Total yang Menjabat"
            value={totalStruktur}
            valueClassName="text-black"
            onClick={() => router.push("/struktur")}
          />
        </div>

        {/* Aktivitas Terakhir */}
        <section className="bg-white rounded-xl p-5 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-black mb-4">
            Aktivitas Terakhir
          </h2>
          <div className="flex flex-wrap gap-4">
            {aktivitas.length === 0 ? (
              <p className="text-gray-500 text-sm">Belum ada aktivitas</p>
            ) : (
              aktivitas.slice(0, 3).map((item, idx) => (
                <ActivityCard
                  key={idx}
                  text={item.keterangan}
                  time={waktuRelatif(item.waktu)}
                />
              ))
            )}
          </div>
        </section>

        {/* Peringatan KGB */}
        <section className="bg-white rounded-xl p-5 shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-4 text-red-700 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Peringatan KGB
          </h2>
          {kgbMendatang.length === 0 ? (
            <p className="text-sm text-gray-500">Tidak ada KGB dalam waktu dekat</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {kgbMendatang
                .sort(
                  (a, b) =>
                    new Date(a.kgb_berikutnya).getTime() -
                    new Date(b.kgb_berikutnya).getTime()
                )
                .slice(0, 2)
                .map((item, index) => (
                  <KGBWarningCard
                    key={index}
                    nama={item.nama}
                    tanggal={new Date(item.kgb_berikutnya).toLocaleDateString("id-ID")}
                  />
                ))}
            </div>
          )}
        </section>

        {/* Peringatan Kenaikan Pangkat */}
        <section className="bg-white rounded-xl p-5 shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-4 text-green-700 flex items-center">
            <ArrowUpCircle className="w-5 h-5 mr-2" />
            Peringatan Kenaikan Pangkat
          </h2>
          {peringatanPangkat.length === 0 ? (
            <p className="text-sm text-gray-500">
              Tidak ada pegawai yang akan naik pangkat dalam waktu dekat
            </p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {peringatanPangkat.map((item, index) => (
                <div
                  key={index}
                  className="bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col"
                >
                  <p className="text-sm font-medium text-green-900">
                    <span className="font-semibold">{item.nama}</span> layak naik ke{" "}
                    <span className="font-semibold">{item.pangkatBaru}</span>
                  </p>
                  <p className="text-xs text-gray-600">
                    Tanggal Kenaikan:{" "}
                    {new Date(item.tanggalLayak).toLocaleDateString("id-ID")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Grafik Statistik */}
        <section className="bg-white rounded-xl p-5 shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-4 text-blue-900 flex items-center">
            <BarChart2 className="w-5 h-5 mr-2" />
            Statistik Pegawai Berdasarkan Pangkat dan Jenis Kelamin
          </h2>
          {chartData.length === 0 ? (
            <p className="text-gray-500 text-sm">
              Data pegawai tidak tersedia untuk grafik
            </p>
          ) : (
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="pangkat"
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                    height={60}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="laki"
                    stroke="#2563EB"
                    name="Laki-laki"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="perempuan"
                    stroke="#F59E0B"
                    name="Perempuan"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
