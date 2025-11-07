// lib/api/struktur/edit-struktur/router.ts
import { apiUrl } from '@/lib/utils/apiUrl';

interface EditStrukturPayload {
  id: string;
  petugas: string;
  jabatan: string;
  tmt: string;
}

export async function editStrukturOrganisasi({
  id,
  petugas,
  jabatan,
  tmt,
}: EditStrukturPayload) {
  const url = apiUrl(`struktur/${id}`);
  if (!url) throw new Error('API URL tidak tersedia');

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        Pegawai: petugas, 
        Jabatan: jabatan,
        TMT: tmt,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const msg =
        data?.message ||
        data?.error?.message ||
        `Gagal memperbarui struktur (Status ${response.status})`;
      throw new Error(msg);
    }

    return {
      message: data.message || 'Struktur berhasil diperbarui',
      data: {
        id_struktur: data.data?.ID_Struktur,
        pegawai: data.data?.Pegawai,
        jabatan: data.data?.Jabatan,
        tmt: data.data?.TMT,
      },
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Terjadi kesalahan saat memperbarui struktur organisasi';
    console.error('[editStrukturOrganisasi] Error:', message);
    throw new Error(message);
  }
}
