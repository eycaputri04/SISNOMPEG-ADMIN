const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '');

export interface DeletePegawaiResponse {
  message: string;
}

export async function deletePetugas(nip: string): Promise<DeletePegawaiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/pegawai/${nip}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      let errorMessage = 'Terjadi kesalahan saat menghapus pegawai';

      const contentType = response.headers.get('Content-Type') || '';
      if (contentType.includes('application/json')) {
        const errorBody: { message?: string } = await response.json();

        if (errorBody?.message) {
          errorMessage = errorBody.message;
        }

        // Contoh jika backend kirim pesan "not found"
        if (
          response.status === 404 &&
          errorBody?.message?.toLowerCase().includes('tidak ditemukan')
        ) {
          errorMessage = 'Data pegawai tidak ditemukan.';
        }
      } else {
        const text = await response.text();
        if (text) errorMessage = text;
      }

      throw new Error(errorMessage);
    }

    const data: DeletePegawaiResponse = await response.json();
    return data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Detail error delete:', err.message);
      throw err;
    } else {
      throw new Error('Kesalahan tak terduga saat menghapus pegawai.');
    }
  }
}
