import { ReactNode } from "react";

export interface ButtonProps {
  label: string | ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  styleButton?: string;
}
