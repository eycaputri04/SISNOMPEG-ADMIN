"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Poppins } from "next/font/google";
import TambahPendidikan from "@/components/TambahPendidikan";
import EditPendidikan, { PendidikanFormData } from "@/components/EditPendidikan";
import { getAllPendidikan } from "@/lib/api/pendidikan/get-pendidikan/router";
import { deletePendidikan } from "@/lib/api/pendidikan/delete-pendidikan/router";
import { getAllPegawai } from "@/lib/api/petugas/get-petugas/router";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export interface Pendidikan {
  ID_Pendidikan: string;
  Pegawai: string;
  Jenjang: string;
  Jurusan: string;
  Institusi: string;
  Tahun_Lulus: number;
  Nama_Pegawai?: string;
}

export default function PendidikanPage() {
  const [pendidikanList, setPendidikanList] = useState<Pendidikan[]>([]);
  const [pegawaiList, setPegawaiList] = useState<{ nip: string; nama: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isTambahOpen, setIsTambahOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedPendidikan, setSelectedPendidikan] = useState<PendidikanFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Ambil daftar pegawai
  const fetchPegawai = useCallback(async () => {
    try {
      const data = await getAllPegawai();
      setPegawaiList(data);
    } catch {
      toast.error("Gagal memuat daftar pegawai");
    }
  }, []);

  // Ambil data pendidikan
  const fetchPendidikan = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllPendidikan();
      const merged = data.map((p: Pendidikan) => {
        const pegawai = pegawaiList.find((pg) => pg.nip === p.Pegawai);
        return { ...p, Nama_Pegawai: pegawai ? pegawai.nama : "-" };
      });
      setPendidikanList(merged);
    } catch (err: unknown) {
      console.error("Error fetching pendidikan:", err);
      toast.error("Gagal memuat data pendidikan");
    } finally {
      setIsLoading(false);
    }
  }, [pegawaiList]);

  // Panggil fetchPegawai saat pertama kali render
  useEffect(() => {
    fetchPegawai();
  }, [fetchPegawai]);

  // Setelah pegawai berhasil dimuat, panggil fetchPendidikan
  useEffect(() => {
    if (pegawaiList.length > 0) {
      fetchPendidikan();
    }
  }, [pegawaiList, fetchPendidikan]);

  // Buka modal edit
  const handleEditClick = (data: Pendidikan) => {
    setSelectedPendidikan({
      id_pendidikan: data.ID_Pendidikan,
      pegawai: data.Pegawai,
      jenjang: data.Jenjang,
      jurusan: data.Jurusan,
      institusi: data.Institusi,
      tahun_lulus: String(data.Tahun_Lulus),
    });
    setIsEditOpen(true);
  };

  // Hapus pendidikan
  const handleDelete = async (data: Pendidikan) => {
    if (!confirm(`Yakin ingin menghapus data pendidikan milik ${data.Nama_Pegawai}?`)) return;

    try {
      setDeletingId(data.ID_Pendidikan);
      await deletePendidikan(data.ID_Pendidikan);
      setPendidikanList((prev) => prev.filter((p) => p.ID_Pendidikan !== data.ID_Pendidikan));
      toast.success("Data pendidikan berhasil dihapus");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menghapus data pendidikan";
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  // Filter pencarian
  const filteredList = pendidikanList.filter((p) =>
    p.Nama_Pegawai?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Modal Tambah */}
      <TambahPendidikan
        isOpen={isTambahOpen}
        onClose={() => setIsTambahOpen(false)}
        onSuccess={async () => {
          setIsTambahOpen(false);
          await fetchPendidikan();
        }}
      />

      {/* Modal Edit */}
      {selectedPendidikan && (
        <EditPendidikan
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          initialData={selectedPendidikan}
          onSuccess={async () => {
            setIsEditOpen(false);
            await fetchPendidikan();
          }}
        />
      )}

      {/* Layout utama */}
      <div
        className={`flex-1 p-4 md:p-8 flex-col text-black md:flex-row min-h-screen bg-gray-100 ${poppins.className}`}
      >
        <Sidebar active="Pendidikan" />
        <main className="flex-1 ml-56 py-10 overflow-y-auto transition-all duration-300">
          <Navbar
            title="Data Pendidikan"
            onAddClick={() => setIsTambahOpen(true)}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          {/* Tabel Data Pendidikan */}
          <div className="bg-white rounded-xl shadow-md overflow-auto mt-6">
            <table className="min-w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-blue-800 text-white text-xs md:text-sm">
                <tr>
                  <th className="px-4 py-3 rounded-tl-xl">Nama Pegawai</th>
                  <th className="px-4 py-3">Jenjang</th>
                  <th className="px-4 py-3">Jurusan</th>
                  <th className="px-4 py-3">Institusi</th>
                  <th className="px-4 py-3">Tahun Lulus</th>
                  <th className="px-4 py-3 text-center rounded-tr-xl">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-gray-500">
                      Memuat data pendidikan...
                    </td>
                  </tr>
                ) : filteredList.length > 0 ? (
                  filteredList.map((data) => (
                    <tr
                      key={data.ID_Pendidikan}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-all"
                    >
                      <td className="px-4 py-3">{data.Nama_Pegawai}</td>
                      <td className="px-4 py-3">{data.Jenjang}</td>
                      <td className="px-4 py-3">{data.Jurusan}</td>
                      <td className="px-4 py-3">{data.Institusi}</td>
                      <td className="px-4 py-3">{data.Tahun_Lulus}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-3">
                          <FaEdit
                            className="text-blue-800 hover:text-gray-600 cursor-pointer"
                            onClick={() => handleEditClick(data)}
                          />
                          <FaTrash
                            className={`cursor-pointer ${
                              deletingId === data.ID_Pendidikan
                                ? "opacity-50 cursor-not-allowed"
                                : "text-blue-800 hover:text-gray-600"
                            }`}
                            onClick={() =>
                              deletingId === data.ID_Pendidikan ? null : handleDelete(data)
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-gray-500">
                      Tidak ada data pendidikan ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </>
  );
}
