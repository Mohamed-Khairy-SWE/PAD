"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

interface MermaidPreviewProps {
    code: string;
}

// Initialize mermaid once
mermaid.initialize({
    startOnLoad: false,
    theme: "default",
    securityLevel: "loose",
    fontFamily: "inherit",
});

export default function MermaidPreview({ code }: MermaidPreviewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [svgContent, setSvgContent] = useState<string>("");

    useEffect(() => {
        const renderDiagram = async () => {
            if (!code || !code.trim()) {
                setSvgContent("");
                setError(null);
                return;
            }

            try {
                // Generate unique ID for this render
                const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                // Parse and render the diagram
                const { svg } = await mermaid.render(id, code);
                setSvgContent(svg);
                setError(null);
            } catch (err) {
                console.error("Mermaid render error:", err);
                setError(err instanceof Error ? err.message : "Failed to render diagram");
                setSvgContent("");
            }
        };

        // Debounce rendering to avoid too many renders while typing
        const timeoutId = setTimeout(renderDiagram, 300);
        return () => clearTimeout(timeoutId);
    }, [code]);

    if (error) {
        return (
            <div className="text-destructive text-sm p-4 bg-destructive/10 rounded-md">
                <p className="font-medium mb-1">Syntax Error</p>
                <pre className="whitespace-pre-wrap text-xs opacity-80">{error}</pre>
            </div>
        );
    }

    if (!svgContent) {
        return (
            <div className="text-muted-foreground text-center py-8">
                Enter Mermaid code to see the preview
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="mermaid-preview overflow-auto"
            dangerouslySetInnerHTML={{ __html: svgContent }}
        />
    );
}
