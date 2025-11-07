"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ModalWrapper from "./ModalWrapper";
import InputField from "./Input";
import Button from "./Button";
import { updatePendidikan } from "@/lib/api/pendidikan/put-pendidikan/router";
import { getAllPegawai } from "@/lib/api/petugas/get-petugas/router";

export interface PendidikanFormData {
  id_pendidikan: string;
  pegawai: string; // NIP pegawai
  jenjang: string;
  jurusan: string;
  institusi: string;
  tahun_lulus: string;
  nama_lengkap?: string;
}

interface EditPendidikanProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
  initialData: PendidikanFormData | null;
}

const initialForm: PendidikanFormData = {
  id_pendidikan: "",
  pegawai: "",
  jenjang: "",
  jurusan: "",
  institusi: "",
  tahun_lulus: "",
};

const EditPendidikan: React.FC<EditPendidikanProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const [form, setForm] = useState<PendidikanFormData>(initialForm);
  const [listPegawai, setListPegawai] = useState<{ nip: string; nama: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // Saat modal dibuka: isi form & ambil daftar pegawai
  useEffect(() => {
    if (isOpen) {
      getAllPegawai()
        .then((res) => setListPegawai(res || []))
        .catch(() => toast.error("Gagal memuat daftar pegawai"));

      if (initialData) {
        setForm({
          id_pendidikan: initialData.id_pendidikan || "",
          pegawai: initialData.pegawai || initialData.id_pendidikan || "",
          jenjang: initialData.jenjang || "",
          jurusan: initialData.jurusan || "",
          institusi: initialData.institusi || "",
          tahun_lulus: initialData.tahun_lulus || "",
        });
      }
    } else {
      setForm(initialForm);
    }
  }, [isOpen, initialData]);

  // 🔹 Handle perubahan input
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Batasi tahun_lulus hanya angka 4 digit
    if (name === "tahun_lulus") {
      const numeric = value.replace(/\D/g, "");
      if (numeric.length <= 4) {
        setForm((prev) => ({ ...prev, [name]: numeric }));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Validasi form
  const validateForm = () => {
    const { pegawai, jenjang, jurusan, institusi, tahun_lulus } = form;
    if (!pegawai || !jenjang || !jurusan || !institusi || !tahun_lulus) return false;
    if (!/^\d{4}$/.test(tahun_lulus)) return false;
    return true;
  };

  // Submit update ke API
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Periksa kembali data yang belum lengkap atau salah!");
      return;
    }

    setLoading(true);
    try {
      const result = await updatePendidikan({
        id_pendidikan: form.id_pendidikan,
        pegawai: form.pegawai,
        jenjang: form.jenjang,
        jurusan: form.jurusan,
        institusi: form.institusi,
        tahun_lulus: Number(form.tahun_lulus),
      });

      toast.success(result.message || "Data pendidikan berhasil diperbarui");
      await onSuccess();
      onClose();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memperbarui data pendidikan";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <ToastContainer />
      <ModalWrapper
          isOpen={isOpen}
          onClose={onClose}
          widthClass="max-w-4xl"
          title="Edit Data Pendidikan"
        >
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4"
          autoComplete="off"
        >
          {/* Dropdown Pegawai */}
          <div className="flex flex-col gap-1">
            <label htmlFor="pegawai" className="text-sm font-medium text-gray-700">
              Pegawai
            </label>
            <select
              name="pegawai"
              value={form.pegawai || ""}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              disabled={loading}
              required
            >
              <option value="">Pilih Pegawai</option>
              {listPegawai.map((p) => (
                <option key={p.nip} value={p.nip}>
                  {p.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Input Field Lainnya */}
          <InputField
            name="jenjang"
            label="Jenjang"
            value={form.jenjang || ""}
            onChange={handleChange}
            placeholder="Contoh: S2"
            disabled={loading}
          />
          <InputField
            name="jurusan"
            label="Jurusan"
            value={form.jurusan || ""}
            onChange={handleChange}
            placeholder="Contoh: Geofisika"
            disabled={loading}
          />
          <InputField
            name="institusi"
            label="Institusi"
            value={form.institusi || ""}
            onChange={handleChange}
            placeholder="Contoh: Universitas Gadjah Mada"
            disabled={loading}
          />
          <InputField
            name="tahun_lulus"
            label="Tahun Lulus"
            value={form.tahun_lulus || ""}
            onChange={handleChange}
            placeholder="Contoh: 2010"
            disabled={loading}
          />

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-2 mt-4">
            <Button
              label="BATAL"
              onClick={onClose}
              type="button"
              styleButton="bg-gray-600 text-white hover:bg-gray-700"
              disabled={loading}
            />
            <Button
              label={loading ? "Menyimpan..." : "SIMPAN PERUBAHAN"}
              type="submit"
              disabled={loading}
              styleButton="bg-blue-800 text-white hover:bg-blue-700"
            />
          </div>
        </form>
      </ModalWrapper>
    </>
  );
};

export default EditPendidikan;
