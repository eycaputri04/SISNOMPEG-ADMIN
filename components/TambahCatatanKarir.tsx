"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ModalWrapper from "./ModalWrapper";
import InputField from "./Input";
import Button from "./Button";

import { tambahCatatanKarir } from "@/lib/api/catatan-karir/post-catatan-karir/router";
import { getAllPegawai } from "@/lib/api/petugas/get-petugas/router";

interface TambahCatatanKarirProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
}

interface Pegawai {
  nip: string;
  nama: string;
}

const pangkatOptions = [
  "Ia", "Ib", "Ic", "Id",
  "IIa", "IIb", "IIc", "IId",
  "IIIa", "IIIb", "IIIc", "IIId",
  "IVa", "IVb", "IVc", "IVd", "IVe",
];

const statusOptions = ["Layak", "Belum Layak", "Tidak Layak"];

export const TambahCatatanKarir: React.FC<TambahCatatanKarirProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    nip: "",
    pangkatSekarang: "",
    potensiPangkatBaru: "",
    tanggalLayak: "",
    status: "",
    catatan: "",
  });

  const [listPegawai, setListPegawai] = useState<Pegawai[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        nip: "",
        pangkatSekarang: "",
        potensiPangkatBaru: "",
        tanggalLayak: "",
        status: "",
        catatan: "",
      });
      getAllPegawai()
        .then(setListPegawai)
        .catch(() => toast.error("Gagal memuat daftar pegawai"));
    }
  }, [isOpen]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { nip, pangkatSekarang } = formData;
    return nip && pangkatSekarang;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("NIP dan Pangkat Sekarang wajib diisi!");
      return;
    }

    setLoading(true);
    try {
      const result = await tambahCatatanKarir({
        nip: formData.nip,
        pangkatSekarang: formData.pangkatSekarang,
        potensiPangkatBaru: formData.potensiPangkatBaru,
        tanggalLayak: formData.tanggalLayak,
        status: formData.status,
        catatan: formData.catatan,
      });

      toast.success(result.message || "Data catatan karir berhasil ditambahkan");
      await onSuccess();
      handleClose();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menambah data catatan karir"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      nip: "",
      pangkatSekarang: "",
      potensiPangkatBaru: "",
      tanggalLayak: "",
      status: "",
      catatan: "",
    });
    onClose();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      widthClass="max-w-4xl"
      title="Tambah Catatan Karir"
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4" autoComplete="off">
        {/* Pilih Pegawai */}
        <SelectField
          name="nip"
          label="Pegawai"
          value={formData.nip}
          onChange={handleChange}
          options={listPegawai.map((p) => ({
            value: p.nip,
            label: `${p.nama} (${p.nip})`,
          }))}
        />

        {/* Pangkat Sekarang */}
        <SelectField
          name="pangkatSekarang"
          label="Pangkat Sekarang"
          value={formData.pangkatSekarang}
          onChange={handleChange}
          options={pangkatOptions.map((p) => ({ value: p, label: p }))}
        />

        {/* Potensi Pangkat Baru */}
        <SelectField
          name="potensiPangkatBaru"
          label="Potensi Pangkat Baru"
          value={formData.potensiPangkatBaru}
          onChange={handleChange}
          options={pangkatOptions.map((p) => ({ value: p, label: p }))}
        />

        {/* Tanggal Layak */}
        <InputField
          name="tanggalLayak"
          label="Tanggal Layak Naik Pangkat"
          type="date"
          value={formData.tanggalLayak}
          onChange={handleChange}
        />

        {/* Status */}
        <SelectField
          name="status"
          label="Status Kelayakan"
          value={formData.status}
          onChange={handleChange}
          options={statusOptions.map((s) => ({ value: s, label: s }))}
        />

        {/* Catatan */}
        <div className="flex flex-col gap-1">
          <label htmlFor="catatan" className="text-sm font-medium text-gray-700">
            Catatan
          </label>
          <textarea
            name="catatan"
            value={formData.catatan}
            onChange={handleChange}
            placeholder="Contoh: Sudah memenuhi masa kerja dan syarat kenaikan pangkat."
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

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

export default TambahCatatanKarir;

/* ---------------- SelectField ---------------- */
interface SelectFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  error?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
  name,
  label,
  value,
  onChange,
  options,
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
            <option key={opt.value} value={opt.value}>
              {opt.label}
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
