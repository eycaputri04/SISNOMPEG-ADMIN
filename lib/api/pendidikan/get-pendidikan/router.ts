// lib/api/pendidikan/get-pendidikan/router.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '');

export interface Pendidikan {
  ID_Pendidikan: string;
  Pegawai: string; 
  Jenjang: string;
  Jurusan: string;
  Institusi: string;
  Tahun_Lulus: number;
}

interface ErrorResponse {
  message?: string;
  error?: { message?: string };
}

export async function getAllPendidikan(): Promise<Pendidikan[]> {
  if (!API_BASE_URL) throw new Error("API URL tidak tersedia");

  const url = `${API_BASE_URL}/pendidikan`;
  console.log("GET URL:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    const data = await response.json();

    // Cek jika terjadi error HTTP
    if (!response.ok) {
      const msg =
        (data as ErrorResponse)?.message ||
        (data as ErrorResponse)?.error?.message ||
        `Gagal mengambil data pendidikan (Status ${response.status})`;
      throw new Error(msg);
    }

    // Pastikan hasil berupa array
    if (!Array.isArray(data)) {
      throw new Error("Respons server tidak valid: data bukan array");
    }

    // Format data agar seragam
    const pendidikanList: Pendidikan[] = data.map((item) => ({
      ID_Pendidikan: item.ID_Pendidikan,
      Pegawai: item.Pegawai,
      Jenjang: item.Jenjang,
      Jurusan: item.Jurusan,
      Institusi: item.Institusi,
      Tahun_Lulus: item.Tahun_Lulus,
    }));

    return pendidikanList;
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Terjadi kesalahan saat mengambil data pendidikan";
    console.error("[getAllPendidikan] error:", message);
    throw new Error(message);
  }
}
