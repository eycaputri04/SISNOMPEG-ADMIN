"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ModalWrapper from "./ModalWrapper";
import InputField from "./Input";
import Button from "./Button";
import {
  updatePenjenjangan,
  UpdatePenjenjanganPayload,
} from "@/lib/api/penjenjangan/put-penjenjangan/router";
import { getAllPegawai } from "@/lib/api/petugas/get-petugas/router";

export interface Penjenjangan {
  id: string;
  nip: string;
  nama_pegawai: string;
  nama_penjenjangan: string;
  tahun_pelaksanaan: string;
  penyelenggara: string;
}

interface EditPenjenjanganProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
  initialData: Penjenjangan | null;
}

export const EditPenjenjangan: React.FC<EditPenjenjanganProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const [form, setForm] = useState<Penjenjangan>({
    id: "",
    nip: "",
    nama_pegawai: "",
    nama_penjenjangan: "",
    tahun_pelaksanaan: "",
    penyelenggara: "",
  });
  const [pegawaiList, setPegawaiList] = useState<{ nip: string; nama: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // Isi form dan daftar pegawai saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      getAllPegawai()
        .then(setPegawaiList)
        .catch(() => toast.error("Gagal memuat daftar pegawai"));

      if (initialData) {
        setForm({ ...initialData });
      }
    }
  }, [isOpen, initialData]);

  // Handle perubahan input
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "tahun_pelaksanaan") {
      const numeric = value.replace(/\D/g, "");
      if (numeric.length <= 4) {
        setForm((prev) => ({ ...prev, [name]: numeric }));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle submit form
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const { id, nip, nama_penjenjangan, tahun_pelaksanaan, penyelenggara } = form;

    if (!nip || !nama_penjenjangan || !tahun_pelaksanaan || !penyelenggara) {
      toast.error("Semua field wajib diisi");
      return;
    }

    setLoading(true);
    try {
      const payload: UpdatePenjenjanganPayload & { id_penjenjangan: string } = {
        id_penjenjangan: id,
        pegawai: nip,
        nama_penjenjangan,
        tahun_pelaksanaan: Number(tahun_pelaksanaan),
        penyelenggara,
      };

      await updatePenjenjangan(payload);
      await onSuccess();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || "Gagal memperbarui data penjenjangan");
      } else {
        toast.error("Gagal memperbarui data penjenjangan");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!initialData) return null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      widthClass="max-w-4xl"
      title="Edit Data Penjenjangan"
    >
      <form onSubmit={handleSubmit} className="space-y-2" autoComplete="off">
        {/* Pilih Pegawai */}
        <div className="flex flex-col gap-1">
          <label htmlFor="nip" className="text-sm font-medium text-gray-700">
            Pegawai
          </label>
          <select
            name="nip"
            value={form.nip}
            onChange={handleChange}
            className="border rounded-md px-3 py-2 text-sm"
            required
          >
            <option value="">Pilih Pegawai</option>
            {pegawaiList.map((p) => (
              <option key={p.nip} value={p.nip}>
                {p.nama}
              </option>
            ))}
          </select>
        </div>

        <InputField
          name="nama_penjenjangan"
          label="Nama Penjenjangan"
          value={form.nama_penjenjangan}
          onChange={handleChange}
          placeholder="Masukkan nama penjenjangan"
        />
        <InputField
          name="tahun_pelaksanaan"
          label="Tahun Pelaksanaan"
          value={form.tahun_pelaksanaan}
          onChange={handleChange}
          placeholder="Contoh: 2024"
        />
        <InputField
          name="penyelenggara"
          label="Penyelenggara"
          value={form.penyelenggara}
          onChange={handleChange}
          placeholder="Masukkan penyelenggara"
        />

        {/* Tombol aksi */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            label="BATAL"
            onClick={onClose}
            type="button"
            styleButton="bg-gray-500 text-white hover:bg-gray-600"
            disabled={loading}
          />
          <Button
            label={loading ? "Menyimpan..." : "SIMPAN PERUBAHAN"}
            type="submit"
            disabled={loading}
            styleButton="bg-blue-800 hover:bg-blue-700 text-white"
          />
        </div>
      </form>
    </ModalWrapper>
  );
};

export default EditPenjenjangan;
