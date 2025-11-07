const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '');

export interface Pegawai {
  NIP: string;
  Nama: string;
  Tempat_Tanggal_Lahir: string;
  Pendidikan_Terakhir: string;
  Pangkat_Golongan: string;
  KGB_Berikutnya: string;
  TMT: string;
  Jenis_Kelamin: string;
  Agama: string;
  Status_Kepegawaian: string;
  Gaji_Pokok: number;
  Jumlah_Anak: number;
}

export interface DashboardStats {
  genderCount: { lakiLaki: number; perempuan: number };
  upcomingKGB: Pegawai[];
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const res = await fetch(`${API_BASE_URL}/pegawai/dashboard/stats`);

    if (!res.ok) {
      throw new Error(`Gagal mengambil data dashboard: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    // Validasi dan sortir data KGB terdekat (maks. 2 pegawai)
    const sortedKGB = (data.upcomingKGB as Pegawai[])
      .sort(
        (a, b) =>
          new Date(a.KGB_Berikutnya).getTime() - new Date(b.KGB_Berikutnya).getTime()
      )
      .slice(0, 2);

    return {
      genderCount: data.genderCount as DashboardStats['genderCount'],
      upcomingKGB: sortedKGB,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Terjadi kesalahan saat memuat data dashboard';

    console.error('Error fetching dashboard stats:', message);
    throw new Error(message);
  }
};
