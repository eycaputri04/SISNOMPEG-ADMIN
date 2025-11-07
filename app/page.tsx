"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import IMG from "@/public/SISNOMPEG.png";
import { ToastContainer, toast } from "react-toastify";
import { motion } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";
import { Poppins } from "next/font/google";
import InputField from "@/components/Input";
import Button from "@/components/Button";
import { LockClosedIcon, ArrowRightCircleIcon } from "@heroicons/react/20/solid";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (loading) return; 
    if (!email || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        switch (error.message) {
          case "Invalid login credentials":
            setError("Email atau password salah.");
            break;
          case "User not found":
            setError("Akun tidak ditemukan.");
            break;
          default:
            setError("Terjadi kesalahan saat login. Silakan coba lagi.");
        }
        return;
      }

      toast.success("Login berhasil!");
      router.push("/beranda");
    } catch (err) {
      console.error("Login error:", err);
      setError("Terjadi kesalahan saat login. Silakan coba lagi.");
    } finally {
      // tambahkan sedikit delay biar Supabase tidak dibombardir
      setTimeout(() => setLoading(false), 1500);
    }
  };

  return (
    <>
      <ToastContainer />
      <div
        className={`overflow-hidden bg-white min-h-screen flex items-center justify-center px-6 py-24 sm:py-32 ${poppins.className}`}
      >
        <div className="mx-auto max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-16 items-center">
          {/* Kiri: Gambar ilustrasi */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative"
          >
            <Image
              src={IMG} 
              alt=" Login"
              width={2432}
              height={1442}
              className="w-full max-w-xl rounded-xl shadow-xl ring-1 ring-gray-300 mx-auto"
              priority
            />
          </motion.div>

          {/* Kanan: Form login */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:pl-8"
          >
            <form onSubmit={handleLogin} className="max-w-md mx-auto lg:mx-0">
              <h2 className="text-base font-semibold text-blue-800 flex items-center gap-2">
                <LockClosedIcon className="h-5 w-5" />
                Selamat Datang di
              </h2>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-gray-900">
                SISNOMPEG
              </p>
              <p className="mt-2 text-2xl font-medium tracking-tight text-gray-900">
                Stasiun Klimatologi BMKG Provinsi Bengkulu
              </p>
              <p className="mt-4 text-gray-600 text-base leading-7">
                Silakan login untuk mengakses sistem.
              </p>

              {/* Form Input */}
              <div className="mt-8 space-y-5">
                <div className="space-y-3">
                  <InputField
                    name="email"
                    type="email"
                    placeholder="Masukkan Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <InputField
                    name="password"
                    type="password"
                    placeholder="Masukkan Kata Sandi"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: error ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="min-h-[24px]"
                  >
                    {error && <p className="text-sm text-red-500">{error}</p>}
                  </motion.div>
                </div>

                <div className="text-right text-sm text-blue-800 hover:underline">
                  <Link href="/lupa-password">Lupa Kata Sandi?</Link>
                </div>

                <Button
                  styleButton="bg-blue-800 hover:bg-blue-900 text-white"
                  label={
                    loading ? (
                      "Memproses..."
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Masuk
                        <ArrowRightCircleIcon className="h-5 w-5" />
                      </span>
                    )
                  }
                  type="submit" 
                  disabled={loading}
                />
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </>
  );
}
