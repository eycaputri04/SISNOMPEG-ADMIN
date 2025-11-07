"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import InputField from "./Input";
import Button from "./Button";
import ModalWrapper from "./ModalWrapper";
import {
  tambahPegawai as tambahPegawaiAPI,
  tambahPegawai as PegawaiPayload,
} from "@/lib/api/petugas/post-petugas/router";

interface TambahPegawaiProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

interface FormData {
  nip: string;
  nama_lengkap: string;
  tempat_tanggal_lahir: string;
  pendidikan_terakhir: string;
  pangkat_golongan: string;
  kgb_berikutnya: string;
  tmt: string;
  jenis_kelamin: string;
  agama: string;
  status_kepegawaian: string;
  gaji_pokok: string;
  jumlah_anak: string;
}

const initialForm: FormData = {
  nip: "",
  nama_lengkap: "",
  tempat_tanggal_lahir: "",
  pendidikan_terakhir: "",
  pangkat_golongan: "",
  kgb_berikutnya: "",
  tmt: "",
  jenis_kelamin: "",
  agama: "",
  status_kepegawaian: "",
  gaji_pokok: "",
  jumlah_anak: "",
};

const pangkatOptions = [
  "Ia","Ib","Ic","Id","IIa","IIb","IIc","IId",
  "IIIa","IIIb","IIIc","IIId","IVa","IVb","IVc","IVd","IVe"
];
const jenisKelaminOptions = ["Laki-laki", "Perempuan"];
const agamaOptions = ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"];
const statusOptions = ["PNS", "Honorer", "Kontrak"];

export const TambahPegawai: React.FC<TambahPegawaiProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [form, setForm] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setForm(initialForm);
      setErrors({});
    }
  }, [isOpen]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const numberFields = ["nip", "gaji_pokok", "jumlah_anak"];

    if (numberFields.includes(name)) {
      if (!/^\d*$/.test(value)) return;
      if (name === "nip" && value.length > 18) return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    Object.entries(form).forEach(([key, value]) => {
      if (!value) newErrors[key] = "Kolom ini wajib diisi";
    });

    if (form.nip && form.nip.length !== 18)
      newErrors.nip = "NIP harus 18 digit";

    ["kgb_berikutnya", "tmt"].forEach((field) => {
      if (
        form[field as keyof FormData] &&
        isNaN(Date.parse(form[field as keyof FormData]))
      ) {
        newErrors[field] = "Format tanggal tidak valid";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Periksa kembali data yang belum lengkap atau salah!");
      return;
    }

    setLoading(true);
    try {
      const payload: PegawaiPayload = {
        NIP: form.nip,
        Nama: form.nama_lengkap,
        Tempat_Tanggal_Lahir: form.tempat_tanggal_lahir,
        Pendidikan_Terakhir: form.pendidikan_terakhir,
        Pangkat_Golongan: form.pangkat_golongan,
        KGB_Berikutnya: form.kgb_berikutnya,
        TMT: form.tmt,
        Jenis_Kelamin: form.jenis_kelamin,
        Agama: form.agama,
        Status_Kepegawaian: form.status_kepegawaian,
        Gaji_Pokok: form.gaji_pokok ? parseInt(form.gaji_pokok) : 0,
        Jumlah_Anak: form.jumlah_anak ? parseInt(form.jumlah_anak) : 0,
      };

      await tambahPegawaiAPI(payload);
      toast.success("Pegawai berhasil ditambahkan");
      await onSuccess();
      setForm(initialForm);
      onClose();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menambahkan data";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} widthClass="max-w-4xl">
      <h2 className="text-lg text-black font-semibold mb-4">Tambah Pegawai</h2>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4" autoComplete="off">
        {/* Input Text */}
        {[
          { name: "nip", label: "NIP" },
          { name: "nama_lengkap", label: "Nama Lengkap" },
          { name: "tempat_tanggal_lahir", label: "Tempat & Tanggal Lahir" },
          { name: "pendidikan_terakhir", label: "Pendidikan Terakhir" },
        ].map(({ name, label }) => (
          <div key={name}>
            <InputField
              name={name}
              label={label}
              value={form[name as keyof FormData]}
              onChange={handleChange}
            />
            {errors[name] && (
              <p className="text-red-500 text-sm">{errors[name]}</p>
            )}
          </div>
        ))}

        {/* Dropdowns */}
        {[
          { name: "pangkat_golongan", label: "Pangkat/Golongan", options: pangkatOptions },
          { name: "jenis_kelamin", label: "Jenis Kelamin", options: jenisKelaminOptions },
          { name: "agama", label: "Agama", options: agamaOptions },
          { name: "status_kepegawaian", label: "Status Kepegawaian", options: statusOptions },
        ].map(({ name, label, options }) => (
          <SelectField
            key={name}
            name={name}
            label={label}
            value={form[name as keyof FormData]}
            options={options}
            onChange={handleChange}
            error={errors[name]}
          />
        ))}

        {/* Angka & Tanggal */}
        {[
          { name: "kgb_berikutnya", label: "KGB Berikutnya", type: "date" },
          { name: "tmt", label: "TMT", type: "date" },
          { name: "gaji_pokok", label: "Gaji Pokok", type: "number" },
          { name: "jumlah_anak", label: "Jumlah Anak", type: "number" },
        ].map(({ name, label, type }) => (
          <div key={name}>
            <InputField
              name={name}
              label={label}
              type={type}
              value={form[name as keyof FormData]}
              onChange={handleChange}
            />
            {errors[name] && (
              <p className="text-red-500 text-sm">{errors[name]}</p>
            )}
          </div>
        ))}

        {/* Tombol Aksi */}
        <div className="col-span-2 flex justify-end gap-2 mt-4">
          <Button
            label="BATAL"
            onClick={onClose}
            type="button"
            styleButton="bg-gray-500 text-white"
          />
          <Button
            label={loading ? "Menyimpan..." : "SIMPAN"}
            onClick={handleSubmit}
            disabled={loading}
            styleButton="bg-blue-800 text-white"
          />
        </div>
      </form>
    </ModalWrapper>
  );
};

/* ==============================
   Komponen SelectField Baru
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

        {/* Icon Dropdown */}
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
