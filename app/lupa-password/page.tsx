"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Poppins } from "next/font/google";
import Image from "next/image";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import InputField from "@/components/Input";
import Button from "@/components/Button";
import EmailIllustration from "@/public/email.svg";
import { EnvelopeIcon, ArrowRightCircleIcon } from "@heroicons/react/20/solid";
import type { AuthError } from "@supabase/supabase-js";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export default function LupaPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const supabase = createClientComponentClient();

  const handleSendReset = async (): Promise<void> => {
    if (!email) {
      toast.error("Email wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const { error }: { error: AuthError | null } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      toast.success(`Link reset telah dikirim ke ${email}`);
      setEmail("");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Gagal mengirim link reset.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div
        className={`overflow-hidden bg-white min-h-screen flex items-center justify-center px-6 py-24 sm:py-32 ${poppins.className}`}
      >
        <div className="mx-auto max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-16 items-center">
          {/* Ilustrasi */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Image
              src={EmailIllustration}
              alt="Ilustrasi Email"
              width={400}
              height={400}
              className="mx-auto"
              priority
            />
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:pl-8"
          >
            <div className="max-w-md mx-auto lg:mx-0 text-center lg:text-left">
              <h2 className="text-base font-semibold text-blue-800 flex items-center justify-center lg:justify-start gap-2">
                <EnvelopeIcon className="h-5 w-5" />
                Reset Kata Sandi
              </h2>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">
                Lupa Kata Sandi?
              </p>
              <p className="mt-3 text-gray-600 text-base leading-7">
                Masukkan email terdaftar Anda. Kami akan mengirimkan link untuk mereset kata sandi Anda.
              </p>

              <div className="mt-8 space-y-5">
                <InputField
                  name="email"
                  type="email"
                  placeholder="Masukkan email terdaftar"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                />

                <Button
                  styleButton="bg-blue-800 hover:bg-blue-900 text-white"
                  label={
                    loading ? (
                      "Mengirim..."
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Kirim Link Reset
                        <ArrowRightCircleIcon className="h-5 w-5" />
                      </span>
                    )
                  }
                  onClick={handleSendReset}
                  disabled={loading}
                />

                <p className="text-sm mt-4 text-gray-600">
                  Ingat kata sandi?{" "}
                  <span
                    className="underline cursor-pointer text-blue-800 hover:text-blue-900"
                    onClick={() => router.push("/")}
                  >
                    Masuk di sini
                  </span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
