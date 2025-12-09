"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ModalWrapper from "./ModalWrapper";
import InputField from "./Input";
import Button from "./Button";

import { updatePendidikan } from "@/lib/api/pendidikan/put-pendidikan/router";
import { getAllPegawai } from "@/lib/api/petugas/get-petugas/router";
import {
  getAllPendidikan,
  Pendidikan as TPendidikan,
} from "@/lib/api/pendidikan/get-pendidikan/router";
 
export interface PendidikanFormData {
  id_pendidikan: string;
  pegawai: string; // NIP pegawai
  jenjang: string;
  jurusan: string;
  institusi: string;
  tahun_lulus: string;
}

interface EditPendidikanProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
  initialData: PendidikanFormData | null;
}

interface Pegawai {
  nip: string;
  nama: string;
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
  const [listPegawai, setListPegawai] = useState<Pegawai[]>([]);
  const [listPendidikan, setListPendidikan] = useState<TPendidikan[]>([]);
  const [loading, setLoading] = useState(false);

  /* ======================================================
     LOAD DATA
  ====================================================== */
  useEffect(() => {
    if (!isOpen) {
      setForm(initialForm);
      return;
    }

    getAllPegawai()
      .then((res) => setListPegawai(res))
      .catch(() => toast.error("Gagal memuat daftar pegawai"));

    getAllPendidikan()
      .then((res) => setListPendidikan(res))
      .catch(() => toast.error("Gagal memuat data pendidikan"));

    if (initialData) {
      setForm({ ...initialData });
    }
  }, [isOpen, initialData]);

  /* ======================================================
     HANDLE INPUT
  ====================================================== */
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "tahun_lulus") {
      const onlyNum = value.replace(/\D/g, "");
      if (onlyNum.length <= 4) {
        setForm((prev) => ({ ...prev, tahun_lulus: onlyNum }));
      }
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ======================================================
     CHECK DUPLIKAT — DIPINDAH KE DALAM SUBMIT !!
  ====================================================== */
  const checkDuplicate = (): boolean => {
    return listPendidikan.some((p) => {
      return (
        String(p.Pegawai) === form.pegawai &&
        String(p.Jenjang).toUpperCase() === form.jenjang.toUpperCase() &&
        String(p.ID_Pendidikan) !== form.id_pendidikan
      );
    });
  };

  /* ======================================================
     VALIDASI FORM
  ====================================================== */
  const validateForm = () => {
    if (
      !form.pegawai ||
      !form.jenjang ||
      !form.jurusan ||
      !form.institusi ||
      !form.tahun_lulus
    ) {
      return false;
    }

    return /^\d{4}$/.test(form.tahun_lulus);
  };

  /* ======================================================
     SUBMIT UPDATE
  ====================================================== */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Periksa kembali data yang belum lengkap!");
      return;
    }

    // === VALIDASI DUPLIKAT SAAT SUBMIT ===
    const adaDuplikat = checkDuplicate();
    if (adaDuplikat) {
      toast.warning(`Pegawai ini sudah memiliki jenjang ${form.jenjang}!`);
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

      toast.success(result.message || "Berhasil memperbarui pendidikan");
      await onSuccess();
      onClose();
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat update pendidikan";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  /* ======================================================
     RENDER
  ====================================================== */
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
              value={form.pegawai}
              onChange={handleChange}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              disabled={loading}
            >
              <option value="">Pilih Pegawai</option>
              {listPegawai.map((p) => (
                <option key={p.nip} value={p.nip}>
                  {p.nama}
                </option>
              ))}
            </select>
          </div>

          <InputField
            name="jenjang"
            label="Jenjang"
            value={form.jenjang}
            onChange={handleChange}
            placeholder="Contoh: S1"
          />

          <InputField
            name="jurusan"
            label="Jurusan"
            value={form.jurusan}
            onChange={handleChange}
            placeholder="Contoh: Meteorologi"
          />

          <InputField
            name="institusi"
            label="Institusi"
            value={form.institusi}
            onChange={handleChange}
            placeholder="Contoh: Universitas Indonesia"
          />

          <InputField
            name="tahun_lulus"
            label="Tahun Lulus"
            value={form.tahun_lulus}
            onChange={handleChange}
            placeholder="Contoh: 2018"
          />

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
              styleButton="bg-blue-800 text-white hover:bg-blue-700"
              disabled={loading}
            />
          </div>
        </form>
      </ModalWrapper>
    </>
  );
};

export default EditPendidikan;
