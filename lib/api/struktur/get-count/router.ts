import { apiUrl } from '@/lib/utils/apiUrl';

export async function getTotalStruktur(retry = 0): Promise<number> {
  const url = apiUrl('struktur/count');

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) throw new Error(`Gagal ambil count: ${response.status}`);

    const data = await response.json();
    const count =
      data?.count ?? data?.data?.count ?? (Array.isArray(data) ? data.length : 0);

    if (typeof count !== 'number') throw new Error('Count tidak valid');
    return count;
  } catch (error) {
    console.error('[getTotalStruktur] Error:', error);

    if (retry < 2) {
      console.warn(`Percobaan ulang total struktur ke-${retry + 1}...`);
      await new Promise((r) => setTimeout(r, 1500));
      return getTotalStruktur(retry + 1);
    }

    return 0;
  }
}
