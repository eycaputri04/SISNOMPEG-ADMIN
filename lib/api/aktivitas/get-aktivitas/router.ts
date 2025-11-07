// lib/api/aktivitas/get-aktivitas/router.ts
import { apiUrl } from "@/lib/utils/apiUrl";

export interface Aktivitas {
  jenis: string;       // Contoh: "Pendidikan"
  aksi: string;        // Contoh: "Menambahkan data pendidikan"
  waktu: string;       // Contoh: "2025-10-17T14:52:57.734+00:00"
  keterangan: string;  // Contoh: "Menambahkan pendidikan untuk pegawai 1987654330"
}

export async function getAktivitasTerbaru(): Promise<Aktivitas[]> {
  const url = apiUrl("/aktivitas/terbaru");

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    const contentType = res.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      const text = await res.text();
      console.error("Bukan JSON:", text);
      throw new Error(
        "Respon dari server bukan JSON. Cek apakah endpoint /aktivitas/terbaru tersedia."
      );
    }

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || "Gagal mengambil aktivitas terbaru");
    }

    // Pastikan data berupa array
    if (!Array.isArray(data)) {
      throw new Error("Respon server tidak berbentuk array");
    }

    return data.map((item) => ({
      jenis: item.jenis,
      aksi: item.aksi,
      waktu: item.waktu,
      keterangan: item.keterangan,
    })) as Aktivitas[];
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan saat mengambil aktivitas terbaru";
    console.error("[getAktivitasTerbaru] error:", message);
    throw new Error(message);
  }
}
