import { cn } from "@/lib/utils";
import React from "react";

export function SubHeading({
  children,
  as = "p",
  className,
  variant = "medium",
}: {
  children: React.ReactNode;
  as?: "p" | "h2" | "h3";
  className?: string;
  variant?: "big" | "medium" | "small";
}) {
  const Tag = as;
  const variants = {
    big: "text-base md:text-lg",
    medium: "text-sm md:text-base",
    small: "text-xs md:text-sm",
  };

  return (
    <Tag
      className={cn(
        "font-raleway text-muted-foreground",
        variants[variant],
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export default SubHeading;
