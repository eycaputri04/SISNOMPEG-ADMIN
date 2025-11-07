const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '');

interface PenjenjanganPayload {
  pegawai: string;
  namaPenjenjangan: string;
  tahunPelaksanaan: number;
  penyelenggara: string;
}

export async function tambahPenjenjangan({
  pegawai,
  namaPenjenjangan,
  tahunPelaksanaan,
  penyelenggara,
}: PenjenjanganPayload) {
  if (!API_BASE_URL) throw new Error('API URL tidak tersedia');

  const url = `${API_BASE_URL}/penjenjangan`;

  // Validasi input
  if (!pegawai || !namaPenjenjangan || !tahunPelaksanaan || !penyelenggara) {
    throw new Error('Semua field penjenjangan harus diisi');
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        Pegawai: pegawai,
        Nama_Penjenjangan: namaPenjenjangan,
        Tahun_Pelaksanaan: tahunPelaksanaan,
        Penyelenggara: penyelenggara,
      }),
    });

    // Parsing responsenya dengan aman
    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error('Respons server tidak valid');
    }

    // Cek status HTTP
    if (!response.ok) {
      const msg =
        data?.message ||
        data?.error?.message ||
        `Gagal menambahkan penjenjangan (Status ${response.status})`;
      throw new Error(msg);
    }

    return {
      message: data.message,
      penjenjangan: data.data,
    };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : 'Terjadi kesalahan saat menambahkan penjenjangan';
    console.error('Tambah penjenjangan gagal:', message);
    throw new Error(message);
  }
}
