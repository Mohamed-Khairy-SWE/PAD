import { NextFunction } from "express";
import AppError from "../../utils/app-error";
import DocumentRepository from "./document.repository";
import IdeaRepository from "../idea/idea.repository";
import AiService from "../ai/ai.service";
import {
    IDocument,
    IDocumentVersion,
    IUpdateDocumentWithChangelogData,
    IDocumentWithVersions,
    DocumentType,
} from "./types/IDocument";
import TurndownService from "turndown";

class DocumentService {
    private static documentRepo: DocumentRepository = DocumentRepository.getInstance();
    private static ideaRepo = IdeaRepository.getInstance();

    // Generate PRD and BRD documents for a confirmed idea
    static async generateDocuments(
        ideaId: string,
        next: NextFunction
    ): Promise<IDocument[] | void> {
        // Get the idea
        const idea = await this.ideaRepo.getIdeaById(ideaId);
        if (!idea) {
            return next(new AppError(404, "Idea not found"));
        }

        // Check if idea is confirmed
        if (idea.status !== "confirmed") {
            return next(new AppError(400, "Only confirmed ideas can generate documents"));
        }

        // Check if documents already exist
        const existingDocs = await this.documentRepo.getDocumentsByIdeaId(ideaId);
        if (existingDocs.length > 0) {
            return next(new AppError(400, "Documents already exist for this idea. Please edit the existing documents."));
        }

        const ideaText = idea.refinedText || idea.rawText;
        const analysisResult = idea.analysisResult;

        // Generate PRD
        const prdContent = await AiService.generatePRD(ideaText, analysisResult, next);
        if (!prdContent) {
            return; // Error already handled
        }

        // Generate BRD
        const brdContent = await AiService.generateBRD(ideaText, analysisResult, next);
        if (!brdContent) {
            return; // Error already handled
        }

        // Create PRD document
        const prdDoc = await this.documentRepo.createDocument({
            ideaId,
            type: "PRD",
            title: prdContent.title,
            content: prdContent.content,
        });

        // Create BRD document
        const brdDoc = await this.documentRepo.createDocument({
            ideaId,
            type: "BRD",
            title: brdContent.title,
            content: brdContent.content,
        });

        // Create initial versions for both
        await this.documentRepo.createVersion(prdDoc.id, 1, prdContent.content, "Initial generation");
        await this.documentRepo.createVersion(brdDoc.id, 1, brdContent.content, "Initial generation");

        return [prdDoc, brdDoc];
    }

    // Get a single document
    static async getDocument(
        documentId: string,
        next: NextFunction
    ): Promise<IDocument | void> {
        const document = await this.documentRepo.getDocumentById(documentId);
        if (!document) {
            return next(new AppError(404, "Document not found"));
        }
        return document;
    }

    // Get document with versions
    static async getDocumentWithVersions(
        documentId: string,
        next: NextFunction
    ): Promise<IDocumentWithVersions | void> {
        const document = await this.documentRepo.getDocumentWithVersions(documentId);
        if (!document) {
            return next(new AppError(404, "Document not found"));
        }
        return document;
    }

    // Get all documents for an idea
    static async getDocumentsByIdea(
        ideaId: string,
        next: NextFunction
    ): Promise<IDocument[] | void> {
        // Verify idea exists
        const idea = await this.ideaRepo.getIdeaById(ideaId);
        if (!idea) {
            return next(new AppError(404, "Idea not found"));
        }

        return await this.documentRepo.getDocumentsByIdeaId(ideaId);
    }

    // Update a document (creates new version)
    static async updateDocument(
        documentId: string,
        data: IUpdateDocumentWithChangelogData,
        next: NextFunction
    ): Promise<IDocument | void> {
        const document = await this.documentRepo.getDocumentById(documentId);
        if (!document) {
            return next(new AppError(404, "Document not found"));
        }

        // If content is being updated, create a new version
        if (data.content && data.content !== document.content) {
            const latestVersion = await this.documentRepo.getLatestVersionNumber(documentId);
            await this.documentRepo.createVersion(
                documentId,
                latestVersion + 1,
                data.content,
                data.changelog || "Content updated"
            );
        }

        // Update the document
        const updatedDoc = await this.documentRepo.updateDocument(documentId, {
            title: data.title,
            content: data.content,
            status: data.status,
        });

        return updatedDoc;
    }

    // Get version history
    static async getVersionHistory(
        documentId: string,
        next: NextFunction
    ): Promise<IDocumentVersion[] | void> {
        const document = await this.documentRepo.getDocumentById(documentId);
        if (!document) {
            return next(new AppError(404, "Document not found"));
        }

        return await this.documentRepo.getVersionHistory(documentId);
    }

    // Revert to a specific version
    static async revertToVersion(
        documentId: string,
        versionNumber: number,
        next: NextFunction
    ): Promise<IDocument | void> {
        const document = await this.documentRepo.getDocumentById(documentId);
        if (!document) {
            return next(new AppError(404, "Document not found"));
        }

        const version = await this.documentRepo.getVersion(documentId, versionNumber);
        if (!version) {
            return next(new AppError(404, "Version not found"));
        }

        // Create a new version with reverted content
        const latestVersion = await this.documentRepo.getLatestVersionNumber(documentId);
        await this.documentRepo.createVersion(
            documentId,
            latestVersion + 1,
            version.content,
            `Reverted to version ${versionNumber}`
        );

        // Update document with reverted content
        const updatedDoc = await this.documentRepo.updateDocument(documentId, {
            content: version.content,
        });

        return updatedDoc;
    }

    // Regenerate a specific document type
    static async regenerateDocument(
        documentId: string,
        next: NextFunction
    ): Promise<IDocument | void> {
        const document = await this.documentRepo.getDocumentWithVersions(documentId);
        if (!document) {
            return next(new AppError(404, "Document not found"));
        }

        // Get the idea
        const idea = await this.ideaRepo.getIdeaById(document.ideaId);
        if (!idea) {
            return next(new AppError(404, "Associated idea not found"));
        }

        const ideaText = idea.refinedText || idea.rawText;
        const analysisResult = idea.analysisResult;

        // Regenerate based on document type
        let newContent;
        if (document.type === "PRD") {
            newContent = await AiService.generatePRD(ideaText, analysisResult, next);
        } else {
            newContent = await AiService.generateBRD(ideaText, analysisResult, next);
        }

        if (!newContent) {
            return; // Error already handled
        }

        // Create new version
        const latestVersion = await this.documentRepo.getLatestVersionNumber(documentId);
        await this.documentRepo.createVersion(
            documentId,
            latestVersion + 1,
            newContent.content,
            "Regenerated by AI"
        );

        // Update document
        const updatedDoc = await this.documentRepo.updateDocument(documentId, {
            title: newContent.title,
            content: newContent.content,
        });

        return updatedDoc;
    }

    // Export document as specific format (returns content for client-side processing)
    static async exportDocument(
        documentId: string,
        format: "markdown" | "html",
        next: NextFunction
    ): Promise<{ content: string; filename: string; mimeType: string } | void> {
        const document = await this.documentRepo.getDocumentById(documentId);
        if (!document) {
            return next(new AppError(404, "Document not found"));
        }

        const baseFilename = `${document.title.replace(/[^a-zA-Z0-9]/g, "_")}`;

        switch (format) {
            case "markdown":
                const turndownService = new TurndownService();
                const markdown = turndownService.turndown(document.content);
                return {
                    content: `# ${document.title}\n\n${markdown}`,
                    filename: `${baseFilename}.md`,
                    mimeType: "text/markdown",
                };
            case "html":
                return {
                    content: this.convertToHtml(document.title, document.content),
                    filename: `${baseFilename}.html`,
                    mimeType: "text/html",
                };
            default:
                return next(new AppError(400, "Unsupported export format"));
        }
    }

    // Helper to convert content to HTML
    private static convertToHtml(title: string, content: string): string {
        // Content is already HTML from the rich text editor, so we just wrap it
        const html = content;

        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1, h2, h3 { color: #1a1a1a; }
        li { margin: 8px 0; }
    </style>
</head>
<body>
    <h1>${title}</h1>
    ${html}
</body>
</html>`;
    }
}

export default DocumentService;
