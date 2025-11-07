"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

import InputField from "./Input";
import Button from "./Button";
import ModalWrapper from "./ModalWrapper";
import { tambahStrukturOrganisasi } from "@/lib/api/struktur/post-struktur/router";
import { getAllPegawai } from "@/lib/api/petugas/get-petugas/router";

interface TambahStrukturProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

interface Pegawai {
  nip: string;
  nama: string;
}

export const TambahStruktur: React.FC<TambahStrukturProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({ petugas: "", jabatan: "", tmt: "" });
  const [listPetugas, setListPetugas] = useState<Pegawai[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({ petugas: "", jabatan: "", tmt: "" });
      getAllPegawai()
        .then(setListPetugas)
        .catch(() => toast.error("Gagal memuat daftar petugas"));
    }
  }, [isOpen]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.petugas || !formData.jabatan || !formData.tmt) {
      toast.error("Semua kolom wajib diisi");
      return;
    }

    setLoading(true);
    try {
      const result = await tambahStrukturOrganisasi({
        petugas: formData.petugas,
        jabatan: formData.jabatan,
        tmt: formData.tmt,
      });

      toast.success(result.message || "Struktur berhasil ditambahkan");
      await onSuccess();
      handleClose();
    } catch (error) {
      const errMsg =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan struktur";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ petugas: "", jabatan: "", tmt: "" });
    onClose();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      widthClass="max-w-4xl"
      title="Tambah Data Struktur"
    >
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4"
        autoComplete="off"
      >
        {/* Dropdown Petugas (pakai SelectField yang sama seperti TambahPegawai) */}
        <SelectField
          name="petugas"
          label="Petugas"
          value={formData.petugas}
          options={listPetugas.map((p) => `${p.nip} - ${p.nama}`)}
          onChange={(e) => {
            const nip = e.target.value.split(" - ")[0];
            setFormData((prev) => ({ ...prev, petugas: nip }));
          }}
        />

        {/* Input Jabatan */}
        <InputField
          name="jabatan"
          label="Jabatan"
          value={formData.jabatan}
          onChange={handleChange}
          placeholder="Contoh: Kepala Seksi Observasi"
        />

        {/* Input TMT */}
        <InputField
          name="tmt"
          type="date"
          label="TMT"
          value={formData.tmt}
          onChange={handleChange}
        />

        {/* Tombol Aksi */}
        <div className="flex justify-end gap-2 mt-4">
          <Button
            label="BATAL"
            onClick={handleClose}
            type="button"
            styleButton="bg-gray-600 text-white"
          />
          <Button
            label={loading ? "Menyimpan..." : "SIMPAN"}
            type="submit"
            disabled={loading}
            styleButton="bg-blue-800 text-white"
          />
        </div>
      </form>
    </ModalWrapper>
  );
};

/* ==============================
   Komponen SelectField
============================== */
interface SelectFieldProps {
  name: string;
  label: string;
  value: string;
  options: string[];
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
  name,
  label,
  value,
  options,
  onChange,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={(e) => {
            onChange(e);
            setIsOpen(false);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setIsOpen(false)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition"
        >
          <option value="" disabled>
            -- Pilih {label} --
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        {/* Ikon dropdown animasi */}
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </motion.svg>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default TambahStruktur;
