import { apiUrl } from "@/lib/utils/apiUrl";

export interface CatatanKarir {
  id_catatan: string;
  NIP: string;
  Pangkat_Sekarang: string;
  Potensi_Pangkat_Baru: string;
  Tanggal_Layak: string;
  Status: string;
  Catatan: string;
}

interface ErrorResponse {
  message?: string;
  error?: { message?: string };
}

export async function getAllCatatanKarir(): Promise<CatatanKarir[]> {
  const url = apiUrl("catatan-karir");

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    const data = await response.json();

    // Cek error HTTP
    if (!response.ok) {
      const msg =
        (data as ErrorResponse)?.message ||
        (data as ErrorResponse)?.error?.message ||
        `Gagal mengambil data catatan karir (Status ${response.status})`;
      throw new Error(msg);
    }

    // Pastikan hasil berupa array dan ubah ke format yang sesuai
    if (!Array.isArray(data)) {
      throw new Error("Respons server tidak valid, format bukan array");
    }

    const catatanKarirList: CatatanKarir[] = data.map((item) => ({
      id_catatan: item.id_catatan,
      NIP: item.NIP,
      Pangkat_Sekarang: item.Pangkat_Sekarang,
      Potensi_Pangkat_Baru: item.Potensi_Pangkat_Baru,
      Tanggal_Layak: item.Tanggal_Layak,
      Status: item.Status,
      Catatan: item.Catatan,
    }));

    return catatanKarirList;
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Terjadi kesalahan saat mengambil data catatan karir";
    console.error("[getAllCatatanKarir] error:", message);
    throw new Error(message);
  }
}
