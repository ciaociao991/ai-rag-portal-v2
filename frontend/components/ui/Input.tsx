"use client";
import React from "react";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-9 w-full rounded-[10px] border border-line bg-white px-3 text-[13px] placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent ${props.className || ""}`}
    />
  );
}
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl border border-line bg-white px-3 py-3 text-[13px] leading-relaxed placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent ${props.className || ""}`}
    />
  );
}
export function Label(props: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label {...props} className={`text-[12px] font-medium text-ink ${props.className || ""}`} />;
}
