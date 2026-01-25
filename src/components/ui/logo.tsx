import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
    return (
        <div className={cn("font-lato text-lg md:text-xl text-foreground flex items-center font-semibold ", className)}>
            <p className="">Web3</p>
            <p className="text-sky-500">Wallet</p>
        </div>
    )
}
