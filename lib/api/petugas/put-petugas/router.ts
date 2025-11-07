const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '');

export interface UpdatePegawaiPayload {
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

export async function updatePegawai(nip: string, data: UpdatePegawaiPayload) {
  const url = API_BASE_URL ? `${API_BASE_URL}/pegawai/${nip}` : null;
  if (!url) throw new Error('API URL tidak tersedia');

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      const msg =
        result?.message ||
        result?.error?.message ||
        `Gagal memperbarui data pegawai (Status ${response.status})`;
      throw new Error(msg);
    }

    // Format hasil respons sesuai dengan struktur API
    return {
      message: result.message || 'Data pegawai berhasil diperbarui',
      data: {
        nip: result.data?.NIP,
        nama: result.data?.Nama,
        tempat_tanggal_lahir: result.data?.Tempat_Tanggal_Lahir,
        pendidikan_terakhir: result.data?.Pendidikan_Terakhir,
        pangkat_golongan: result.data?.Pangkat_Golongan,
        kgb_berikutnya: result.data?.KGB_Berikutnya,
        tmt: result.data?.TMT,
        jenis_kelamin: result.data?.Jenis_Kelamin,
        agama: result.data?.Agama,
        status_kepegawaian: result.data?.Status_Kepegawaian,
        gaji_pokok: result.data?.Gaji_Pokok,
        jumlah_anak: result.data?.Jumlah_Anak,
      },
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Terjadi kesalahan saat memperbarui data pegawai';
    console.error('Update pegawai gagal:', message);
    throw new Error(message);
  }
}
