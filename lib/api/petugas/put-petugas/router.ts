const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '');

export interface UpdatePegawaiPayload {
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
      data: result.data,
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
