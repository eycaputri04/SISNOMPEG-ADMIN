"use client";

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
} from "react-icons/fa";
import { FaNoteSticky } from "react-icons/fa6";
import Image from "next/image";
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
      // Gunakan tipe unknown, kemudian type guard
      let message = "Terjadi kesalahan saat logout.";
      if (err instanceof Error) message = err.message;

      console.error("Gagal logout:", message);
      toast.error(message + " Mengarahkan ke login...");

      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
      }

      setTimeout(() => router.push("/"), 800);
    }
  };

  return (
    <>
      <ToastContainer position="top-center" autoClose={1500} />
      <div
        className="fixed top-0 left-0 h-screen z-50 w-50 bg-blue-800 bg-opacity-95 
                   text-white rounded-tr-3xl rounded-br-3xl shadow-lg 
                   backdrop-blur-sm flex flex-col transition-all duration-300 ease-in-out"
      >
        {/* Logo */}
        <div className="flex flex-col flex-grow">
          <div className="flex items-center justify-center py-6">
            <Image 
              src="/Logo.png" 
              alt="BMKG" 
              width={40} 
              height={40} 
              unoptimized
            />
            <span className="ml-3 text-lg font-semibold text-white tracking-wide">
              BMKG 
            </span>
          </div>

          {/* Menu Navigasi */}
          <nav className="flex flex-col px-2 space-y-1">
            {menu.map((item) => {
              const isActive =
                active?.toLowerCase() === item.name.toLowerCase() ||
                pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
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

        {/* Tombol Logout */}
        <div className="flex flex-col items-center px-2 pb-4">
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 text-white w-full transition"
          >
            <FaSignOutAlt className="text-lg" />
            <span className="ml-4">Keluar</span>
          </button>

          <div className="text-center text-[11px] text-white mt-4 px-2 leading-tight">
            © 2025 Bhinneka Dev. All rights reserved.
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
