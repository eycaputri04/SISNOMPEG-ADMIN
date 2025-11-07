const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '');

export interface tambahPegawai {
  NIP: string;
  Nama: string;
  Tempat_Tanggal_Lahir?: string;
  Pendidikan_Terakhir?: string;
  Pangkat_Golongan?: string;
  KGB_Berikutnya?: string;
  TMT?: string;
  Jenis_Kelamin?: string;
  Agama?: string;
  Status_Kepegawaian?: string;
  Gaji_Pokok?: number;
  Jumlah_Anak?: number;
}

export interface PegawaiResponse {
  message: string;
  data: tambahPegawai;
}

export async function tambahPegawai(
  payload: tambahPegawai
): Promise<PegawaiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/pegawai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMessage = 'Terjadi kesalahan saat menambahkan pegawai';

      const contentType = response.headers.get('Content-Type') || '';
      if (contentType.includes('application/json')) {
        const errorBody: { message?: string } = await response.json();

        if (errorBody?.message) {
          errorMessage = errorBody.message;
        }

        if (
          response.status === 400 &&
          errorBody?.message?.toLowerCase().includes('duplicate') &&
          errorBody?.message?.toLowerCase().includes('nip')
        ) {
          errorMessage = 'NIP sudah terdaftar. Silakan gunakan NIP yang berbeda.';
        }
      } else {
        const text = await response.text();
        if (text) errorMessage = text;
      }

      throw new Error(errorMessage);
    }

    const data: PegawaiResponse = await response.json();
    return data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Detail error:', err.message);
      throw err;
    } else {
      throw new Error('Kesalahan tak terduga saat menambahkan pegawai.');
    }
  }
}
