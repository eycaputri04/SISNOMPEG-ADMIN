"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Poppins } from "next/font/google";
import { getAllPegawai } from "@/lib/api/petugas/get-petugas/router";
import { getPenjenjangan } from "@/lib/api/penjenjangan/get-penjenjangan/router";
import { TambahPenjenjangan } from "@/components/TambahPenjenjangan";
import { EditPenjenjangan, Penjenjangan } from "@/components/EditPenjenjangan";
import { deletePenjenjangan } from "@/lib/api/penjenjangan/delete-penjenjangan/router";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

interface Pegawai {
  nip: string;
  nama: string;
}

interface RawPenjenjangan {
  ID_Penjenjangan: string;
  Pegawai: string;
  Nama_Penjenjangan: string;
  Tahun_Pelaksanaan: string | number;
  Penyelenggara: string;
}

export default function PenjenjanganPage() {
  const [penjenjanganList, setPenjenjanganList] = useState<Penjenjangan[]>([]);
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isTambahOpen, setIsTambahOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<Penjenjangan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /** Ambil daftar pegawai */
  const fetchPegawai = useCallback(async () => {
    try {
      const data = await getAllPegawai();
      setPegawaiList(data);
    } catch {
      toast.error("Gagal memuat daftar pegawai");
    }
  }, []);

  /** Ambil data penjenjangan dan gabungkan nama pegawai */
  const fetchPenjenjanganData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getPenjenjangan();
      const merged: Penjenjangan[] = res.penjenjangan.map((p: RawPenjenjangan) => {
        const pegawai = pegawaiList.find((pg) => pg.nip === p.Pegawai);
        return {
          id: p.ID_Penjenjangan,
          nip: p.Pegawai,
          nama_pegawai: pegawai ? pegawai.nama : "-",
          nama_penjenjangan: p.Nama_Penjenjangan,
          tahun_pelaksanaan: String(p.Tahun_Pelaksanaan),
          penyelenggara: p.Penyelenggara,
        };
      });
      setPenjenjanganList(merged);
    } catch (err : unknown) {
      console.error("Error fetching penjenjangan data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [pegawaiList]);

  useEffect(() => {
    fetchPegawai();
  }, [fetchPegawai]);

  useEffect(() => {
    if (pegawaiList.length > 0) fetchPenjenjanganData();
  }, [pegawaiList, fetchPenjenjanganData]);

  /** Buka modal edit */
  const handleEditClick = (data: Penjenjangan) => {
    setSelectedData(data);
    setIsEditOpen(true);
  };

  /** Hapus data penjenjangan */
  const handleDelete = async (data: Penjenjangan) => {
    if (!confirm(`Yakin ingin menghapus data penjenjangan milik ${data.nama_pegawai}?`)) return;

    try {
      setDeletingId(data.id);
      await deletePenjenjangan(data.id);
      setPenjenjanganList((prev) => prev.filter((p) => p.id !== data.id));
      toast.success("Data penjenjangan berhasil dihapus");
    } catch (err) {
        console.error("Error deleting data:", err);
        toast.error("Gagal menghapus data");
    } finally {
      setDeletingId(null);
    }
  };

  /** Filter pencarian */
  const filteredList = penjenjanganList.filter((p) =>
    p.nama_pegawai?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Modal Tambah */}
      <TambahPenjenjangan
        isOpen={isTambahOpen}
        onClose={() => setIsTambahOpen(false)}
        onSuccess={async () => {
          setIsTambahOpen(false);
          await fetchPenjenjanganData();
          toast.success("Data penjenjangan berhasil ditambahkan");
        }}
      />

      {/* Modal Edit */}
      {selectedData && (
        <EditPenjenjangan
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          initialData={selectedData}
          onSuccess={async () => {
            setIsEditOpen(false);
            await fetchPenjenjanganData();
            toast.success("Data penjenjangan berhasil diperbarui");
          }}
        />
      )}

      {/* Layout Utama */}
      <div
        className={`flex-1 p-4 md:p-8 flex-col text-black md:flex-row min-h-screen bg-gray-100 ${poppins.className}`}
      >
        <Sidebar active="Penjenjangan" />
        <main className="flex-1 ml-56 py-10 overflow-y-auto transition-all duration-300">
          <Navbar
            title="Data Penjenjangan"
            onAddClick={() => setIsTambahOpen(true)}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          {/* Tabel Data */}
          <div className="bg-white rounded-xl shadow-md overflow-auto mt-6">
            <table className="min-w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-blue-800 text-white text-xs md:text-sm">
                <tr>
                  <th className="px-4 py-3 rounded-tl-xl">Nama Pegawai</th>
                  <th className="px-4 py-3">Nama Penjenjangan</th>
                  <th className="px-4 py-3">Tahun Pelaksanaan</th>
                  <th className="px-4 py-3">Penyelenggara</th>
                  <th className="px-4 py-3 text-center rounded-tr-xl">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-500">
                      Memuat data penjenjangan...
                    </td>
                  </tr>
                ) : filteredList.length > 0 ? (
                  filteredList.map((data) => (
                    <tr
                      key={data.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-all"
                    >
                      <td className="px-4 py-3">{data.nama_pegawai}</td>
                      <td className="px-4 py-3">{data.nama_penjenjangan}</td>
                      <td className="px-4 py-3">{data.tahun_pelaksanaan}</td>
                      <td className="px-4 py-3">{data.penyelenggara}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-3">
                          <FaEdit
                            className="text-blue-800 hover:text-gray-600 cursor-pointer"
                            onClick={() => handleEditClick(data)}
                          />
                          <FaTrash
                            className={`cursor-pointer ${
                              deletingId === data.id
                                ? "opacity-50 cursor-not-allowed"
                                : "text-blue-800 hover:text-gray-600"
                            }`}
                            onClick={() =>
                              deletingId === data.id ? null : handleDelete(data)
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-500">
                      Tidak ada data penjenjangan ditemukan.
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
