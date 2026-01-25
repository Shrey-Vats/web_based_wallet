import { cn } from "@/lib/utils";
import React from "react";

export function Heading({
  children,
  as = "h2",
  className,
  variant = "medium",
}: {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3";
  className?: string;
  variant?: "big" | "medium" | "small";
}) {
  const Tag = as;
  const variants = {
    big: "text-4xl md:text-5xl lg:text-6xl",
    medium: "text-2xl md:text-3xl lg:text-4xl",
    small: "text-xl md:text-2xl lg:text-3xl",
  };

  return (
    <Tag
      className={cn(
        "font-semibold tracking-tight font-inter",
        variants[variant],
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export default Heading;
