import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const API_URL = import.meta.env.VITE_API_URL;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const truncate = (str: string | null, length: number) => {
  if (!str || str.length <= length) return str;
  return `${str.slice(0, length - 3)}...`;
};
