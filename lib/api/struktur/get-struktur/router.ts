import { apiUrl } from '@/lib/utils/apiUrl';

export interface Struktur {
  id_struktur: string;
  pegawai: string;
  jabatan: string;
  tmt: string;
  parent_id: string | null;
}

interface RawStruktur {
  ID_Struktur: string;
  Pegawai: string;
  Jabatan: string;
  TMT: string;
  parent_id: string | null;
}

export async function getAllStruktur(retry = 0): Promise<Struktur[]> {
  const url = apiUrl('struktur');

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) throw new Error(`Gagal fetch struktur: ${response.status}`);

    const rawData: RawStruktur[] = await response.json();
    console.log('[getAllStruktur] Data mentah:', rawData);

    if ((!rawData || rawData.length === 0) && retry < 2) {
      console.warn('Data struktur kosong, coba ulang...');
      await new Promise((r) => setTimeout(r, 1500));
      return getAllStruktur(retry + 1);
    }

    // Buat lookup untuk mempercepat pencarian parent
    const byJabatan = (jabatan: string) =>
      rawData.find((p) => p.Jabatan.toLowerCase().includes(jabatan.toLowerCase()));

    const withHierarchy = rawData.map((item) => {
      if (item.parent_id) return item;

      const jabatan = item.Jabatan.toLowerCase();
      let parent: RawStruktur | undefined;

      if (jabatan.includes('kepala stasiun')) {
        parent = undefined;
      } 
      else if (jabatan.includes('koordinator data')) {
        parent = byJabatan('kepala stasiun');
      } 
      else if (jabatan.includes('koordinator observasi')) {
        parent = byJabatan('kepala stasiun');
      } 
      else if (jabatan.includes('tata usaha') && !jabatan.includes('staf')) {
        parent = byJabatan('kepala stasiun');
      } 
      else if (jabatan.includes('staf')) {
        if (jabatan.includes('data') || jabatan.includes('informasi')) {
          parent = byJabatan('koordinator data');
        } else if (jabatan.includes('observasi') || jabatan.includes('teknisi')) {
          parent = byJabatan('koordinator observasi');
        } else if (jabatan.includes('tata usaha')) {
          parent = byJabatan('tata usaha');
        }
      }

      return {
        ...item,
        parent_id: parent ? parent.ID_Struktur : null,
      };
    });

    return withHierarchy.map((item) => ({
      id_struktur: item.ID_Struktur,
      pegawai: item.Pegawai,
      jabatan: item.Jabatan,
      tmt: item.TMT,
      parent_id: item.parent_id,
    }));
  } catch (error) {
    console.error('[getAllStruktur] Error:', error);

    if (retry < 2) {
      console.warn(`Percobaan ulang ke-${retry + 1}...`);
      await new Promise((r) => setTimeout(r, 1500));
      return getAllStruktur(retry + 1);
    }

    throw new Error('Gagal mengambil data struktur organisasi.');
  }
}
