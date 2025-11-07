const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '');

interface PendidikanPayload {
  pegawai: string;
  jenjang: string;
  jurusan: string;
  institusi: string;
  tahunLulus: number;
}

export async function tambahPendidikan({
  pegawai,
  jenjang,
  jurusan,
  institusi,
  tahunLulus,
}: PendidikanPayload) {
  // Pastikan BASE_URL tersedia
  if (!API_BASE_URL) throw new Error('API URL tidak tersedia');

  const url = `${API_BASE_URL}/pendidikan`;

  // Validasi input
  if (!pegawai || !jenjang || !jurusan || !institusi || !tahunLulus) {
    throw new Error('Semua field pendidikan harus diisi');
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
        Jenjang: jenjang,
        Jurusan: jurusan,
        Institusi: institusi,
        Tahun_Lulus: tahunLulus,
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
        `Gagal menambahkan pendidikan (Status ${response.status})`;
      throw new Error(msg);
    }

    return {
      message: data.message,
      pendidikan: data.data,
    };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : 'Terjadi kesalahan saat menambahkan pendidikan';
    console.error('Tambah pendidikan gagal:', message);
    throw new Error(message);
  }
}
