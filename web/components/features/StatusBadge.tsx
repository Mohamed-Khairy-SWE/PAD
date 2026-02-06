import { Badge } from "@/components/ui/badge";
import { TaskStatus } from "@/lib/types/idea";
import { Clock, Loader2, CheckCircle, Ban } from "lucide-react";

interface StatusBadgeProps {
    status: TaskStatus;
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const variants: Record<TaskStatus, { color: string; label: string; icon: typeof Clock }> = {
        planned: {
            color: "bg-slate-100 text-slate-700 border-slate-200",
            label: "Planned",
            icon: Clock
        },
        in_progress: {
            color: "bg-blue-100 text-blue-700 border-blue-200",
            label: "In Progress",
            icon: Loader2
        },
        completed: {
            color: "bg-green-100 text-green-700 border-green-200",
            label: "Completed",
            icon: CheckCircle
        },
        blocked: {
            color: "bg-red-100 text-red-700 border-red-200",
            label: "Blocked",
            icon: Ban
        },
    };

    const variant = variants[status];
    const Icon = variant.icon;

    return (
        <Badge
            className={`${variant.color} border ${className}`}
            variant="outline"
        >
            <Icon className="w-3 h-3 mr-1" />
            {variant.label}
        </Badge>
    );
}
