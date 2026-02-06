import { Badge } from "@/components/ui/badge";
import { Priority } from "@/lib/types/idea";

interface PriorityBadgeProps {
    priority: Priority;
    className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
    const variants: Record<Priority, { color: string; label: string }> = {
        low: { color: "bg-blue-100 text-blue-700 border-blue-200", label: "Low" },
        medium: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "Medium" },
        high: { color: "bg-orange-100 text-orange-700 border-orange-200", label: "High" },
        critical: { color: "bg-red-100 text-red-700 border-red-200", label: "Critical" },
    };

    const variant = variants[priority];

    return (
        <Badge
            className={`${variant.color} border ${className}`}
            variant="outline"
        >
            {variant.label}
        </Badge>
    );
}
