import { cn } from "@/lib/utils";

export function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("max-w-7xl mx-auto md:px-8 lg:px-16", className)}>
      {children}
    </div>
  );
}
