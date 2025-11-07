"use client";

import React, { useEffect, useState, useCallback } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { TambahStruktur } from "@/components/TambahStruktur";
import { EditStruktur } from "@/components/EditStruktur";
import { getAllStruktur } from "@/lib/api/struktur/get-struktur/router";
import { getAllPegawai } from "@/lib/api/petugas/get-petugas/router";
import { deleteStrukturOrganisasi } from "@/lib/api/struktur/delete-struktur/router";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

interface Struktur {
  id_struktur: string;
  pegawai: string; // NIP dari API
  jabatan: string;
  tmt: string;
  nama_petugas?: string;
}

interface Pegawai {
  nip: string;
  nama: string;
}

export default function StrukturPage() {
  const [strukturList, setStrukturList] = useState<Struktur[]>([]);
  const [, setPegawaiList] = useState<Pegawai[]>([]);
  const [isTambahOpen, setIsTambahOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedStruktur, setSelectedStruktur] = useState<Struktur | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const userId = "admin001"; // simulasi ID user

  // Ambil data struktur + pegawai
  const fetchStruktur = useCallback(async () => {
    setIsLoading(true);
    try {
      const [strukturData, fetchedPegawaiData] = await Promise.all([
        getAllStruktur(),
        getAllPegawai(),
      ]);

      // Gabungkan nama pegawai berdasarkan NIP
      const mergedData = strukturData.map((s) => {
        const pegawai = fetchedPegawaiData.find((p) => p.nip === s.pegawai);
        return {
          ...s,
          nama_petugas: pegawai ? pegawai.nama : s.pegawai, // fallback ke NIP
        };
      });

      setPegawaiList(fetchedPegawaiData);
      setStrukturList(mergedData);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data struktur organisasi");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStruktur();
  }, [fetchStruktur]);

  // Hapus data struktur
  const handleDelete = async (struktur: Struktur) => {
    if (!confirm(`Yakin ingin menghapus struktur milik ${struktur.nama_petugas}?`)) return;
    try {
      setDeletingId(struktur.id_struktur);
      await deleteStrukturOrganisasi(struktur.id_struktur);
      toast.success("Struktur berhasil dihapus");
      setStrukturList((prev) =>
        prev.filter((s) => s.id_struktur !== struktur.id_struktur)
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal menghapus struktur"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Edit data
  const handleEditClick = (struktur: Struktur) => {
    setSelectedStruktur(struktur);
    setIsEditOpen(true);
  };

  // Format tanggal
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return isNaN(date.getTime())
      ? "-"
      : date.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
  };

  // Filter pencarian (berdasarkan nama/NIP)
  const filteredStruktur = strukturList.filter(
    (s) =>
      s.nama_petugas?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.pegawai?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <ToastContainer />
      {/* Modal Tambah */}
      <TambahStruktur
        isOpen={isTambahOpen}
        onClose={() => setIsTambahOpen(false)}
        onSuccess={fetchStruktur}
      />

      {/* Modal Edit */}
      {selectedStruktur && (
        <EditStruktur
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          struktur={{
            id: selectedStruktur.id_struktur,
            petugas: selectedStruktur.pegawai,
            jabatan: selectedStruktur.jabatan,
            tmt: selectedStruktur.tmt,
          }}
          onSuccess={fetchStruktur}
        />
      )}

      <div
        className={`flex-1 p-4 md:p-8 flex-col text-black md:flex-row min-h-screen bg-gray-100 ${poppins.className}`}
      >
        <Sidebar active="Struktur Organisasi" />
        <main className="flex-1 ml-56 py-10 overflow-y-auto transition-all duration-300">
          <Navbar
            title="Data Struktur"
            onAddClick={() => setIsTambahOpen(true)}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          {/* 🔹 Tabel Data */}
          <div className="bg-white rounded-xl shadow-md overflow-auto">
            <table className="min-w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-blue-800 text-white text-xs md:text-sm">
                <tr>
                  <th className="px-4 py-3 rounded-tl-xl">Nama Pegawai</th>
                  <th className="px-4 py-3">Jabatan</th>
                  <th className="px-4 py-3">TMT</th>
                  <th className="px-4 py-3 text-center rounded-tr-xl">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-gray-500">
                      Memuat data struktur...
                    </td>
                  </tr>
                ) : filteredStruktur.length > 0 ? (
                  filteredStruktur.map((struktur, index) => (
                    <tr
                      key={struktur.id_struktur || `struktur-${index}`} // ✅ fix key
                      className="border-b border-gray-100 hover:bg-gray-50 transition-all"
                    >
                      <td className="px-4 py-3">
                        {struktur.nama_petugas || struktur.pegawai}
                      </td>
                      <td className="px-4 py-3">{struktur.jabatan || "-"}</td>
                      <td className="px-4 py-3">{formatDate(struktur.tmt)}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-3">
                          <FaEdit
                            className="text-blue-800 hover:text-gray-600 cursor-pointer"
                            onClick={() => handleEditClick(struktur)}
                          />
                          <FaTrash
                            className={`cursor-pointer ${
                              deletingId === struktur.id_struktur
                                ? "opacity-50 cursor-not-allowed"
                                : "text-blue-800 hover:text-gray-600"
                            }`}
                            onClick={() =>
                              deletingId === struktur.id_struktur
                                ? null
                                : handleDelete(struktur)
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-gray-500">
                      Tidak ada data struktur ditemukan.
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
