const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '');

export interface UpdatePendidikanPayload {
  id_pendidikan: string;
  pegawai: string; // NIP pegawai
  jenjang: string;
  jurusan: string;
  institusi: string;
  tahun_lulus: number;
}

export async function updatePendidikan({
  id_pendidikan,
  pegawai,
  jenjang,
  jurusan,
  institusi,
  tahun_lulus,
}: UpdatePendidikanPayload) {
  const url = API_BASE_URL
    ? `${API_BASE_URL}/pendidikan/${id_pendidikan}`
    : null;

  if (!url) throw new Error('API URL tidak tersedia');

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        Pegawai: pegawai,
        Jenjang: jenjang,
        Jurusan: jurusan,
        Institusi: institusi,
        Tahun_Lulus: tahun_lulus,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      const msg =
        result?.message ||
        result?.error?.message ||
        `Gagal memperbarui data pendidikan (Status ${response.status})`;
      throw new Error(msg);
    }

    // Format hasil response sesuai struktur API
    return {
      message: result.message || 'Data pendidikan berhasil diperbarui',
      data: {
        id_pendidikan: result.data?.ID_Pendidikan,
        pegawai: result.data?.Pegawai,
        jenjang: result.data?.Jenjang,
        jurusan: result.data?.Jurusan,
        institusi: result.data?.Institusi,
        tahun_lulus: result.data?.Tahun_Lulus,
      },
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Terjadi kesalahan saat memperbarui data pendidikan';
    console.error('Update pendidikan gagal:', message);
    throw new Error(message);
  }
}
