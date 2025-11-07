"use client";

import React from "react";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const StrukturDiagram: React.FC = () => {
  const cardClass =
    "bg-blue-800 text-white font-medium rounded-lg shadow-md flex items-center justify-center text-center";

  // Fungsi untuk membuat card anggota
  const renderBoxes = (count: number, label: string) => (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${cardClass} h-12 w-36 text-sm`}>
          {label} {i + 1}
        </div>
      ))}
    </>
  );

  return (
    <div
      className={`flex flex-col items-center justify-start py-10 px-6 ${poppins.className}`}
    >
      {/* Judul */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-blue-800">
          Struktur Organisasi
        </h1>
        <h2 className="text-2xl font-semibold text-blue-800 mt-1">
          Stasiun Klimatologi BMKG Bengkulu
        </h2>
      </div>

      {/* Kepala Stasiun */}
      <div className="relative flex flex-col items-center mb-16">
        <div className={`${cardClass} px-8 py-4 text-lg font-semibold`}>
          Kepala Stasiun
        </div>

        {/* Garis vertikal utama */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-1 h-16 bg-blue-800" />
      </div>

      {/* Garis horizontal penghubung semua koordinator */}
      <div className="relative flex flex-wrap justify-center gap-16 mt-4">
        {/* Garis horizontal utama */}
        <div className="absolute -top-8 left-0 w-full h-1 bg-blue-800" />

        {/* Koordinator Data & Informasi */}
        <div className="flex flex-col items-center relative">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-1 h-8 bg-blue-800" />
          <div
            className={`${cardClass} px-6 py-3 font-semibold mb-4 text-sm w-56`}
          >
            Koordinator Data & Informasi
          </div>
          <div className="w-1 h-6 bg-blue-800" />
          <div className="grid grid-cols-2 gap-3 mt-2">
            {renderBoxes(8, "Data")}
          </div>
        </div>

        {/* Koordinator Observasi */}
        <div className="flex flex-col items-center relative">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-1 h-8 bg-blue-800" />
          <div
            className={`${cardClass} px-6 py-3 font-semibold mb-4 text-sm w-56`}
          >
            Koordinator Observasi
          </div>
          <div className="w-1 h-6 bg-blue-800" />
          <div className="grid grid-cols-1 gap-3 mt-2">
            {renderBoxes(4, "OBS")}
          </div>
        </div>

        {/* Koordinator Teknis */}
        <div className="flex flex-col items-center relative">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-1 h-8 bg-blue-800" />
          <div
            className={`${cardClass} px-6 py-3 font-semibold mb-4 text-sm w-56`}
          >
            Koordinator Teknis
          </div>
          <div className="w-1 h-6 bg-blue-800" />
          <div className="grid grid-cols-1 gap-3 mt-2">
            {renderBoxes(4, "Teknisi")}
          </div>
        </div>

        {/* Kepala Subbag Tata Usaha */}
        <div className="flex flex-col items-center relative">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-1 h-8 bg-blue-800" />
          <div
            className={`${cardClass} px-6 py-3 font-semibold mb-4 text-sm w-56`}
          >
            Kepala Subbag Tata Usaha
          </div>
          <div className="w-1 h-6 bg-blue-800" />
          <div className="grid grid-cols-1 gap-3 mt-2">
            {renderBoxes(6, "TU")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrukturDiagram;
