// lib/api/struktur/delete-struktur/router.ts
import { apiUrl } from '@/lib/utils/apiUrl';

export async function deleteStrukturOrganisasi(id: string): Promise<{ message: string }> {
  const url = apiUrl(`struktur/${id}`); // endpoint sesuai backend kamu

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || `Gagal menghapus struktur (Status ${response.status})`);
    }

    // Response sesuai backend kamu
    return {
      message: data?.message || 'Struktur berhasil dihapus',
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Terjadi kesalahan saat menghapus struktur organisasi';

    console.error('[deleteStrukturOrganisasi] error:', message);
    throw new Error(message);
  }
}
