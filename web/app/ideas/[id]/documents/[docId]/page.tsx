"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { documentApi } from "@/lib/api";
import { DocumentWithVersions, UpdateDocumentInput, ExportFormat } from "@/lib/types/idea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/editor/text-editor";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    ArrowLeft,
    Save,
    Loader2,
    History,
    Download,
    RefreshCw,
    FileText,
    FileCode,
    RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

export default function DocumentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const ideaId = params.id as string;
    const docId = params.docId as string;

    const [docData, setDocData] = useState<DocumentWithVersions | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [regenerating, setRegenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Editable fields
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [hasChanges, setHasChanges] = useState(false);

    // Version history
    const [showHistory, setShowHistory] = useState(false);
    const [reverting, setReverting] = useState<number | null>(null);

    useEffect(() => {
        if (docId) {
            fetchDocument();
        }
    }, [docId]);

    const fetchDocument = async () => {
        try {
            setLoading(true);
            const doc = await documentApi.getWithVersions(docId);
            setDocData(doc);
            setTitle(doc.title);
            setContent(doc.content);
            setHasChanges(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load document");
        } finally {
            setLoading(false);
        }
    };

    const handleTitleChange = (newTitle: string) => {
        setTitle(newTitle);
        setHasChanges(newTitle !== docData?.title || content !== docData?.content);
    };

    const handleContentChange = (newContent: string) => {
        setContent(newContent);
        setHasChanges(title !== docData?.title || newContent !== docData?.content);
    };

    const handleSave = async () => {
        if (!docData) return;

        try {
            setSaving(true);
            const updateData: UpdateDocumentInput = {
                title,
                content,
                changelog: "Manual edit",
            };
            const updated = await documentApi.update(docId, updateData);
            setDocData({ ...docData, ...updated });
            setHasChanges(false);
            toast.success("Document saved successfully!");
            fetchDocument();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to save document");
        } finally {
            setSaving(false);
        }
    };

    const handleRegenerate = async () => {
        try {
            setRegenerating(true);
            const regenerated = await documentApi.regenerate(docId);
            setDocData({ ...docData!, ...regenerated });
            setTitle(regenerated.title);
            setContent(regenerated.content);
            setHasChanges(false);
            toast.success("Document regenerated successfully!");
            fetchDocument();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to regenerate document");
        } finally {
            setRegenerating(false);
        }
    };

    const handleRevert = async (version: number) => {
        try {
            setReverting(version);
            const reverted = await documentApi.revertToVersion(docId, version);
            setDocData({ ...docData!, ...reverted });
            setTitle(reverted.title);
            setContent(reverted.content);
            setHasChanges(false);
            toast.success(`Reverted to version ${version}`);
            fetchDocument();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to revert");
        } finally {
            setReverting(null);
        }
    };

    const handleExport = async (format: "markdown" | "html" | "pdf") => {
        try {
            if (format === "pdf") {
                // Client-side PDF generation
                try {
                    // @ts-ignore
                    const html2pdf = (await import("html2pdf.js")).default;

                    const element = document.createElement("div");
                    // Add basic styling for the PDF
                    element.innerHTML = `
                        <div style="padding: 20px; font-family: system-ui, -apple-system, sans-serif; color: #000;">
                            <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 20px; text-align: center;">${title || "Document"}</h1>
                            <div style="font-size: 14px; line-height: 1.6;">
                                ${content}
                            </div>
                        </div>
                    `;

                    const opt = {
                        margin: [10, 10, 10, 10],
                        filename: `${title.replace(/[^a-zA-Z0-9]/g, "_") || "document"}.pdf`,
                        image: { type: 'jpeg', quality: 0.98 },
                        html2canvas: { scale: 2, useCORS: true },
                        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                    };

                    toast.info("Generating PDF...");
                    await html2pdf().set(opt).from(element).save();
                    toast.success("PDF downloaded!");
                    return;
                } catch (pdfErr) {
                    console.error("PDF generation failed:", pdfErr);
                    throw new Error("Failed to generate PDF");
                }
            }

            // Server-side export for Markdown/HTML
            const blob = await documentApi.export(docId, format);
            const url = URL.createObjectURL(blob);
            const anchor = window.document.createElement("a");
            anchor.href = url;
            anchor.download = `${title.replace(/[^a-zA-Z0-9]/g, "_")}.${format === "markdown" ? "md" : "html"}`;
            anchor.click();
            URL.revokeObjectURL(url);
            toast.success("Document exported!");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Export failed");
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto py-8 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <p className="mt-4 text-muted-foreground">Loading document...</p>
                </div>
            </div>
        );
    }

    if (error || !docData) {
        return (
            <div className="container mx-auto py-8">
                <Card className="border-destructive">
                    <CardContent className="pt-6">
                        <p className="text-destructive">{error || "Document not found"}</p>
                        <Link href={`/ideas/${ideaId}/documents`}>
                            <Button variant="outline" className="mt-4">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Documents
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Top Bar */}
            <div className="sticky top-0 z-10 bg-background border-b">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href={`/ideas/${ideaId}/documents`}>
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <Badge variant={docData.type === "PRD" ? "default" : "secondary"}>
                                {docData.type}
                            </Badge>
                            <Badge variant={docData.status === "published" ? "default" : "outline"}>
                                {docData.status}
                            </Badge>
                            {hasChanges && (
                                <Badge variant="destructive">Unsaved Changes</Badge>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Version History */}
                            <Sheet open={showHistory} onOpenChange={setShowHistory}>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <History className="h-4 w-4 mr-2" />
                                        History ({docData.versions?.length || 0})
                                    </Button>
                                </SheetTrigger>
                                <SheetContent>
                                    <SheetHeader>
                                        <SheetTitle>Version History</SheetTitle>
                                        <SheetDescription>
                                            View and restore previous versions
                                        </SheetDescription>
                                    </SheetHeader>
                                    <div className="mt-6 space-y-4">
                                        {docData.versions?.length === 0 ? (
                                            <p className="text-muted-foreground text-center py-8">
                                                No version history yet
                                            </p>
                                        ) : (
                                            docData.versions?.map((version) => (
                                                <Card key={version.id}>
                                                    <CardContent className="py-4">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="font-medium">
                                                                    Version {version.version}
                                                                </p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {version.changelog || "No changelog"}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    {new Date(version.createdAt).toLocaleString()}
                                                                </p>
                                                            </div>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleRevert(version.version)}
                                                                disabled={reverting !== null}
                                                            >
                                                                {reverting === version.version ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <RotateCcw className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))
                                        )}
                                    </div>
                                </SheetContent>
                            </Sheet>

                            {/* Export */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Download className="h-4 w-4 mr-2" />
                                        Export
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => handleExport("markdown")}>
                                        <FileText className="h-4 w-4 mr-2" />
                                        Markdown (.md)
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleExport("html")}>
                                        <FileCode className="h-4 w-4 mr-2" />
                                        HTML (.html)
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleExport("pdf")}>
                                        <FileText className="h-4 w-4 mr-2" />
                                        PDF (.pdf)
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Regenerate */}
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Regenerate
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Regenerate Document?</DialogTitle>
                                        <DialogDescription>
                                            This will use AI to generate new content for this document.
                                            Your current version will be saved in the history.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <Button
                                            onClick={handleRegenerate}
                                            disabled={regenerating}
                                        >
                                            {regenerating ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Regenerating...
                                                </>
                                            ) : (
                                                <>
                                                    <RefreshCw className="mr-2 h-4 w-4" />
                                                    Regenerate
                                                </>
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            {/* Save */}
                            <Button
                                onClick={handleSave}
                                disabled={!hasChanges || saving}
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6 max-w-7xl">
                {/* Title */}
                <Input
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="text-2xl font-bold border-none focus-visible:ring-0 px-0 mb-4"
                    placeholder="Document Title"
                />

                {/* Rich Text Editor */}
                <Card className="py-0">
                    <CardContent className="p-0">
                        <RichTextEditor
                            value={content}
                            onChange={handleContentChange}
                            placeholder="Start writing your document..."
                        />
                    </CardContent>
                </Card>

                {/* Metadata */}
                <div className="mt-6 text-sm text-muted-foreground">
                    <p>Created: {new Date(docData.createdAt).toLocaleString()}</p>
                    <p>Last updated: {new Date(docData.updatedAt).toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
}
