"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ideaApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";

const MIN_CHAR_COUNT = 20;
const MAX_CHAR_COUNT = 10000;

export default function NewIdeaPage() {
    const router = useRouter();
    const [ideaText, setIdeaText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const charCount = ideaText.length;
    const isValid = charCount >= MIN_CHAR_COUNT && charCount <= MAX_CHAR_COUNT;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isValid) {
            setError(`Idea must be between ${MIN_CHAR_COUNT} and ${MAX_CHAR_COUNT} characters`);
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const idea = await ideaApi.create({ rawText: ideaText });
            router.push(`/ideas/${idea.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create idea");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-3xl">
            <Link
                href="/ideas"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Ideas
            </Link>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-primary" />
                        Submit New Idea
                    </CardTitle>
                    <CardDescription>
                        Describe your software idea in detail. PAD will analyze it and provide
                        suggestions, identify missing details, and ask clarifying questions.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Textarea
                                value={ideaText}
                                onChange={(e) => setIdeaText(e.target.value)}
                                placeholder="Describe your software idea... What problem does it solve? Who are the target users? What are the main features?"
                                className="min-h-[200px] resize-y"
                                disabled={isSubmitting}
                            />
                            <div className="flex justify-between text-sm">
                                <span
                                    className={
                                        charCount < MIN_CHAR_COUNT
                                            ? "text-muted-foreground"
                                            : "text-green-600"
                                    }
                                >
                                    {charCount} / {MIN_CHAR_COUNT} min characters
                                </span>
                                <span
                                    className={
                                        charCount > MAX_CHAR_COUNT
                                            ? "text-destructive"
                                            : "text-muted-foreground"
                                    }
                                >
                                    {MAX_CHAR_COUNT - charCount} remaining
                                </span>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button
                                type="submit"
                                disabled={!isValid || isSubmitting}
                                className="flex-1"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating Idea...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Submit & Analyze
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
