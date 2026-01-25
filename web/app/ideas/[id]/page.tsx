"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ideaApi } from "@/lib/api";
import { Idea } from "@/lib/types/idea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    ArrowLeft,
    Brain,
    CheckCircle,
    Clock,
    Loader2,
    AlertTriangle,
    HelpCircle,
    Lightbulb,
    ListChecks,
} from "lucide-react";
import Link from "next/link";

export default function IdeaDetailPage() {
    const params = useParams();
    const router = useRouter();
    const ideaId = params.id as string;

    const [idea, setIdea] = useState<Idea | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchIdea() {
            try {
                const data = await ideaApi.getById(ideaId);
                setIdea(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load idea");
            } finally {
                setIsLoading(false);
            }
        }
        fetchIdea();
    }, [ideaId]);

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        setError(null);
        try {
            const updated = await ideaApi.analyze(ideaId);
            setIdea(updated);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to analyze idea");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleConfirm = async () => {
        setIsConfirming(true);
        setError(null);
        try {
            const updated = await ideaApi.confirm(ideaId);
            setIdea(updated);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to confirm idea");
        } finally {
            setIsConfirming(false);
        }
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

    if (!idea) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="text-center py-16">
                    <h2 className="text-2xl font-bold mb-2">Idea not found</h2>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Button onClick={() => router.push("/ideas")}>Back to Ideas</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <Link
                href="/ideas"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Ideas
            </Link>

            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl font-bold">Idea Details</h1>
                        <Badge
                            variant={idea.status === "confirmed" ? "default" : "secondary"}
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
                </div>
            </div>

            {error && (
                <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {/* Idea Content */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-lg">Your Idea</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="whitespace-pre-wrap">{idea.refinedText || idea.rawText}</p>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            {idea.status === "draft" && (
                <div className="flex gap-3 mb-6">
                    <Button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        variant={idea.analysisResult ? "outline" : "default"}
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Brain className="mr-2 h-4 w-4" />
                                {idea.analysisResult ? "Re-Analyze" : "Analyze with AI"}
                            </>
                        )}
                    </Button>

                    {idea.analysisResult && (
                        <Button onClick={handleConfirm} disabled={isConfirming}>
                            {isConfirming ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Confirming...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Confirm Idea
                                </>
                            )}
                        </Button>
                    )}
                </div>
            )}

            {/* AI Analysis Results */}
            {idea.analysisResult && (
                <div className="space-y-4">
                    <Separator />
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary" />
                        AI Analysis
                    </h2>

                    {/* Missing Details */}
                    {idea.analysisResult.missingDetails.length > 0 && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2 text-orange-600">
                                    <ListChecks className="h-4 w-4" />
                                    Missing Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {idea.analysisResult.missingDetails.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="text-orange-500 mt-1">•</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    {/* Complementary Suggestions */}
                    {idea.analysisResult.complementarySuggestions.length > 0 && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2 text-green-600">
                                    <Lightbulb className="h-4 w-4" />
                                    Complementary Suggestions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {idea.analysisResult.complementarySuggestions.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="text-green-500 mt-1">•</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    {/* Constraints & Risks */}
                    {idea.analysisResult.constraintsAndRisks.length > 0 && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2 text-yellow-600">
                                    <AlertTriangle className="h-4 w-4" />
                                    Constraints & Risks
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {idea.analysisResult.constraintsAndRisks.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="text-yellow-500 mt-1">•</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    {/* Clarifying Questions */}
                    {idea.analysisResult.clarifyingQuestions.length > 0 && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2 text-blue-600">
                                    <HelpCircle className="h-4 w-4" />
                                    Clarifying Questions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {idea.analysisResult.clarifyingQuestions.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="text-blue-500 mt-1">?</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Confirmed Success */}
            {idea.status === "confirmed" && (
                <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                    <CardContent className="py-6">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                            <div>
                                <h3 className="font-semibold text-green-700 dark:text-green-400">
                                    Idea Confirmed!
                                </h3>
                                <p className="text-sm text-green-600 dark:text-green-500">
                                    This idea is ready for document generation in Module 2.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
