"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { featureApi, taskApi } from "@/lib/api";
import { Feature, Task } from "@/lib/types/idea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriorityBadge } from "@/components/features/PriorityBadge";
import { StatusBadge } from "@/components/features/StatusBadge";
import {
    ArrowLeft,
    Sparkles,
    Plus,
    Loader2,
    ListTodo,
    AlertCircle,
    MoreVertical,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function FeatureDetailPage() {
    const params = useParams();
    const router = useRouter();
    const ideaId = params.id as string;
    const featureId = params.featureId as string;

    const [feature, setFeature] = useState<Feature | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadFeatureAndTasks();
    }, [featureId]);

    const loadFeatureAndTasks = async () => {
        try {
            setIsLoading(true);
            const [featureData, tasksData] = await Promise.all([
                featureApi.get(featureId),
                taskApi.getByFeature(featureId),
            ]);
            setFeature(featureData);
            setTasks(tasksData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestTasks = async () => {
        setIsSuggesting(true);
        setError(null);
        try {
            const suggested = await taskApi.suggestForFeature(featureId);
            setTasks(suggested);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to suggest tasks");
        } finally {
            setIsSuggesting(false);
        }
    };

    const handleUpdateTaskStatus = async (taskId: string, status: string) => {
        try {
            const updated = await taskApi.updateStatus(taskId, status);
            setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update task status");
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!confirm("Are you sure you want to delete this task?")) return;
        try {
            await taskApi.delete(taskId);
            setTasks((prev) => prev.filter((t) => t.id !== taskId));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete task");
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    if (!feature) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="text-center py-16">
                    <h2 className="text-2xl font-bold mb-2">Feature not found</h2>
                    <Button onClick={() => router.push(`/ideas/${ideaId}/features`)}>
                        Back to Features
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-5xl">
            {/* Header */}
            <Link
                href={`/ideas/${ideaId}/features`}
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Features
            </Link>

            {/* Error Message */}
            {error && (
                <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    {error}
                </div>
            )}

            {/* Feature Details */}
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <CardTitle className="text-2xl mb-2">{feature.title}</CardTitle>
                            <div className="flex items-center gap-2">
                                <PriorityBadge priority={feature.priority} />
                                <span className="text-xs text-muted-foreground capitalize">
                                    {feature.source.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{feature.description}</p>
                </CardContent>
            </Card>

            {/* Tasks Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <ListTodo className="h-6 w-6" />
                        Tasks
                    </h2>
                    <div className="flex gap-2">
                        <Button onClick={handleSuggestTasks} disabled={isSuggesting}>
                            {isSuggesting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Suggesting...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Suggest Tasks with AI
                                </>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => alert("Manual task creation coming soon!")}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Task
                        </Button>
                    </div>
                </div>

                {/* Tasks List */}
                {tasks.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="py-12">
                            <div className="text-center space-y-3">
                                <ListTodo className="h-12 w-12 mx-auto text-muted-foreground/50" />
                                <div>
                                    <h3 className="font-semibold mb-1">No tasks yet</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Let AI suggest tasks or create them manually.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {tasks
                            .sort((a, b) => a.order - b.order)
                            .map((task) => (
                                <Card key={task.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="py-4">
                                        <div className="flex items-start gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold mb-1">{task.title}</h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            {task.description}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 mt-3">
                                                    <StatusBadge status={task.status} />
                                                    <PriorityBadge priority={task.priority} />
                                                    {task.estimatedEffort && (
                                                        <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                                                            {task.estimatedEffort}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => handleUpdateTaskStatus(task.id, "in_progress")}
                                                    >
                                                        Mark In Progress
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleUpdateTaskStatus(task.id, "completed")}
                                                    >
                                                        Mark Completed
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleUpdateTaskStatus(task.id, "blocked")}
                                                    >
                                                        Mark Blocked
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteTask(task.id)}
                                                        className="text-destructive"
                                                    >
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
}
