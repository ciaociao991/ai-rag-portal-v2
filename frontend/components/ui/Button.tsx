"use client";
import React from "react";

type Variant = "primary" | "secondary" | "ghost" | "subtle";
type Size = "sm" | "md" | "lg";

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  const base =
    "inline-flex items-center justify-center font-medium tracking-tight transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30";
  const sizes: Record<Size, string> = {
    sm: "h-8 px-3 text-[13px] rounded-lg",
    md: "h-9 px-4 text-[13px] rounded-lg",
    lg: "h-10 px-5 text-[14px] rounded-lg",
  };
  const variants: Record<Variant, string> = {
    primary: "bg-ink text-white hover:bg-[#1B2538] border border-ink",
    secondary: "bg-white text-ink border border-line hover:bg-surface",
    ghost: "bg-transparent text-ink hover:bg-white border border-transparent",
    subtle: "bg-surface text-ink border border-line hover:bg-white",
  };
  return <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props} />;
}
