import { apiUrl } from "@/lib/utils/apiUrl";

export async function deleteCatatanKarir(
  id: string
): Promise<{ message: string }> {
  // Validasi parameter
  if (!id) throw new Error("ID catatan karir wajib diisi");

  const url = apiUrl(`catatan-karir/${id}`);

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    });

    const data = await response.json();

    // Cek status HTTP
    if (!response.ok) {
      throw new Error(
        data?.message ||
          `Gagal menghapus data catatan karir (Status ${response.status})`
      );
    }

    // Kembalikan pesan sukses
    return {
      message: data?.message || "Data catatan karir berhasil dihapus",
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan saat menghapus data catatan karir";

    console.error("[deleteCatatanKarir] error:", message);
    throw new Error(message);
  }
}
