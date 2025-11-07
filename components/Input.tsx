"use client";

import React, { useState } from "react";
import { InputProps } from "@/interface/InputProps";
import { Icon } from "@iconify/react";

export default function InputField({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  disabled,
  readOnly,
  className,
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const isDate = type === "date";

  return (
    <div className="flex flex-col gap-1 relative text-black">
      {label && (
        <label htmlFor={name} className="text-sm text-gray-600">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          id={name}
          name={name}
          type={isPassword && showPassword ? "text" : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          readOnly={readOnly}
          className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:text-black pr-10 ${className || ""} ${
            isDate ? "custom-date" : ""
          }`}
        />

        {/* Icon Password */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <Icon
              icon={showPassword ? "mdi:eye-off-outline" : "mdi:eye-outline"}
              width={22}
              height={22}
            />
          </button>
        )}

        {/* Icon Kalender custom */}
        {isDate && (
          <Icon
            icon="mdi:calendar-outline"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            width={20}
            height={20}
          />
        )}
      </div>

      {/* CSS Global khusus date */}
      <style jsx>{`
        /* Hilangkan icon date bawaan browser */
        input[type="date"].custom-date::-webkit-calendar-picker-indicator {
          opacity: 0;
          position: absolute;
          right: 0;
          width: 100%;
          cursor: pointer;
          height: 100%;
        }

        /* Pastikan posisi icon tetap pas */
        input[type="date"].custom-date {
          position: relative;
        }

        /* Saat klik input date, pop-up muncul di bawah icon */
        input[type="date"].custom-date:focus::-webkit-calendar-picker-indicator {
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
