"use client";

import React from "react";
import { IoIosArrowDropleftCircle } from "react-icons/io";
import { Jabatan } from "@/interface/Jabatan";

interface CardModalProps {
  pegawai: Jabatan | null;
  isOpen: boolean;
  onClose: () => void;
}

// Fungsi untuk format tanggal
const formatTanggal = (dateStr?: string): string => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr; // fallback kalau tidak valid
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const CardModal: React.FC<CardModalProps> = ({ pegawai, isOpen, onClose }) => {
  if (!isOpen || !pegawai) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.75)" }}
    >
      <div className="bg-[#196DB8] text-white rounded-xl py-10 px-8 max-w-md w-full flex flex-col gap-6 relative">
        {/* Tombol Tutup */}
        <button
          className="absolute top-4 left-4 text-white text-2xl"
          onClick={onClose}
          aria-label="Tutup modal"
        >
          <IoIosArrowDropleftCircle />
        </button>

        {/* Info Pegawai */}
        <div className="flex flex-col justify-center text-left text-sm sm:text-base space-y-2">
          <p>
            <strong>Nama:</strong> {pegawai.nama_lengkap}
          </p>
          <p>
            <strong>NIP:</strong> {pegawai.nip}
          </p>
          <p>
            <strong>Jabatan:</strong> {pegawai.jabatan}
          </p>
          {pegawai.tmt && (
            <p>
              <strong>TMT:</strong> {formatTanggal(pegawai.tmt)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardModal;
