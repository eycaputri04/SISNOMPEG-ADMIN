const API_BASE_URL = "http://localhost:3001/";

/**
 * Interface Jabatan yang digunakan di frontend
 */
export interface Jabatan {
  id: string;
  nip: string;
  nama: string;
  nama_lengkap: string;
  jabatan: string;
  tmt?: string;
  foto: string;
  parent_id: number | null;

  // Informasi tambahan (opsional)
  no_telepon?: string;
}

/**
 * Interface sesuai struktur respons dari endpoint /struktur
 */
interface StrukturAPIResponse {
  ID_Struktur: string;
  Pegawai: string; // NIP Pegawai
  Jabatan: string;
  TMT: string;
}

/**
 * Fungsi untuk fetch dan mapping data struktur dari API
 */
export async function getStruktur(): Promise<Jabatan[]> {
  try {
    const response = await fetch(`${API_BASE_URL}struktur`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Gagal mengambil data struktur: ${response.status}`);
    }

    const result: StrukturAPIResponse[] = await response.json();

    // Mapping data sesuai kebutuhan frontend
    const mapped: Jabatan[] = result.map((item, index) => ({
      id: item.ID_Struktur || `${index}`,
      nip: item.Pegawai,
      nama: item.Pegawai, // sementara gunakan NIP jika nama belum tersedia
      nama_lengkap: item.Pegawai,
      jabatan: item.Jabatan,
      tmt: item.TMT,
      foto: "/default.jpg", // default jika belum ada foto
      parent_id: null, // default null (belum ada hirarki)
      no_telepon: undefined,
    }));

    console.log("✅ Data struktur berhasil diambil:", mapped);
    return mapped;
  } catch (error) {
    console.error("❌ Error saat mengambil struktur:", error);
    throw new Error(
      (error as Error).message ||
        "Terjadi kesalahan saat mengambil data struktur"
    );
  }
}
