import Icon from "@/src/lib/components/custom/Icon";
import type { icons } from "lucide-react";

export default function DashboardHeader({ title, subtitle, iconName }: { title: string, subtitle: string, iconName: keyof typeof icons }) {
    return (
        <div className="flex items-center gap-4">
            <div className="size-16 rounded-lg bg-gradient-to-br from-primary/5 to-primary/2 flex items-center justify-center border border-primary/20 aspect-square">
                <Icon name={iconName} className="size-8 text-primary" />
            </div>
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                    {title}
                </h1>
                <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl">
                    {subtitle}
                </p>
            </div>
        </div>
    );
}