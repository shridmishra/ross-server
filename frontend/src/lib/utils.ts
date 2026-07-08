import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  IconShieldLock,
  IconDatabase,
  IconCpu,
  IconLock,
  IconFolder,
} from "@tabler/icons-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getDomainIcon = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes("govern") || t.includes("responsib")) {
    return IconShieldLock;
  }
  if (t.includes("data") || t.includes("privacy")) {
    return IconDatabase;
  }
  if (t.includes("design") || t.includes("develop") || t.includes("model")) {
    return IconCpu;
  }
  if (t.includes("security") || t.includes("protection")) {
    return IconLock;
  }
  return IconFolder;
};
