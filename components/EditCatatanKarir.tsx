"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";
import ModalWrapper from "./ModalWrapper";
import InputField from "./Input";
import Button from "./Button";
import { updateCatatanKarir } from "@/lib/api/catatan-karir/put-catatan-karir/router";

interface EditCatatanKarirProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: {
    id: string;
    nip: string;
    pangkatSekarang: string;
    potensiPangkatBaru?: string;
    tanggalLayak?: string;
    status?: string;
    catatan?: string;
  };
  onSuccess: () => void;
}

export default function EditCatatanKarir({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}: EditCatatanKarirProps) {
  const [formData, setFormData] = useState(initialData);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDropdownSelect = (status: string) => {
    setFormData((prev) => ({ ...prev, status }));
    setIsDropdownOpen(false);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        id: formData.id,
        nip: formData.nip,
        pangkatSekarang: formData.pangkatSekarang,
        potensiPangkatBaru: formData.potensiPangkatBaru,
        tanggalLayak: formData.tanggalLayak,
        status: formData.status,
        catatan: formData.catatan,
      };

      await updateCatatanKarir(payload);
      toast.success("Catatan karir berhasil diperbarui!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memperbarui data"
      );
    }
  };

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Edit Catatan Karir">
      <div className="flex flex-col gap-3 text-gray-800">
        <InputField
          label="NIP"
          name="nip"
          value={formData.nip}
          onChange={handleChange}
          readOnly
        />
        <InputField
          label="Pangkat Sekarang"
          name="pangkatSekarang"
          value={formData.pangkatSekarang}
          onChange={handleChange}
        />
        <InputField
          label="Potensi Pangkat Baru"
          name="potensiPangkatBaru"
          value={formData.potensiPangkatBaru || ""}
          onChange={handleChange}
        />
        <InputField
          label="Tanggal Layak"
          name="tanggalLayak"
          type="date"
          value={formData.tanggalLayak || ""}
          onChange={handleChange}
        />

        {/* Dropdown Status */}
        <div className="flex flex-col gap-1 relative">
          <label className="text-sm text-gray-600">Status</label>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex justify-between items-center border border-gray-300 rounded-lg px-3 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          >
            {formData.status || "Pilih status"}
            <motion.span
              animate={{ rotate: isDropdownOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <Icon icon="mdi:chevron-down" width={22} height={22} />
            </motion.span>
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.ul
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 shadow-lg"
              >
                {["Layak", "Belum Layak", "Ditinjau"].map((status) => (
                  <li
                    key={status}
                    onClick={() => handleDropdownSelect(status)}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-gray-700"
                  >
                    {status}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">Catatan</label>
          <textarea
            name="catatan"
            value={formData.catatan || ""}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            label="Batal"
            onClick={onClose}
            styleButton="bg-gray-300 text-gray-700 hover:bg-gray-400"
          />
          <Button
            label="Simpan"
            onClick={handleSubmit}
            styleButton="bg-gray-500 text-white hover:bg-gray-600"
          />
        </div>
      </div>
    </ModalWrapper>
  );
}
