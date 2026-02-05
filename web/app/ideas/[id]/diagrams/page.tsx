"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { diagramApi, ideaApi } from "@/lib/api";
import { Diagram, DiagramType, Idea } from "@/lib/types/idea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
    ArrowLeft,
    Loader2,
    RefreshCw,
    Save,
    Sparkles,
    Database,
    GitBranch,
    Workflow,
} from "lucide-react";
import Link from "next/link";

// Dynamic import for Mermaid
import dynamic from "next/dynamic";

const MermaidPreview = dynamic(
    () => import("@/components/mermaid-preview").then((mod) => mod.default),
    { ssr: false, loading: () => <div className="p-4 text-center">Loading preview...</div> }
);

const DIAGRAM_ICONS: Record<DiagramType, React.ReactNode> = {
    ERD: <Database className="h-4 w-4" />,
    SEQUENCE: <GitBranch className="h-4 w-4" />,
    SCHEMA: <Workflow className="h-4 w-4" />,
    FLOWCHART: <Sparkles className="h-4 w-4" />,
};

const DIAGRAM_LABELS: Record<DiagramType, string> = {
    ERD: "Entity Relationship",
    SEQUENCE: "Sequence Diagram",
    SCHEMA: "Architecture",
    FLOWCHART: "Flowchart",
};

export default function DiagramsPage() {
    const params = useParams();
    const ideaId = params.id as string;

    const [idea, setIdea] = useState<Idea | null>(null);
    const [diagrams, setDiagrams] = useState<Diagram[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});
    const [error, setError] = useState<string | null>(null);
    const [editedCode, setEditedCode] = useState<Record<string, string>>({});
    const [activeTab, setActiveTab] = useState<string>("ERD");

    const fetchData = useCallback(async () => {
        try {
            const [ideaData, diagramsData] = await Promise.all([
                ideaApi.getById(ideaId),
                diagramApi.getByIdeaId(ideaId),
            ]);
            setIdea(ideaData);
            setDiagrams(diagramsData);

            // Initialize edited code for each diagram
            const codeMap: Record<string, string> = {};
            diagramsData.forEach((d) => {
                codeMap[d.id] = d.mermaidCode;
            });
            setEditedCode(codeMap);

            // Set active tab to first available diagram type
            if (diagramsData.length > 0) {
                setActiveTab(diagramsData[0].type);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load data");
        } finally {
            setIsLoading(false);
        }
    }, [ideaId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError(null);
        try {
            const generated = await diagramApi.generate(ideaId);
            setDiagrams(generated);

            // Initialize edited code
            const codeMap: Record<string, string> = {};
            generated.forEach((d) => {
                codeMap[d.id] = d.mermaidCode;
            });
            setEditedCode(codeMap);

            if (generated.length > 0) {
                setActiveTab(generated[0].type);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate diagrams");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async (diagram: Diagram) => {
        const newCode = editedCode[diagram.id];
        if (newCode === diagram.mermaidCode) return; // No changes

        setIsSaving((prev) => ({ ...prev, [diagram.id]: true }));
        setError(null);
        try {
            const updated = await diagramApi.update(diagram.id, {
                mermaidCode: newCode,
                changelog: "Manual edit",
            });
            setDiagrams((prev) =>
                prev.map((d) => (d.id === updated.id ? updated : d))
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save diagram");
        } finally {
            setIsSaving((prev) => ({ ...prev, [diagram.id]: false }));
        }
    };

    const handleRegenerate = async (diagram: Diagram) => {
        setIsSaving((prev) => ({ ...prev, [diagram.id]: true }));
        setError(null);
        try {
            const updated = await diagramApi.regenerate(diagram.id);
            setDiagrams((prev) =>
                prev.map((d) => (d.id === updated.id ? updated : d))
            );
            setEditedCode((prev) => ({ ...prev, [diagram.id]: updated.mermaidCode }));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to regenerate diagram");
        } finally {
            setIsSaving((prev) => ({ ...prev, [diagram.id]: false }));
        }
    };

    const handleCodeChange = (diagramId: string, code: string) => {
        setEditedCode((prev) => ({ ...prev, [diagramId]: code }));
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
                    <Link href="/ideas">
                        <Button>Back to Ideas</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const getDiagramByType = (type: string): Diagram | undefined =>
        diagrams.find((d) => d.type === type);

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl">
            <Link
                href={`/ideas/${ideaId}`}
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Idea
            </Link>

            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-1">Diagrams</h1>
                    <p className="text-muted-foreground">
                        Visual representations of your software architecture
                    </p>
                </div>

                {diagrams.length === 0 && (
                    <Button onClick={handleGenerate} disabled={isGenerating}>
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Generate Diagrams
                            </>
                        )}
                    </Button>
                )}
            </div>

            {error && (
                <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {diagrams.length === 0 && !isGenerating ? (
                <Card>
                    <CardContent className="py-16 text-center">
                        <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-semibold text-lg mb-2">No Diagrams Yet</h3>
                        <p className="text-muted-foreground mb-4">
                            Generate diagrams to visualize your software architecture
                        </p>
                        <Button onClick={handleGenerate} disabled={isGenerating}>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate Diagrams
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4">
                        {(["ERD", "SEQUENCE", "SCHEMA"] as DiagramType[]).map((type) => {
                            const diagram = getDiagramByType(type);
                            return (
                                <TabsTrigger
                                    key={type}
                                    value={type}
                                    disabled={!diagram}
                                    className="flex items-center gap-2"
                                >
                                    {DIAGRAM_ICONS[type]}
                                    {DIAGRAM_LABELS[type]}
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>

                    {(["ERD", "SEQUENCE", "SCHEMA"] as DiagramType[]).map((type) => {
                        const diagram = getDiagramByType(type);
                        if (!diagram) return null;

                        const hasChanges = editedCode[diagram.id] !== diagram.mermaidCode;
                        const saving = isSaving[diagram.id];

                        return (
                            <TabsContent key={type} value={type}>
                                <Card>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                {DIAGRAM_ICONS[type]}
                                                {diagram.title}
                                            </CardTitle>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleRegenerate(diagram)}
                                                    disabled={saving}
                                                >
                                                    <RefreshCw className={`h-4 w-4 mr-1 ${saving ? "animate-spin" : ""}`} />
                                                    Regenerate
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleSave(diagram)}
                                                    disabled={saving || !hasChanges}
                                                >
                                                    {saving ? (
                                                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                                    ) : (
                                                        <Save className="h-4 w-4 mr-1" />
                                                    )}
                                                    Save
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <Separator />
                                    <CardContent className="p-0">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x">
                                            {/* Editor */}
                                            <div className="p-4">
                                                <h4 className="text-sm font-medium mb-2">Mermaid Code</h4>
                                                <textarea
                                                    className="w-full h-[500px] font-mono text-sm p-3 border rounded-md bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                                    value={editedCode[diagram.id] || ""}
                                                    onChange={(e) => handleCodeChange(diagram.id, e.target.value)}
                                                    spellCheck={false}
                                                />
                                            </div>

                                            {/* Preview */}
                                            <div className="p-4">
                                                <h4 className="text-sm font-medium mb-2">Live Preview</h4>
                                                <div className="border rounded-md bg-white dark:bg-gray-950 p-4 min-h-[500px] overflow-auto">
                                                    <MermaidPreview code={editedCode[diagram.id] || ""} />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        );
                    })}
                </Tabs>
            )}
        </div>
    );
}
