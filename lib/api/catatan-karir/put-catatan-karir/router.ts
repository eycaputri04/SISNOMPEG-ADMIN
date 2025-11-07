const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '');

interface UpdateCatatanKarirPayload {
  id: string;
  nip: string;
  pangkatSekarang: string;
  potensiPangkatBaru?: string;
  tanggalLayak?: string;
  status?: string;
  catatan?: string;
}

export async function updateCatatanKarir({
  id,
  nip,
  pangkatSekarang,
  potensiPangkatBaru,
  tanggalLayak,
  status,
  catatan,
}: UpdateCatatanKarirPayload) {
  // Pastikan URL dasar tersedia
  if (!API_BASE_URL) throw new Error('API URL tidak tersedia');

  // Pastikan ID tersedia
  if (!id) throw new Error('ID catatan karir wajib diisi');

  const url = `${API_BASE_URL}/catatan-karir/${id}`;

  // Validasi input minimal
  if (!nip || !pangkatSekarang) {
    throw new Error('NIP dan Pangkat Sekarang wajib diisi');
  }

  try {
    const response = await fetch(url, {
      method: 'PUT',
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

    // Parsing responsenya
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
        `Gagal memperbarui catatan karir (Status ${response.status})`;
      throw new Error(msg);
    }

    return {
      message: data.message || 'Data catatan karir berhasil diperbarui',
      catatanKarir: data.data,
    };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : 'Terjadi kesalahan saat memperbarui catatan karir';
    console.error('Update catatan karir gagal:', message);
    throw new Error(message);
  }
}
