"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ModalWrapper from "./ModalWrapper";
import InputField from "./Input";
import Button from "./Button";

import { tambahPendidikan } from "@/lib/api/pendidikan/post-pendidikan/router";
import { getAllPegawai } from "@/lib/api/petugas/get-petugas/router";
import {
  getAllPendidikan,
  Pendidikan as TPendidikan,
} from "@/lib/api/pendidikan/get-pendidikan/router";

/* ============================
   INTERFACE
============================ */

interface TambahPendidikanProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
}

interface Pegawai {
  nip: string;
  nama: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

/* ============================
   MAIN COMPONENT
============================ */

const TambahPendidikan: React.FC<TambahPendidikanProps> = ({
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

  /* ============================
     LOAD DATA
  ============================ */
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
        .then((data) =>
          setListPegawai(
            data.map((p) => ({
              nip: p.nip,
              nama: p.nama,
            }))
          )
        )
        .catch(() => toast.error("Gagal memuat daftar pegawai"));

      getAllPendidikan()
        .then((data) => setListPendidikan(data))
        .catch(() => toast.error("Gagal memuat data pendidikan"));
    }
  }, [isOpen]);

  /* ============================
     HANDLE INPUT
  ============================ */
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "tahun_lulus") {
      const numeric = value.replace(/\D/g, "");
      if (numeric.length <= 4) {
        setFormData((prev) => ({ ...prev, [name]: numeric }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ============================
     DUPLICATE VALIDATION
  ============================ */
  const isDuplicate = (): boolean => {
    return listPendidikan.some((p) => {
      const nipMatch = String(p.Pegawai).trim() === formData.pegawai.trim();
      const jenjangMatch =
        String(p.Jenjang).trim().toLowerCase() ===
        formData.jenjang.trim().toLowerCase();

      return nipMatch && jenjangMatch;
    });
  };

  /* ============================
     FORM VALIDATION
  ============================ */
  const validateForm = (): boolean => {
    const { pegawai, jenjang, jurusan, institusi, tahun_lulus } = formData;

    if (!pegawai || !jenjang || !jurusan || !institusi || !tahun_lulus)
      return false;

    if (!/^\d{4}$/.test(tahun_lulus)) return false;

    return true;
  };

  /* ============================
     SUBMIT DATA
  ============================ */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Periksa kembali data yang belum lengkap atau salah!");
      return;
    }

    if (isDuplicate()) {
      toast.warning(
        `Pegawai ini sudah memiliki jenjang ${formData.jenjang.toUpperCase()}!`
      );
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
    } catch (err) {
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

  const pegawaiOptions: SelectOption[] = listPegawai.map((p) => ({
    value: p.nip,
    label: `${p.nip} - ${p.nama}`,
  }));

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      widthClass="max-w-4xl"
      title="Tambah Data Pendidikan"
    >
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4"
        autoComplete="off"
      >
        <SelectField
          name="pegawai"
          label="Pegawai"
          value={formData.pegawai}
          options={pegawaiOptions}
          onChange={handleChange}
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

export default TambahPendidikan;

/* ============================
   SELECT FIELD COMPONENT
============================ */

interface SelectFieldProps {
  name: string;
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}

const SelectField: React.FC<SelectFieldProps> = ({
  name,
  label,
  value,
  options,
  onChange,
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

        {/* Dropdown Icon */}
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </div>
    </div>
  );
};
