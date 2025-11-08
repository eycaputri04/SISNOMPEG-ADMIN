"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { Poppins } from "next/font/google";
import InputField from "@/components/Input";
import Button from "@/components/Button";
import { LockClosedIcon } from "@heroicons/react/20/solid";
import type { AuthError } from "@supabase/supabase-js";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Tambahan penting agar token Supabase dari URL bisa dibaca
  useEffect(() => {
    const handleRecovery = async () => {
      const hashParams = window.location.hash.substring(1);
      const params = new URLSearchParams(hashParams);
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      if (access_token && refresh_token) {
        await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
      }
    };

    handleRecovery();
  }, []);

  const handleResetPassword = async (): Promise<void> => {
    if (!newPassword || !confirmPassword) {
      toast.error("Semua field wajib diisi.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setLoading(true);
    try {
      const { error }: { error: AuthError | null } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      // Logout supaya user diarahkan ke login lagi
      await supabase.auth.signOut();

      toast.success("Kata sandi berhasil diperbarui! Silakan login kembali.");
      setTimeout(() => router.push("/"), 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Gagal memperbarui kata sandi.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div
        className={`min-h-screen bg-white flex items-center justify-center px-6 py-24 ${poppins.className}`}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full bg-gray-50 shadow-xl rounded-2xl p-8"
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <LockClosedIcon className="h-6 w-6 text-blue-800" />
            <h2 className="text-2xl font-semibold text-blue-800">
              Reset Kata Sandi
            </h2>
          </div>

          <InputField
            name="newPassword"
            type="password"
            placeholder="Kata sandi baru"
            value={newPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewPassword(e.target.value)
            }
          />
          <br />
          <InputField
            name="confirmPassword"
            type="password"
            placeholder="Konfirmasi kata sandi baru"
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setConfirmPassword(e.target.value)
            }
          />

          <Button
            styleButton="bg-blue-800 hover:bg-blue-900 text-white mt-4"
            label={loading ? "Menyimpan..." : "Simpan Kata Sandi Baru"}
            onClick={handleResetPassword}
            disabled={loading}
          />
        </motion.div>
      </div>
    </>
  );
}
