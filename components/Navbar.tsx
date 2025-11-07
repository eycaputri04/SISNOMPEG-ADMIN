"use client";

import React from "react";
import { FaPlus } from "react-icons/fa";
import { MdOutlineSearch } from "react-icons/md";

interface NavbarProps {
  title: string;
  titleClassName?: string;
  onAddClick?: () => void; // callback tombol Tambah
  searchTerm?: string; // value input search
  onSearchChange?: (value: string) => void; // callback saat search berubah
}

const Navbar = ({
  title,
  titleClassName,
  onAddClick,
  searchTerm = "",
  onSearchChange,
}: NavbarProps) => {
  return (
    <div className="w-full mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      {/* Judul */}
      <h1 className={`text-3xl font-bold ${titleClassName || ""}`}>{title}</h1>

      {/* Container tombol + search */}
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-start sm:items-center">
        {/* Tombol Tambah */}
        {onAddClick && (
          <button
            onClick={onAddClick}
            className="bg-blue-800 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-900 text-sm flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <FaPlus /> Tambah
          </button>
        )}

        {/* Input Search */}
        {onSearchChange && (
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Cari nama pegawai"
              className="w-full border border-blue-800 rounded-full px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-800 text-sm"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <MdOutlineSearch className="absolute top-2.5 left-3 text-blue-800 text-lg" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
