"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FaHome,
  FaUsers,
  FaSitemap,
  FaSignOutAlt,
  FaTable,
  FaGraduationCap,
  FaLevelUpAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { FaNoteSticky } from "react-icons/fa6";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type SidebarProps = {
  active?: string;
};

const Sidebar = ({ active }: SidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClientComponentClient();
  const [isOpen, setIsOpen] = useState(false);

  const menu = [
    { name: "Beranda", href: "/beranda", icon: <FaHome /> },
    { name: "Pegawai", href: "/pegawai", icon: <FaUsers /> },
    { name: "Pendidikan", href: "/pendidikan", icon: <FaGraduationCap /> },
    { name: "Penjenjangan", href: "/penjenjangan", icon: <FaLevelUpAlt /> },
    { name: "Tabel Struktur", href: "/struktur", icon: <FaTable /> },
    { name: "Catatan Karir", href: "/catatan-karir", icon: <FaNoteSticky /> },
    { name: "Diagram", href: "/organigram", icon: <FaSitemap /> },
  ];

  const handleLogout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
      }

      toast.success("Logout berhasil!");
      setTimeout(() => router.push("/"), 800);
    } catch (err: unknown) {
      let message = "Terjadi kesalahan saat logout.";
      if (err instanceof Error) message = err.message;

      console.error("Gagal logout:", message);
      toast.error(message + " Mengarahkan ke login...");
      localStorage.clear();
      sessionStorage.clear();
      setTimeout(() => router.push("/"), 800);
    }
  };

  return (
    <>
      <ToastContainer position="top-center" autoClose={1500} />

      {/* Tombol Hamburger (muncul di mobile) */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-blue-800 text-white p-2 rounded-md shadow-md"
      >
        <FaBars size={20} />
      </button>

      {/* Sidebar (Desktop dan Mobile) */}
      <AnimatePresence>
        {(isOpen || typeof window !== "undefined") && (
          <motion.div
            key="sidebar"
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3 }}
            className={`fixed top-0 left-0 h-screen z-40 w-64 bg-blue-800 text-white 
                        bg-opacity-95 rounded-tr-3xl rounded-br-3xl shadow-lg
                        backdrop-blur-sm flex flex-col justify-between 
                        transition-all duration-300 ease-in-out
                        ${isOpen ? "translate-x-0" : "hidden lg:flex"}`}
          >
            {/* Header Logo */}
            <div className="flex flex-col flex-grow">
              <div className="flex items-center justify-between px-4 py-5">
                <div className="flex items-center">
                  <Image src="/Logo.png" alt="BMKG" width={38} height={38} unoptimized />
                  <span className="ml-3 text-lg font-semibold text-white tracking-wide">
                    BMKG
                  </span>
                </div>
                {/* Tombol Close (hanya di mobile) */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="lg:hidden text-white p-1 rounded-md hover:bg-blue-700"
                >
                  <FaTimes size={18} />
                </button>
              </div>

              {/* Navigasi */}
              <nav className="flex flex-col px-3 space-y-1 mt-4">
                {menu.map((item) => {
                  const isActive =
                    active?.toLowerCase() === item.name.toLowerCase() ||
                    pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)} // Tutup sidebar saat klik di mobile
                      className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-white text-blue-800 shadow-md"
                          : "hover:bg-blue-700 text-white"
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="ml-4">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Tombol Logout & Footer */}
            <div className="flex flex-col items-center px-3 pb-5">
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 text-white w-full transition"
              >
                <FaSignOutAlt className="text-lg" />
                <span className="ml-4">Keluar</span>
              </button>
              <div className="text-center text-[11px] text-white mt-3">
                © 2025 Bhinneka Dev. All rights reserved.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
