const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

export async function deletePenjenjangan(id: string): Promise<{ message: string }> {
  if (!id) throw new Error("ID penjenjangan diperlukan");

  const res = await fetch(`${API_BASE_URL}/penjenjangan/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Gagal menghapus data penjenjangan");
  }

  const data = await res.json();
  return data; // { message: "Data penjenjangan berhasil dihapus" }
}
