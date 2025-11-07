const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '');

export interface Penjenjangan {
  ID_Penjenjangan: string;
  Pegawai: string; // NIP pegawai
  Nama_Penjenjangan: string;
  Tahun_Pelaksanaan: number;
  Penyelenggara: string;
}

interface ApiErrorResponse {
  message?: string;
}

export async function getPenjenjangan() {
  if (!API_BASE_URL) throw new Error("API URL tidak tersedia");

  const url = `${API_BASE_URL}/penjenjangan`;
  console.log("GET URL:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    const data = (await response.json()) as unknown;

    if (!response.ok) {
      const errorData = data as ApiErrorResponse;
      const msg =
        errorData?.message ??
        `Gagal mengambil data penjenjangan (Status ${response.status})`;
      throw new Error(msg);
    }

    // Jika berhasil, pastikan tipe data sesuai
    const penjenjangan = data as Penjenjangan[];

    return {
      message: "Data penjenjangan berhasil diambil",
      penjenjangan,
    };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Terjadi kesalahan saat mengambil data penjenjangan";
    console.error("Get penjenjangan gagal:", message);
    throw new Error(message);
  }
}
