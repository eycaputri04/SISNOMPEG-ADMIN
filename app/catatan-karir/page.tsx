"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import TambahCatatanKarir from "@/components/TambahCatatanKarir";
import EditCatatanKarir from "@/components/EditCatatanKarir";
import { deleteCatatanKarir } from "@/lib/api/catatan-karir/delete-catatan-karir/router";
import { getAllPegawai } from "@/lib/api/petugas/get-petugas/router";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export interface CatatanKarir {
  id_catatan: string;
  NIP: string;
  Pangkat_Sekarang: string;
  Potensi_Pangkat_Baru: string;
  Tanggal_Layak: string;
  Status: string;
  Catatan: string;
  Nama_Pegawai?: string;
}

// Tambahkan tipe khusus untuk data edit
interface EditCatatanKarirData {
  id: string;
  nip: string;
  pangkatSekarang: string;
  potensiPangkatBaru?: string;
  tanggalLayak?: string;
  status?: string;
  catatan?: string;
}

export default function CatatanKarirPage() {
  const [catatanList, setCatatanList] = useState<CatatanKarir[]>([]);
  const [pegawaiList, setPegawaiList] = useState<{ nip: string; nama: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isTambahOpen, setIsTambahOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  // Gunakan tipe yang benar
  const [selectedCatatan, setSelectedCatatan] = useState<EditCatatanKarirData | null>(null);

  const fetchPegawai = useCallback(async () => {
    try {
      const data = await getAllPegawai();
      setPegawaiList(data);
    } catch {
      toast.error("Gagal memuat daftar pegawai");
    }
  }, []);

  const fetchCatatanKarir = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}catatan-karir`);
      if (!res.ok) throw new Error("Gagal memuat data catatan karir");

      const data: CatatanKarir[] = await res.json();
      const merged = data.map((item) => {
        const pegawai = pegawaiList.find((pg) => pg.nip === item.NIP);
        return { ...item, Nama_Pegawai: pegawai ? pegawai.nama : "-" };
      });

      setCatatanList(merged);
    } catch (err) {
      console.error("Error fetching catatan karir:", err);
      toast.error("Gagal memuat data catatan karir");
    }
  }, [pegawaiList]);

  useEffect(() => {
    fetchPegawai();
  }, [fetchPegawai]);

  useEffect(() => {
    if (pegawaiList.length > 0) fetchCatatanKarir();
  }, [pegawaiList, fetchCatatanKarir]);

  const handleEditClick = (data: CatatanKarir) => {
    setSelectedCatatan({
      id: data.id_catatan,
      nip: data.NIP,
      pangkatSekarang: data.Pangkat_Sekarang,
      potensiPangkatBaru: data.Potensi_Pangkat_Baru,
      tanggalLayak: data.Tanggal_Layak,
      status: data.Status,
      catatan: data.Catatan,
    });
    setIsEditOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Yakin hapus data catatan karir ini?")) {
      try {
        const { message } = await deleteCatatanKarir(id);
        toast.success(message);
        setCatatanList((prev) => prev.filter((c) => c.id_catatan !== id));
      } catch (error: unknown) {
        toast.error(
          error instanceof Error ? error.message : "Gagal menghapus data catatan karir"
        );
      }
    }
  };

  const filteredList = catatanList.filter((c) =>
    c.Nama_Pegawai?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <TambahCatatanKarir
        isOpen={isTambahOpen}
        onClose={() => setIsTambahOpen(false)}
        onSuccess={async () => {
          await fetchCatatanKarir();
          setIsTambahOpen(false);
        }}
      />

      {selectedCatatan && (
        <EditCatatanKarir
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSuccess={async () => {
            await fetchCatatanKarir();
            setIsEditOpen(false);
          }}
          initialData={selectedCatatan}
        />
      )}

      <div
        className={`flex-1 p-4 md:p-8 flex-col text-black md:flex-row min-h-screen bg-gray-100 ${poppins.className}`}
      >
        <Sidebar active="Catatan Karir" />
        <main className="flex-1 ml-56 py-10 overflow-y-auto transition-all duration-300">
          <Navbar
            title="Catatan Karir Pegawai"
            onAddClick={() => setIsTambahOpen(true)}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          <div className="bg-white rounded-xl shadow-md overflow-auto">
            <table className="min-w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-blue-800 text-white text-xs md:text-sm">
                <tr>
                  <th className="px-4 py-3 rounded-tl-xl">Nama Pegawai</th>
                  <th className="px-4 py-3">Pangkat Sekarang</th>
                  <th className="px-4 py-3">Potensi Pangkat Baru</th>
                  <th className="px-4 py-3">Tanggal Layak</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Catatan</th>
                  <th className="px-4 py-3 text-center rounded-tr-xl">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.length > 0 ? (
                  filteredList.map((data) => (
                    <tr
                      key={data.id_catatan}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-all"
                    >
                      <td className="px-4 py-3">{data.Nama_Pegawai}</td>
                      <td className="px-4 py-3">{data.Pangkat_Sekarang}</td>
                      <td className="px-4 py-3">{data.Potensi_Pangkat_Baru}</td>
                      <td className="px-4 py-3">{data.Tanggal_Layak}</td>
                      <td className="px-4 py-3">{data.Status}</td>
                      <td className="px-4 py-3">{data.Catatan}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-3">
                          <FaEdit
                            className="text-blue-800 hover:text-gray-600 cursor-pointer"
                            onClick={() => handleEditClick(data)}
                          />
                          <FaTrash
                            className="text-blue-800 hover:text-gray-600 cursor-pointer"
                            onClick={() => handleDelete(data.id_catatan)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-gray-500">
                      Tidak ada data catatan karir ditemukan.
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
