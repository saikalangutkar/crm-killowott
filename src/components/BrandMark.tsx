import React from "react";

interface BrandMarkProps {
  className?: string;
  size?: number;
}

export function BrandMark({ className = "w-6 h-6", size }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="currentColor"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <path d="M24 2c2.2 13.8 7.9 19.6 22 22-14.1 2.4-19.8 8.2-22 22-2.2-13.8-7.9-19.6-22-22 14.1-2.4 19.8-8.2 22-22Z" />
    </svg>
  );
}
