"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ideaApi } from "@/lib/api";
import { Idea } from "@/lib/types/idea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Lightbulb, CheckCircle, Clock } from "lucide-react";

export default function IdeasPage() {
    const router = useRouter();
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchIdeas() {
            try {
                const data = await ideaApi.list();
                setIdeas(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load ideas");
            } finally {
                setIsLoading(false);
            }
        }
        fetchIdeas();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    if (isLoading) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Ideas</h1>
                    <p className="text-muted-foreground mt-1">
                        Submit and manage your software ideas
                    </p>
                </div>
                <Button onClick={() => router.push("/ideas/new")} size="lg">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    New Idea
                </Button>
            </div>

            {error && (
                <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {ideas.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No ideas yet</h3>
                        <p className="text-muted-foreground text-center mb-4">
                            Start by submitting your first software idea
                        </p>
                        <Button onClick={() => router.push("/ideas/new")}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Your First Idea
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {ideas.map((idea) => (
                        <Card
                            key={idea.id}
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => router.push(`/ideas/${idea.id}`)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-lg line-clamp-2">
                                        {idea.rawText.slice(0, 60)}
                                        {idea.rawText.length > 60 ? "..." : ""}
                                    </CardTitle>
                                    <Badge
                                        variant={idea.status === "confirmed" ? "default" : "secondary"}
                                        className="ml-2 shrink-0"
                                    >
                                        {idea.status === "confirmed" ? (
                                            <>
                                                <CheckCircle className="mr-1 h-3 w-3" />
                                                Confirmed
                                            </>
                                        ) : (
                                            <>
                                                <Clock className="mr-1 h-3 w-3" />
                                                Draft
                                            </>
                                        )}
                                    </Badge>
                                </div>
                                <CardDescription className="line-clamp-3 mt-2">
                                    {idea.refinedText || idea.rawText}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <span>Created {formatDate(idea.createdAt)}</span>
                                    {idea.analysisResult && (
                                        <Badge variant="outline" className="ml-auto">
                                            AI Analyzed
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
