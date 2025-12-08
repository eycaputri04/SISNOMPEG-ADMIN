"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ModalWrapper from "./ModalWrapper";
import InputField from "./Input";
import Button from "./Button";

import { tambahPendidikan } from "@/lib/api/pendidikan/post-pendidikan/router";
import { getAllPegawai } from "@/lib/api/petugas/get-petugas/router";
import { getAllPendidikan, Pendidikan as TPendidikan } from "@/lib/api/pendidikan/get-pendidikan/router";

interface TambahPendidikanProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
}

interface Pegawai {
  nip: string;
  nama: string;
}

export const TambahPendidikan: React.FC<TambahPendidikanProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    pegawai: "",
    jenjang: "",
    jurusan: "",
    institusi: "",
    tahun_lulus: "",
  });

  const [listPegawai, setListPegawai] = useState<Pegawai[]>([]);
  const [listPendidikan, setListPendidikan] = useState<TPendidikan[]>([]);
  const [loading, setLoading] = useState(false);

  // Saat modal dibuka, load data
  useEffect(() => {
    if (isOpen) {
      setFormData({
        pegawai: "",
        jenjang: "",
        jurusan: "",
        institusi: "",
        tahun_lulus: "",
      });

      getAllPegawai()
        .then(setListPegawai)
        .catch(() => toast.error("Gagal memuat daftar pegawai"));

      getAllPendidikan()
        .then(setListPendidikan)
        .catch(() => toast.error("Gagal memuat data pendidikan"));
    }
  }, [isOpen]);

  // ================================
  // VALIDASI DUPLIKAT
  // ================================
  useEffect(() => {
    if (!formData.pegawai || !formData.jenjang) return;

    const duplikat = listPendidikan.some((p) => {
      return (
        String(p.Pegawai).trim() === String(formData.pegawai).trim() &&
        String(p.Jenjang).toUpperCase() === formData.jenjang.toUpperCase()
      );
    });

    if (duplikat) {
      toast.error(
        `Pegawai ini sudah memiliki jenjang ${formData.jenjang.toUpperCase()}!`
      );
      setFormData((prev) => ({ ...prev, jenjang: "" }));
    }
  }, [formData.pegawai, formData.jenjang, listPendidikan]);

  // Handle input
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "tahun_lulus") {
      const numeric = value.replace(/\D/g, "");
      if (numeric.length <= 4)
        setFormData((prev) => ({ ...prev, [name]: numeric }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Validasi umum
  const validateForm = () => {
    const { pegawai, jenjang, jurusan, institusi, tahun_lulus } = formData;
    if (!pegawai || !jenjang || !jurusan || !institusi || !tahun_lulus)
      return false;
    if (!/^\d{4}$/.test(tahun_lulus)) return false;
    return true;
  };

  // Submit
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Periksa kembali data yang belum lengkap atau salah!");
      return;
    }

    setLoading(true);
    try {
      const result = await tambahPendidikan({
        pegawai: formData.pegawai,
        jenjang: formData.jenjang,
        jurusan: formData.jurusan,
        institusi: formData.institusi,
        tahunLulus: Number(formData.tahun_lulus),
      });

      toast.success(result.message || "Data pendidikan berhasil ditambahkan");
      await onSuccess();
      handleClose();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menambah data Pendidikan"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      pegawai: "",
      jenjang: "",
      jurusan: "",
      institusi: "",
      tahun_lulus: "",
    });
    onClose();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      widthClass="max-w-4xl"
      title="Tambah Data Pendidikan"
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4" autoComplete="off">
        <SelectField
          name="pegawai"
          label="Pegawai"
          value={formData.pegawai}
          options={listPegawai.map((p) => `${p.nip} - ${p.nama}`)}
          onChange={(e) => {
            const nip = e.target.value.split(" - ")[0];
            setFormData((prev) => ({ ...prev, pegawai: nip }));
          }}
        />

        <InputField
          name="jenjang"
          label="Jenjang"
          value={formData.jenjang}
          onChange={handleChange}
          placeholder="Contoh: S1"
        />
        <InputField
          name="jurusan"
          label="Jurusan"
          value={formData.jurusan}
          onChange={handleChange}
          placeholder="Contoh: Meteorologi"
        />
        <InputField
          name="institusi"
          label="Institusi"
          value={formData.institusi}
          onChange={handleChange}
          placeholder="Contoh: Universitas Indonesia"
        />
        <InputField
          name="tahun_lulus"
          label="Tahun Lulus"
          value={formData.tahun_lulus}
          onChange={handleChange}
          placeholder="Contoh: 2024"
        />

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

/* ============================
   SelectField Component
============================ */
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

export default TambahPendidikan;
