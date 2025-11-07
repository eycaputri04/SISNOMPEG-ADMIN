import React from "react";
import { ButtonProps } from "@/interface/ButtonProps";

export default function Button({
  label,
  onClick,
  disabled,
  type = "button",
  styleButton = "", // ✅ tambahkan default value
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 font-semibold rounded-lg shadow 
        hover:opacity-90 disabled:opacity-50 transition 
        ${styleButton}`} // ✅ gunakan styleButton
    >
      {label}
    </button>
  );
}
