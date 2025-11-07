"use client";

import React, { useEffect, useRef, useState } from "react";
import { Poppins } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import { getAllStruktur } from "@/lib/api/struktur/get-struktur/router";
import { getAllPegawai } from "@/lib/api/petugas/get-petugas/router";
import html2canvas from "html2canvas";
import { FaDownload } from "react-icons/fa";
import { motion } from "framer-motion";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

interface StrukturData {
  jabatan: string;
  pegawai: string;
  tmt: string;
}

interface StrukturAPI {
  id?: number;
  pegawai?: string | number;
  jabatan_nama?: string;
  jabatan?: string;
  tmt?: string;
}

interface PegawaiAPI {
  id?: number;
  nip?: string | number;
  nama?: string;
}

const StrukturDiagram: React.FC = () => {
  const [data, setData] = useState<StrukturData[]>([]);
  const [loading, setLoading] = useState(true);
  const diagramRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const [strukturList, pegawaiList] = await Promise.all([
          getAllStruktur(),
          getAllPegawai(),
        ]);

        if (!Array.isArray(strukturList) || !Array.isArray(pegawaiList)) {
          setData([]);
          return;
        }

        const merged: StrukturData[] = strukturList.map((s: StrukturAPI) => {
          const foundPegawai: PegawaiAPI | undefined = pegawaiList.find(
            (p: PegawaiAPI) =>
              p.id === s.pegawai ||
              p.nip === s.pegawai ||
              p.nama?.toLowerCase() === s.pegawai?.toString().toLowerCase()
          );

          return {
            jabatan: s.jabatan_nama || s.jabatan || "-",
            pegawai: foundPegawai?.nama || s.pegawai?.toString() || "-",
            tmt: s.tmt || "-",
          };
        });

        setData(merged);
      } catch (err) {
        console.error("Error saat mengambil data struktur:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getPetugas = (jabatan: string): StrukturData => {
    const found = data.find(
      (d) => d.jabatan?.toLowerCase() === jabatan.toLowerCase()
    );
    return found || { pegawai: "-", jabatan: "-", tmt: "-" };
  };

  const getByParent = (keyword: string): StrukturData[] => {
    return data.filter(
      (d) =>
        d.jabatan?.toLowerCase().includes(keyword.toLowerCase()) &&
        !d.jabatan?.toLowerCase().includes("koordinator") &&
        !d.jabatan?.toLowerCase().includes("kepala") &&
        d.jabatan?.toLowerCase() !== keyword.toLowerCase()
    );
  };

  const renderBoxes = (items: StrukturData[]) =>
    items.map((item, i) => (
      <div
        key={i}
        style={{
          backgroundColor: "rgb(30, 64, 175)",
          color: "white",
        }}
        className="font-medium rounded-lg shadow-md flex flex-col items-center justify-center text-center px-2 py-2 w-40 min-h-16 text-[10px]"
      >
        <div className="font-semibold text-[11px]">{item.pegawai || "-"}</div>
        <div className="italic">{item.jabatan || "-"}</div>
        <div className="text-[9px]">TMT: {item.tmt || "-"}</div>
      </div>
    ));

  const handleDownload = async (): Promise<void> => {
    if (!diagramRef.current) return;
    const element = diagramRef.current;

    try {
      if ("fonts" in document) {
        const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
        if (fonts && fonts.ready) {
          await fonts.ready;
        }
      }
      const rootElement = document.querySelector("div.min-h-screen");
      const computedStyle = rootElement
        ? window.getComputedStyle(rootElement)
        : null;
      const backgroundStyle =
        computedStyle?.background ||
        "linear-gradient(180deg, #ffffff 0%, #eaf3ff 40%, #d9e9f7 100%)";

      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "visible";

      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.position = "absolute";
      clone.style.left = "0";
      clone.style.top = "0";
      clone.style.width = `${element.scrollWidth + 200}px`;
      clone.style.height = `${element.scrollHeight + 100}px`;
      clone.style.background = backgroundStyle;
      clone.style.padding = "40px";
      clone.style.zIndex = "9999";
      clone.style.overflow = "visible";

      document.body.appendChild(clone);

      const fullWidth = clone.scrollWidth;
      const fullHeight = clone.scrollHeight;

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        width: fullWidth,
        height: fullHeight,
        scrollX: 0,
        scrollY: 0,
        backgroundColor: null,
      });

      document.body.removeChild(clone);
      document.body.style.overflow = prevOverflow;

      const link = document.createElement("a");
      link.download = "struktur_organisasi_bmkg.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Gagal membuat capture:", err);
    }
  };

  if (loading) {
    return (
      <div
        className={`flex justify-center items-center min-h-screen text-lg ${poppins.className}`}
        style={{ color: "rgb(30, 64, 175)" }}
      >
        Memuat data struktur organisasi...
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-auto"
      style={{
        background:
          "linear-gradient(180deg, #ffffff 0%, #eaf3ff 40%, #d9e9f7 100%)",
      }}
    >
      <Sidebar active="Diagram" />
      <main className="flex-1 flex ml-40 flex-col items-center py-10 px-5 bg-transparent relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center w-full max-w-6xl mb-6">
          <div className="text-center flex-1 mt-4 mb-8 pl-6">
            <h1
              className="text-3xl font-bold"
              style={{ color: "rgb(30, 64, 175)" }}
            >
              Struktur Organisasi
            </h1>
            <h2
              className="text-2xl font-semibold mt-2"
              style={{ color: "rgb(30, 64, 175)" }}
            >
              Stasiun Klimatologi BMKG Bengkulu
            </h2>
          </div>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{
              scale: 0.95,
              transition: { type: "spring", stiffness: 200 },
            }}
            onClick={handleDownload}
            className="flex items-center gap-2 font-semibold px-4 py-2 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
            style={{
              backgroundColor: "rgb(30, 64, 175)",
              color: "white",
            }}
          >
            <FaDownload className="text-lg" />
            Unduh Gambar
          </motion.button>
        </div>

        {/* Diagram utama */}
        <div ref={diagramRef} className="flex flex-col items-center">
          {/* Kepala Stasiun */}
          <div className="relative flex flex-col items-center mb-6">
            <div
              style={{
                backgroundColor: "rgb(30, 64, 175)",
                color: "white",
              }}
              className="font-semibold rounded-lg shadow-md flex flex-col items-center justify-center text-center px-6 py-3 w-60"
            >
              <div>Kepala Stasiun</div>
              <div>{getPetugas("Kepala Stasiun").pegawai}</div>
              <div>TMT: {getPetugas("Kepala Stasiun").tmt}</div>
            </div>

            {/* Garis animatif vertikal */}
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{
                backgroundColor: "rgb(30, 64, 175)",
                transformOrigin: "top",
              }}
              className="absolute top-full left-1/2 -translate-x-1/2 w-1 h-40"
            />
          </div>

          {/* Cabang utama */}
          <div className="relative w-[1200px] h-44">
            {/* Garis horizontal utama */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              style={{
                backgroundColor: "rgb(30, 64, 175)",
                transformOrigin: "left",
              }}
              className="absolute top-33 left-104 -translate-x-1/2 w-[480px] h-1"
            />

            {/* Sub Bagian Koordinator Data dan Informasi */}
            <div className="absolute top-33 left-[1%] flex justify-start items-start">
              <div className="flex flex-col items-center ml-0">
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 1, delay: 0.4 }}
                  style={{
                    backgroundColor: "rgb(30, 64, 175)",
                    transformOrigin: "top",
                  }}
                  className="w-1 h-10"
                />
                <div
                  className="font-semibold rounded-lg shadow-md flex flex-col items-center justify-center text-center px-4 py-3 w-56"
                  style={{
                    backgroundColor: "rgb(30, 64, 175)",
                    color: "white",
                  }}
                >
                  <div>Sub Bagian Koordinator Data dan Informasi</div>
                  <div className="text-xs mt-1">
                    {getPetugas(
                      "Sub Bagian Koordinator Data dan Informasi"
                    ).pegawai}
                  </div>
                  <div className="text-xs">
                    TMT:{" "}
                    {
                      getPetugas(
                        "Sub Bagian Koordinator Data dan Informasi"
                      ).tmt
                    }
                  </div>
                </div>
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 1, delay: 0.6 }}
                  style={{
                    backgroundColor: "rgb(30, 64, 175)",
                    transformOrigin: "top",
                  }}
                  className="w-1 h-10"
                />
                <div className="grid grid-cols-2 gap-3">
                  {renderBoxes(getByParent("Data dan Informasi"))}
                </div>
              </div>

              {/* Sub Bagian Koordinator Observasi */}
              <div className="flex flex-col items-center ml-18">
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 1, delay: 0.4 }}
                  style={{
                    backgroundColor: "rgb(30, 64, 175)",
                    transformOrigin: "top",
                  }}
                  className="w-1 h-10"
                />
                <div
                  className="font-semibold rounded-lg shadow-md flex flex-col items-center justify-center text-center px-4 py-3 w-56"
                  style={{
                    backgroundColor: "rgb(30, 64, 175)",
                    color: "white",
                  }}
                >
                  <div>Sub Bagian Koordinator Observasi</div>
                  <div className="text-xs mt-1">
                    {getPetugas("Sub Bagian Koordinator Observasi").pegawai}
                  </div>
                  <div className="text-xs">
                    TMT: {getPetugas("Sub Bagian Koordinator Observasi").tmt}
                  </div>
                </div>
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  style={{
                    backgroundColor: "rgb(30, 64, 175)",
                    transformOrigin: "top",
                  }}
                  className="w-1 h-20"
                />

                {/* Tim Teknis & Tim OBS */}
                <div className="relative flex justify-center mt-0 w-full">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    style={{
                      backgroundColor: "rgb(30, 64, 175)",
                      transformOrigin: "left",
                    }}
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1"
                  />
                  {/* Tim Teknis */}
                  <div className="flex flex-col items-center mr-4">
                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 1, delay: 0.6 }}
                      style={{
                        backgroundColor: "rgb(30, 64, 175)",
                        transformOrigin: "top",
                      }}
                      className="w-1 h-6"
                    />
                    <div
                      className="font-semibold rounded-lg shadow-md flex flex-col items-center justify-center text-center px-6 py-3 w-56"
                      style={{
                        backgroundColor: "rgb(30, 64, 175)",
                        color: "white",
                      }}
                    >
                      <div>Tim Teknis</div>
                    </div>
                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 1, delay: 0.8 }}
                      style={{
                        backgroundColor: "rgb(30, 64, 175)",
                        transformOrigin: "top",
                      }}
                      className="w-1 h-6"
                    />
                    <div className="grid grid-cols-1 gap-3 mt-2">
                      {renderBoxes(getByParent("Teknis"))}
                    </div>
                  </div>

                  {/* Tim OBS */}
                  <div className="flex flex-col items-center ml-4">
                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 1, delay: 0.6 }}
                      style={{
                        backgroundColor: "rgb(30, 64, 175)",
                        transformOrigin: "top",
                      }}
                      className="w-1 h-6"
                    />
                    <div
                      className="font-semibold rounded-lg shadow-md flex flex-col items-center justify-center text-center px-6 py-3 w-56"
                      style={{
                        backgroundColor: "rgb(30, 64, 175)",
                        color: "white",
                      }}
                    >
                      <div>Tim OBS</div>
                    </div>
                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 1, delay: 0.8 }}
                      style={{
                        backgroundColor: "rgb(30, 64, 175)",
                        transformOrigin: "top",
                      }}
                      className="w-1 h-6"
                    />
                    <div className="grid grid-cols-1 gap-3 mt-2">
                      {renderBoxes(getByParent("OBS"))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tata Usaha */}
            <div className="absolute top-15 right-[-5%] flex flex-col items-center">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                style={{
                  backgroundColor: "rgb(30, 64, 175)",
                  transformOrigin: "right",
                }}
                className="absolute top-0 right-28 w-[550px] h-1 mb-0"
              />
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
                style={{
                  backgroundColor: "rgb(30, 64, 175)",
                  transformOrigin: "top",
                }}
                className="w-1 h-10 mb-0"
              />
              <div
                className="font-semibold rounded-lg shadow-md flex flex-col items-center justify-center text-center px-6 py-3 w-56"
                style={{
                  backgroundColor: "rgb(30, 64, 175)",
                  color: "white",
                }}
              >
                <div>Kepala Sub-bagian Tata Usaha</div>
                <div className="text-xs mt-1">
                  {getPetugas("Kepala Sub-bagian Tata Usaha").pegawai}
                </div>
                <div className="text-xs">
                  TMT: {getPetugas("Kepala Sub-bagian Tata Usaha").tmt}
                </div>
              </div>
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                style={{
                  backgroundColor: "rgb(30, 64, 175)",
                  transformOrigin: "top",
                }}
                className="w-1 h-10 mt-1"
              />
              <div className="grid grid-cols-1 gap-3 mt-1">
                {renderBoxes(getByParent("Tata Usaha"))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StrukturDiagram;
