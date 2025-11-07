// lib/api/pendidikan/delete-pendidikan/router.ts
import { apiUrl } from "@/lib/utils/apiUrl";

export async function deletePendidikan(id: string): Promise<{ message: string }> {
  const url = apiUrl(`pendidikan/${id}`);

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          `Gagal menghapus data pendidikan (Status ${response.status})`
      );
    }

    return {
      message: data?.message || "Data pendidikan berhasil dihapus",
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan saat menghapus data pendidikan";

    console.error("[deletePendidikan] error:", message);
    throw new Error(message);
  }
}
