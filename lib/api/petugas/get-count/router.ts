import { apiUrl } from '@/lib/utils/apiUrl';

export async function getTotalPegawai(): Promise<number> {
  const url = apiUrl('pegawai/count'); 

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      let errorMessage = `Gagal mengambil total pegawai (HTTP ${response.status})`;

      const contentType = response.headers.get('Content-Type') || '';
      if (contentType.includes('application/json')) {
        const errorBody = await response.json();
        if (errorBody?.message) {
          errorMessage = errorBody.message;
        }
      } else {
        const text = await response.text();
        if (text) errorMessage = text;
      }

      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('Content-Type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Respons server bukan JSON: ${text.slice(0, 120)}…`);
    }

    const body = await response.json();

    // Ambil count dari berbagai kemungkinan format response
    const count =
      body?.count ??
      body?.data?.count ??
      (Array.isArray(body) ? body.length : undefined);

    if (typeof count !== 'number') {
      throw new Error('Response tidak berisi properti count yang valid');
    }

    return count;
  } catch (error) {
    console.error('[getTotalPegawai] error:', error);
    throw new Error('Gagal mengambil total pegawai');
  }
}
