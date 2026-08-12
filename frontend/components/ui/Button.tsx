"use client";
import React from "react";

type Variant = "primary" | "secondary" | "ghost" | "subtle";
type Size = "sm" | "md" | "lg";

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium tracking-tight transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25 focus-visible:ring-offset-1";
  const sizes: Record<Size, string> = {
    sm: "h-8 px-3 text-[12.5px] rounded-[10px]",
    md: "h-9 px-4 text-[13px] rounded-[10px]",
    lg: "h-10 px-5 text-[13.5px] rounded-[10px]",
  };
  const variants: Record<Variant, string> = {
    primary: "bg-ink text-white border border-ink hover:bg-[#151E32] active:bg-[#0B1220] shadow-sm",
    secondary: "bg-white text-ink border border-line hover:bg-surface active:bg-white",
    ghost: "bg-transparent text-ink hover:bg-surface border border-transparent",
    subtle: "bg-surface text-ink border border-line hover:bg-white active:bg-surface",
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
