const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '');

interface CatatanKarirPayload {
  nip: string;
  pangkatSekarang: string;
  potensiPangkatBaru?: string;
  tanggalLayak?: string;
  status?: string;
  catatan?: string;
}

export async function tambahCatatanKarir({
  nip,
  pangkatSekarang,
  potensiPangkatBaru,
  tanggalLayak,
  status,
  catatan,
}: CatatanKarirPayload) {
  // Pastikan base URL tersedia
  if (!API_BASE_URL) throw new Error('API URL tidak tersedia');

  const url = `${API_BASE_URL}/catatan-karir`;

  // Validasi input wajib
  if (!nip || !pangkatSekarang) {
    throw new Error('NIP dan Pangkat Sekarang wajib diisi');
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        NIP: nip,
        Pangkat_Sekarang: pangkatSekarang,
        Potensi_Pangkat_Baru: potensiPangkatBaru,
        Tanggal_Layak: tanggalLayak,
        Status: status,
        Catatan: catatan,
      }),
    });

    // Parsing response
    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error('Respons server tidak valid');
    }

    // Validasi status HTTP
    if (!response.ok) {
      const msg =
        data?.message ||
        data?.error?.message ||
        `Gagal menambahkan catatan karir (Status ${response.status})`;
      throw new Error(msg);
    }

    return {
      message: 'Catatan karir berhasil ditambahkan',
      catatanKarir: data,
    };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : 'Terjadi kesalahan saat menambahkan catatan karir';
    console.error('Tambah catatan karir gagal:', message);
    throw new Error(message);
  }
}
