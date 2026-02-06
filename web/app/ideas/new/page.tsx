"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ideaApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowUp, Sparkles } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/logo";

const MIN_CHAR_COUNT = 20;
const MAX_CHAR_COUNT = 10000;
const MIN_THINKING_TIME = 2000; // Minimum 2 seconds of thinking animation

export default function NewIdeaPage() {
    const router = useRouter();
    const [ideaText, setIdeaText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const charCount = ideaText.length;
    const isValid = charCount >= MIN_CHAR_COUNT && charCount <= MAX_CHAR_COUNT;

    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [ideaText]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isValid) {
            setError(`Idea must be between ${MIN_CHAR_COUNT} and ${MAX_CHAR_COUNT} characters`);
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const startTime = Date.now();

        try {
            const idea = await ideaApi.create({ rawText: ideaText });

            // Calculate remaining time to show animation
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, MIN_THINKING_TIME - elapsedTime);

            // Wait for minimum thinking time before navigating
            await new Promise(resolve => setTimeout(resolve, remainingTime));

            router.push(`/ideas/${idea.id}`);
        } catch (err) {
            // Also ensure minimum thinking time on error
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, MIN_THINKING_TIME - elapsedTime);
            await new Promise(resolve => setTimeout(resolve, remainingTime));

            setError(err instanceof Error ? err.message : "Failed to create idea");
            setIsSubmitting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && isValid && !isSubmitting) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Header */}
            <header className="border-b sticky top-0 z-50 bg-background">
                <div className="container mx-auto px-4 py-3 max-w-4xl">
                    <Link
                        href="/ideas"
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors group"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Back
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
                    <div className="w-full max-w-3xl space-y-8">
                        {/* Hero Section - Only show when empty */}
                        {!ideaText && !isSubmitting && (
                            <div className="text-center space-y-4 mb-8">
                                <Logo/>
                                <div>
                                    
                                    <p className="text-muted-foreground">
                                        Describe your software idea and get AI-powered analysis
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                {error}
                            </div>
                        )}

                        {/* ChatGPT-style Input Container */}
                        <form onSubmit={handleSubmit} className="relative">
                            <div className="relative flex items-end bg-background border border-border rounded-3xl shadow-sm hover:shadow-md focus-within:shadow-md transition-shadow overflow-hidden">
                                {/* Textarea */}
                                <textarea
                                    ref={textareaRef}
                                    value={ideaText}
                                    onChange={(e) => setIdeaText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Describe your software idea... What problem does it solve? Who will use it?"
                                    disabled={isSubmitting}
                                    rows={1}
                                    className="flex-1 resize-none bg-transparent px-6 py-4 pr-14 text-base placeholder:text-muted-foreground focus:outline-none disabled:opacity-50 max-h-[60vh] overflow-y-auto"
                                    style={{
                                        minHeight: "56px",
                                        lineHeight: "1.5",
                                    }}
                                />

                                {/* Submit Button with Hover Text */}
                                <div className="absolute right-3 bottom-[8px]">
                                    <Button
                                        type="submit"
                                        disabled={!isValid || isSubmitting}
                                        onMouseEnter={() => setIsHovered(true)}
                                        onMouseLeave={() => setIsHovered(false)}
                                        className={`rounded-full shadow-sm disabled:opacity-30 disabled:pointer-events-none transition-all duration-300 ease-in-out overflow-hidden cursor-pointer ${isHovered && isValid ? "pr-4 pl-4" : "px-0"
                                            }`}
                                        style={{
                                            width: isHovered && isValid ? "auto" : "40px",
                                            height: "40px",
                                        }}
                                    >
                                        <div className="flex items-center gap-2 whitespace-nowrap">
                                            <ArrowUp className="h-5 w-5 flex-shrink-0" />
                                            <span
                                                className="overflow-hidden transition-all duration-300 ease-in-out"
                                                style={{
                                                    width: isHovered && isValid ? "auto" : "0px",
                                                    opacity: isHovered && isValid ? 1 : 0,
                                                    display: isHovered && isValid ? "block" : "none",
                                                }}
                                            >
                                                Submit
                                            </span>
                                        </div>
                                    </Button>
                                </div>
                            </div>

                            {/* Character Count & Helper Text */}
                            {!isSubmitting && (
                                <div className="flex items-center justify-between mt-2 px-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-4">
                                        {charCount > 0 && (
                                            <span
                                                className={
                                                    charCount < MIN_CHAR_COUNT
                                                        ? "text-amber-600 dark:text-amber-400"
                                                        : charCount > MAX_CHAR_COUNT
                                                            ? "text-destructive"
                                                            : "text-green-600 dark:text-green-400"
                                                }
                                            >
                                                {charCount < MIN_CHAR_COUNT
                                                    ? `${MIN_CHAR_COUNT - charCount} more characters needed`
                                                    : charCount > MAX_CHAR_COUNT
                                                        ? `${charCount - MAX_CHAR_COUNT} over limit`
                                                        : `${charCount.toLocaleString()} characters`}
                                            </span>
                                        )}
                                    </div>
                                    <span className="hidden sm:block">
                                        Press {navigator?.platform?.includes("Mac") ? "⌘" : "Ctrl"} + Enter to
                                        submit
                                    </span>
                                </div>
                            )}

                            {/* Thinking Animation - Appears under textarea */}
                            {isSubmitting && (
                                <div className="mt-6 flex flex-col items-start justify-center py-8 space-y-4 animate-in fade-in duration-500">
                                    <div className="relative">
                                        {/* Animated dots */}
                                        <div className="flex gap-8">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full bg-primary"
                                                    style={{
                                                        animation: "bounce 1.4s infinite ease-in-out",
                                                        animationDelay: "0s",
                                                    }}
                                                />
                                                <div
                                                    className="w-3 h-3 rounded-full bg-primary"
                                                    style={{
                                                        animation: "bounce 1.4s infinite ease-in-out",
                                                        animationDelay: "0.2s",
                                                    }}
                                                />
                                                <div
                                                    className="w-3 h-3 rounded-full bg-primary"
                                                    style={{
                                                        animation: "bounce 1.4s infinite ease-in-out",
                                                        animationDelay: "0.4s",
                                                    }}
                                                />
                                            </div>
                                            <p className="text-sm font-medium">Analyzing your idea...</p>

                                        </div>
                                    </div>
                                    <div className="text-center space-y-1">
                                        <p className="text-xs text-muted-foreground">
                                            This may take a few moments
                                        </p>
                                    </div>
                                </div>
                            )}
                        </form>

                        {/* Tips Section - Only show when empty or short and not submitting */}
                        {charCount < 50 && !isSubmitting && (
                            <div className="text-center space-y-3 pt-4">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Not sure where to start? Try including:
                                </p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIdeaText("I want to build a ")}
                                        className="px-4 py-2 text-sm rounded-full border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
                                    >
                                        The problem it solves
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIdeaText("The target users are ")}
                                        className="px-4 py-2 text-sm rounded-full border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
                                    >
                                        Target users
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIdeaText("Key features include ")}
                                        className="px-4 py-2 text-sm rounded-full border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
                                    >
                                        Core features
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Note */}
                <div className="border-t py-4 px-4 text-center text-xs text-muted-foreground">
                    PAD will analyze your idea and provide feedback, ask questions, and identify missing details
                </div>
            </main>

            {/* Keyframe animations */}
            <style jsx>{`
                @keyframes bounce {
                    0%,
                    80%,
                    100% {
                        transform: scale(0);
                        opacity: 0.5;
                    }
                    40% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
}