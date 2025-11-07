"use client";

import React from "react";
import Image from "next/image";
import Logo from "@/public/Logo.png";
import { Poppins } from "next/font/google";

// Import font Poppins
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export default function AuthLeftPanel() {
  return (
    <div
      className={`bg-[#004AAD] text-white flex flex-col justify-center items-center w-full md:w-1/2 p-8 ${poppins.className}`}
    >
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 tracking-wide">
        SISNOMPEG
      </h1>
      <h2 className="text-lg sm:text-xl font-semibold text-center mb-6">
        STASIUN KLIMATOLOGI
      </h2>
      <Image src={Logo} alt="Logo BMKG" width={150} height={150} priority />
      <h2 className="text-md sm:text-lg font-semibold text-center mt-6">
        PROVINSI BENGKULU
      </h2>
    </div>
  );
}
