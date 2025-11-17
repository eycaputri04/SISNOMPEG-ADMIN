"use client";

import React, { useState, useEffect } from "react";
import { FaTrash, FaEye, FaDownload } from "react-icons/fa";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { TambahPegawai } from "@/components/TambahPegawai";
import { EditPegawai } from "@/components/EditPegawai";
import { getAllPegawai } from "@/lib/api/petugas/get-petugas/router";
import { deletePetugas } from "@/lib/api/petugas/delete-petugas/router";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export interface Pegawai {
  nip: string;
  nama: string;
  tempat_tanggal_lahir: string;
  pendidikan_terakhir: string;
  pangkat_golongan: string;
  kgb_berikutnya: string;
  tmt: string;
  jenis_kelamin: string;
  agama: string;
  status_kepegawaian: string;
  gaji_pokok: number;
  jumlah_anak: number;
}

// Format tanggal ke DD-MM-YYYY
const formatDate = (tanggal: string) => {
  if (!tanggal) return "-";
  const date = new Date(tanggal);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export default function PegawaiPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedPegawai, setSelectedPegawai] = useState<Pegawai | null>(null);
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "golongan" | "kgb">("default");

  const fetchData = async () => {
    try {
      const data = await getAllPegawai();
      setPegawaiList(data);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Gagal memuat data pegawai");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditClick = (pegawai: Pegawai) => {
    setSelectedPegawai(pegawai);
    setIsEditOpen(true);
  };

  const handleDelete = async (nip: string) => {
    if (!confirm("Yakin ingin menghapus data ini?")) return;
    try {
      await deletePetugas(nip);
      toast.success("Data berhasil dihapus");
      fetchData();
    } catch {
      toast.error("Gagal menghapus data");
    }
  };

  const filteredList = pegawaiList
    .filter((p) => p.nama.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "golongan") {
        return b.pangkat_golongan.localeCompare(a.pangkat_golongan);
      }
      if (sortBy === "kgb") {
        const dateA = new Date(a.kgb_berikutnya || "2100-01-01");
        const dateB = new Date(b.kgb_berikutnya || "2100-01-01");
        return dateA.getTime() - dateB.getTime();
      }
      return 0;
    });

  /** Generate PDF */
  const handleDownloadPDF = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;
      const doc = new jsPDF("landscape", "mm", "a4"); 

      // ======== HEADER FORMAL BMKG =========
      const img = new window.Image();
      img.src = "/Logo.png"; 

      doc.addImage(img, "PNG", 15, 10, 20, 20);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("BADAN METEOROLOGI, KLIMATOLOGI, DAN GEOFISIKA", 45, 15);
      doc.setFont("helvetica", "normal");
      doc.text("STASIUN KLIMATOLOGI PROVINSI BENGKULU", 45, 22);
      doc.setFontSize(10);
      doc.text("Jl. R.E. Martadinata, Kelurahan Kandang, Kecamatan Kampung Melayu,Kota Bengkulu, Bengkulu -38216 - Indonesia", 45, 28);
      doc.text("Telp. (0811) 7321-291 |  Email: staklim.pulaubaai@bmkg.go.id", 45, 33);

      doc.setLineWidth(0.5);
      doc.line(15, 36, 282, 36); // garis sepanjang landscape A4

      // ======== JUDUL LAPORAN =========
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("LAPORAN DATA PEGAWAI", 148.5, 45, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString("id-ID")}`, 15, 52);

      // ======== TABEL DATA =========
      autoTable(doc, {
        startY: 58,
        head: [
          [
            "No",
            "NIP",
            "Nama Pegawai",
            "Pangkat/Golongan",
            "KGB Berikutnya",
            "TMT",
            "Jenis Kelamin",
            "Pendidikan",
            "Status",
            "Gaji Pokok",
            "Jumlah Anak",
          ],
        ],
        body: pegawaiList.map((p, i) => [
          i + 1,
          p.nip,
          p.nama,
          p.pangkat_golongan,
          formatDate(p.kgb_berikutnya),
          formatDate(p.tmt),
          p.jenis_kelamin,
          p.pendidikan_terakhir,
          p.status_kepegawaian,
          p.gaji_pokok.toLocaleString("id-ID"),
          p.jumlah_anak,
        ]),
        theme: "grid",
        styles: {
          fontSize: 8,
          cellPadding: 2.5,
        },
        headStyles: {
          fillColor: [30, 64, 175],
          textColor: [255, 255, 255],
          halign: "center",
        },
        bodyStyles: { halign: "center" },
        alternateRowStyles: { fillColor: [245, 247, 255] },
        margin: { left: 10, right: 10 },
      });

      // ======== FOOTER TANDA TANGAN =========
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(11);
      doc.text("Mengetahui,", 230, pageHeight - 40);
      doc.text("Kepala Stasiun Klimatologi Bengkulu", 230, pageHeight - 35);
      doc.text("(_________________________)", 230, pageHeight - 15);

      // ======== SIMPAN PDF =========
      doc.save(`Data_Pegawai_BMKG_${new Date().toLocaleDateString("id-ID")}.pdf`);
    } catch (error) {
      console.error("Gagal membuat PDF:", error);
      toast.error("Gagal membuat PDF");
    }
  };

  return (
    <>
      <TambahPegawai
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
      />
      <EditPegawai
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={fetchData}
        initialData={selectedPegawai}
      />

      <div
        className={`flex-1 p-4 md:p-8 transition-all flex-col text-black md:flex-row min-h-screen bg-gray-100 ${poppins.className}`}
      >
        <Sidebar active="Pegawai" />
        <main className="flex-1 ml-56 py-10 overflow-y-auto transition-all duration-300">
          <Navbar
            title="Data Pegawai"
            onAddClick={() => setIsModalOpen(true)}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          {/* Header Controls */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 bg-blue-800 text-white px-4 py-2 rounded-full hover:bg-blue-900 transition"
            >
              <FaDownload /> Unduh PDF
            </button>

           <div className="flex items-center gap-2 bg-white border border-blue-800 rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-all">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="rgb(30, 64, 175)"
                className="w-5 h-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M3 12h12m-6 8h6" />
              </svg>

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "default" | "golongan" | "kgb")
                }
                className="bg-transparent text-blue-900 font-medium text-sm focus:outline-none cursor-pointer"
              >
                <option value="default">Urutkan berdasarkan</option>
                <option value="golongan">Pangkat/Golongan</option>
                <option value="kgb">KGB Mendatang</option>
              </select>
            </div>          
          </div>

          {/* Tabel Pegawai */}
          <div className="bg-white rounded-xl shadow-md overflow-auto">
            <table className="min-w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-blue-800 text-white text-xs md:text-sm">
                <tr>
                  <th className="px-4 py-3 rounded-tl-xl">NIP</th>
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Pangkat/Golongan</th>
                  <th className="px-4 py-3">KGB Berikutnya</th>
                  <th className="px-4 py-3">TMT</th>
                  <th className="px-4 py-3">Jenis Kelamin</th>
                  <th className="px-4 py-3 text-center rounded-tr-xl">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.length > 0 ? (
                  filteredList.map((pegawai) => (
                    <tr
                      key={pegawai.nip}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-all"
                    >
                      <td className="px-4 py-3">{pegawai.nip}</td>
                      <td className="px-4 py-3">{pegawai.nama}</td>
                      <td className="px-4 py-3">{pegawai.pangkat_golongan}</td>
                      <td className="px-4 py-3">
                        {formatDate(pegawai.kgb_berikutnya)}
                      </td>
                      <td className="px-4 py-3">{formatDate(pegawai.tmt)}</td>
                      <td className="px-4 py-3">{pegawai.jenis_kelamin}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-3">
                          <FaEye
                            className="text-blue-800 hover:text-gray-600 cursor-pointer"
                            onClick={() => handleEditClick(pegawai)}
                          />
                          <FaTrash
                            className="text-blue-800 hover:text-gray-600 cursor-pointer"
                            onClick={() => handleDelete(pegawai.nip)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={15} className="text-center py-6 text-gray-500">
                      Tidak ada pegawai ditemukan.
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
