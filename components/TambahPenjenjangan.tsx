"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ModalWrapper from "./ModalWrapper";
import InputField from "./Input";
import Button from "./Button";

import { tambahPenjenjangan } from "@/lib/api/penjenjangan/post-penjenjangan/router";
import { getAllPegawai } from "@/lib/api/petugas/get-petugas/router";

interface TambahPenjenjanganProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newData: Penjenjangan) => void;
}

interface Pegawai {
  nip: string;
  nama: string;
}

export interface Penjenjangan {
  id: string;
  nip: string;
  nama_pegawai: string;
  nama_penjenjangan: string;
  tahun_pelaksanaan: string;
  penyelenggara: string;
}

export const TambahPenjenjangan: React.FC<TambahPenjenjanganProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    pegawai: "",
    nama_penjenjangan: "",
    tahun_pelaksanaan: "",
    penyelenggara: "",
  });
  const [listPegawai, setListPegawai] = useState<Pegawai[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        pegawai: "",
        nama_penjenjangan: "",
        tahun_pelaksanaan: "",
        penyelenggara: "",
      });
      getAllPegawai()
        .then(setListPegawai)
        .catch(() => toast.error("Gagal memuat daftar pegawai"));
    }
  }, [isOpen]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "tahun_pelaksanaan") {
      const numeric = value.replace(/\D/g, "");
      if (numeric.length <= 4)
        setFormData((prev) => ({ ...prev, [name]: numeric }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    const { pegawai, nama_penjenjangan, tahun_pelaksanaan, penyelenggara } =
      formData;
    if (!pegawai || !nama_penjenjangan || !tahun_pelaksanaan || !penyelenggara)
      return false;
    if (!/^\d{4}$/.test(tahun_pelaksanaan)) return false;
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.warning("Periksa kembali data yang belum lengkap atau salah!");
      return;
    }

    setLoading(true);
    try {
      const selectedPegawai = listPegawai.find(
        (p) => p.nip === formData.pegawai
      );
      if (!selectedPegawai) throw new Error("Pegawai tidak valid");

      const result = await tambahPenjenjangan({
        pegawai: formData.pegawai,
        namaPenjenjangan: formData.nama_penjenjangan,
        tahunPelaksanaan: Number(formData.tahun_pelaksanaan),
        penyelenggara: formData.penyelenggara,
      });

      onSuccess({
        id: result.penjenjangan.ID_Penjenjangan,
        nip: formData.pegawai,
        nama_pegawai: selectedPegawai.nama,
        nama_penjenjangan: formData.nama_penjenjangan,
        tahun_pelaksanaan: formData.tahun_pelaksanaan,
        penyelenggara: formData.penyelenggara,
      });

      handleClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || "Gagal menambahkan penjenjangan");
      } else {
        toast.error("Gagal menambahkan penjenjangan");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      pegawai: "",
      nama_penjenjangan: "",
      tahun_pelaksanaan: "",
      penyelenggara: "",
    });
    onClose();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      widthClass="max-w-4xl"
      title="Tambah Data Penjenjangan"
    >
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4"
        autoComplete="off"
      >
        {/* Dropdown Pegawai (pakai SelectField animasi) */}
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
          name="nama_penjenjangan"
          label="Nama Penjenjangan"
          value={formData.nama_penjenjangan}
          onChange={handleChange}
          placeholder="Masukkan nama penjenjangan"
        />
        <InputField
          name="tahun_pelaksanaan"
          label="Tahun Pelaksanaan"
          value={formData.tahun_pelaksanaan}
          onChange={handleChange}
          placeholder="Contoh: 2024"
        />
        <InputField
          name="penyelenggara"
          label="Penyelenggara"
          value={formData.penyelenggara}
          onChange={handleChange}
          placeholder="Masukkan penyelenggara"
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

        {/* Icon Dropdown dengan animasi */}
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

export default TambahPenjenjangan;
