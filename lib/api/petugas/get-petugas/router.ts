const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface Pegawai {
  nip: string;
  nama: string;
  tempat_tanggal_lahir: string;
  pendidikan_terakhir: string;
  pangkat_golongan: string;
  kgb_berikutnya: string;
  tmt: string;
  jenis_kelamin: string;
  agama: string;
  status_kepegawaian: string;
  gaji_pokok: number;
  jumlah_anak: number;
}

interface RawPegawai {
  NIP: string;
  Nama: string;
  Tempat_Tanggal_Lahir?: string;
  Pendidikan_Terakhir?: string;
  Pangkat_Golongan?: string;
  KGB_Berikutnya?: string;
  TMT?: string;
  Jenis_Kelamin?: string;
  Agama?: string;
  Status_Kepegawaian?: string;
  Gaji_Pokok?: number;
  Jumlah_Anak?: number;
}

export async function getAllPegawai(): Promise<Pegawai[]> {
  try {
    const response = await fetch(`${API_BASE_URL}pegawai`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
      },
    });

    const rawData: RawPegawai[] = await response.json();

    if (!response.ok) {
      const errorData = rawData as unknown as { message?: string };
      throw new Error(errorData?.message || 'Gagal mengambil data pegawai');
    }

    const data: Pegawai[] = rawData.map((item) => ({
      nip: item.NIP,
      nama: item.Nama,
      tempat_tanggal_lahir: item.Tempat_Tanggal_Lahir ?? '',
      pendidikan_terakhir: item.Pendidikan_Terakhir ?? '',
      pangkat_golongan: item.Pangkat_Golongan ?? '',
      kgb_berikutnya: item.KGB_Berikutnya ?? '',
      tmt: item.TMT ?? '',
      jenis_kelamin: item.Jenis_Kelamin ?? '',
      agama: item.Agama ?? '',
      status_kepegawaian: item.Status_Kepegawaian ?? '',
      gaji_pokok: item.Gaji_Pokok ?? 0,
      jumlah_anak: item.Jumlah_Anak ?? 0,
    }));

    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Terjadi kesalahan saat mengambil data pegawai'
    );
  }
}
