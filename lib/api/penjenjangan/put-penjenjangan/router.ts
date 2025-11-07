const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '');

export interface UpdatePenjenjanganPayload {
  pegawai: string; // NIP pegawai
  nama_penjenjangan: string;
  tahun_pelaksanaan: number;
  penyelenggara: string;
}

export interface UpdatePenjenjanganResponse {
  message: string;
  data: {
    id_penjenjangan: string;
    pegawai: string;
    nama_penjenjangan: string;
    tahun_pelaksanaan: number;
    penyelenggara: string;
  };
}

export async function updatePenjenjangan({
  id_penjenjangan,
  pegawai,
  nama_penjenjangan,
  tahun_pelaksanaan,
  penyelenggara,
}: UpdatePenjenjanganPayload & { id_penjenjangan: string }) {
  const url = API_BASE_URL ? `${API_BASE_URL}/penjenjangan/${id_penjenjangan}` : null;

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
        Nama_Penjenjangan: nama_penjenjangan,
        Tahun_Pelaksanaan: tahun_pelaksanaan,
        Penyelenggara: penyelenggara,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      const msg =
        result?.message ||
        result?.error?.message ||
        `Gagal memperbarui data penjenjangan (Status ${response.status})`;
      throw new Error(msg);
    }

    // Format hasil response sesuai struktur API
    return {
      data: {
        id_penjenjangan: result.data?.ID_Penjenjangan,
        pegawai: result.data?.Pegawai,
        nama_penjenjangan: result.data?.Nama_Penjenjangan,
        tahun_pelaksanaan: result.data?.Tahun_Pelaksanaan,
        penyelenggara: result.data?.Penyelenggara,
      },
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Terjadi kesalahan saat memperbarui data penjenjangan';
    console.error('Update penjenjangan gagal:', message);
    throw new Error(message);
  }
}
