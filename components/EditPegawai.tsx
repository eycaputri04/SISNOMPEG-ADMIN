"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { toast } from "react-toastify";
import InputField from "./Input";
import Button from "./Button";
import ModalWrapper from "./ModalWrapper";
import { updatePegawai } from "@/lib/api/petugas/put-petugas/router";
import type { UpdatePegawaiPayload } from "@/lib/api/petugas/put-petugas/router";

interface FormData {
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

interface EditPegawaiProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
  initialData: FormData | null;
}

const pangkatOptions = [
  "Ia", "Ib", "Ic", "Id",
  "IIa", "IIb", "IIc", "IId",
  "IIIa", "IIIb", "IIIc", "IIId",
  "IVa", "IVb", "IVc", "IVd", "IVe",
];
const jenisKelaminOptions = ["Laki-laki", "Perempuan"];
const agamaOptions = ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"];
const statusKepegawaianOptions = ["PNS", "PPPK", "Honorer"];

const initialForm: FormData = {
  nip: "",
  nama: "",
  tempat_tanggal_lahir: "",
  pendidikan_terakhir: "",
  pangkat_golongan: "",
  kgb_berikutnya: "",
  tmt: "",
  jenis_kelamin: "",
  agama: "",
  status_kepegawaian: "",
  gaji_pokok: 0,
  jumlah_anak: 0,
};

export const EditPegawai: React.FC<EditPegawaiProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const [form, setForm] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isOpen && initialData) {
      setForm({ ...initialForm, ...initialData });
      setIsEditing(false);
    } else if (!isOpen) {
      setForm(initialForm);
    }
  }, [isOpen, initialData]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name.includes("gaji") || name.includes("anak") ? Number(value) : value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload: UpdatePegawaiPayload = { ...form };
      await updatePegawai(form.nip, payload);

      toast.success("Data pegawai berhasil diperbarui", {
        toastId: "update-pegawai-success",
      });

      setIsEditing(false);
      await onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat memperbarui data"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    if (initialData) setForm(initialData);
    setIsEditing(false);
  };

  // helper untuk menampilkan teks atau input tergantung mode
  const renderField = (label: string, name: keyof FormData, type = "text") => {
    if (!isEditing) {
      return (
        <div>
          <label className="text-sm font-medium text-gray-700">{label}</label>
          <p className="mt-1 text-gray-800 border border-gray-200 rounded-md px-3 py-2 bg-gray-50">
            {form[name] ? form[name].toString() : "-"}
          </p>
        </div>
      );
    }
    return (
      <InputField
        label={label}
        name={name}
        type={type}
        value={form[name]?.toString() || ""}
        onChange={handleChange}
        disabled={loading}
      />
    );
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} widthClass="max-w-4xl" title="Data Pegawai">
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(e) => e.preventDefault()}>
        {/* NIP */}
        <div>
          <label className="text-sm font-medium text-gray-700">NIP</label>
          <p className="mt-1 text-gray-800 border border-gray-200 rounded-md px-3 py-2 bg-gray-50">
            {form.nip || "-"}
          </p>
        </div>

        {renderField("Nama", "nama")}
        {renderField("Tempat & Tanggal Lahir", "tempat_tanggal_lahir")}
        {renderField("Pendidikan Terakhir", "pendidikan_terakhir")}

        {/* Pangkat/Golongan */}
        <div>
          <label className="text-sm font-medium text-gray-700">Pangkat/Golongan</label>
          {!isEditing ? (
            <p className="mt-1 text-gray-800 border border-gray-200 rounded-md px-3 py-2 bg-gray-50">
              {form.pangkat_golongan || "-"}
            </p>
          ) : (
            <select
              name="pangkat_golongan"
              value={form.pangkat_golongan}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              disabled={loading}
            >
              <option value="">-- Pilih Pangkat/Golongan --</option>
              {pangkatOptions.map((gol) => (
                <option key={gol} value={gol}>{gol}</option>
              ))}
            </select>
          )}
        </div>

        {renderField("TMT", "tmt", "date")}
        {renderField("KGB Berikutnya", "kgb_berikutnya", "date")}

        {/* Jenis Kelamin */}
        <div>
          <label className="text-sm font-medium text-gray-700">Jenis Kelamin</label>
          {!isEditing ? (
            <p className="mt-1 text-gray-800 border border-gray-200 rounded-md px-3 py-2 bg-gray-50">
              {form.jenis_kelamin || "-"}
            </p>
          ) : (
            <select
              name="jenis_kelamin"
              value={form.jenis_kelamin}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">-- Pilih Jenis Kelamin --</option>
              {jenisKelaminOptions.map((jk) => (
                <option key={jk} value={jk}>{jk}</option>
              ))}
            </select>
          )}
        </div>

        {/* Agama */}
        <div>
          <label className="text-sm font-medium text-gray-700">Agama</label>
          {!isEditing ? (
            <p className="mt-1 text-gray-800 border border-gray-200 rounded-md px-3 py-2 bg-gray-50">
              {form.agama || "-"}
            </p>
          ) : (
            <select
              name="agama"
              value={form.agama}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">-- Pilih Agama --</option>
              {agamaOptions.map((agm) => (
                <option key={agm} value={agm}>{agm}</option>
              ))}
            </select>
          )}
        </div>

        {/* Status Kepegawaian */}
        <div>
          <label className="text-sm font-medium text-gray-700">Status Kepegawaian</label>
          {!isEditing ? (
            <p className="mt-1 text-gray-800 border border-gray-200 rounded-md px-3 py-2 bg-gray-50">
              {form.status_kepegawaian || "-"}
            </p>
          ) : (
            <select
              name="status_kepegawaian"
              value={form.status_kepegawaian}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">-- Pilih Status --</option>
              {statusKepegawaianOptions.map((sts) => (
                <option key={sts} value={sts}>{sts}</option>
              ))}
            </select>
          )}
        </div>

        {renderField("Gaji Pokok", "gaji_pokok", "number")}
        {renderField("Jumlah Anak", "jumlah_anak", "number")}

        {/* Tombol Aksi */}
        <div className="col-span-2 flex justify-end gap-2 pt-4">
          {!isEditing ? (
            <>
              <Button
                label="TUTUP"
                onClick={onClose}
                type="button"
                styleButton="bg-gray-500 text-white hover:bg-gray-600"
              />
              <Button
                label="EDIT DATA"
                onClick={() => setIsEditing(true)}
                type="button"
                styleButton="bg-blue-800 text-white hover:bg-blue-700"
              />
            </>
          ) : (
            <>
              <Button
                label="BATAL EDIT"
                onClick={handleCancelEdit}
                type="button"
                styleButton="bg-gray-500 text-white hover:bg-gray-600"
              />
              <Button
                label={loading ? "Menyimpan..." : "SIMPAN PERUBAHAN"}
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                styleButton="bg-blue-800 hover:bg-blue-700 text-white"
              />
            </>
          )}
        </div>
      </form>
    </ModalWrapper>
  );
};
