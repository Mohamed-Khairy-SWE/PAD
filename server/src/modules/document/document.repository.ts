import { PrismaClient } from "@prisma/client";
import AppError from "../../utils/app-error";
import {
    IDocument,
    IDocumentVersion,
    ICreateDocumentData,
    IUpdateDocumentData,
    IDocumentWithVersions,
} from "./types/IDocument";

class DocumentRepository {
    private static instance: DocumentRepository;
    private prisma: PrismaClient;

    private constructor() {
        this.prisma = new PrismaClient();
    }

    static getInstance(): DocumentRepository {
        if (!DocumentRepository.instance) {
            DocumentRepository.instance = new DocumentRepository();
        }
        return DocumentRepository.instance;
    }

    // Create a new document
    async createDocument(data: ICreateDocumentData): Promise<IDocument> {
        try {
            const document = await this.prisma.document.create({
                data: {
                    ideaId: data.ideaId,
                    type: data.type,
                    title: data.title,
                    content: data.content,
                },
            });
            return document as IDocument;
        } catch (error) {
            throw new AppError(500, "Failed to create document");
        }
    }

    // Get document by ID
    async getDocumentById(id: string): Promise<IDocument | null> {
        try {
            const document = await this.prisma.document.findUnique({
                where: { id },
            });
            return document as IDocument | null;
        } catch (error) {
            throw new AppError(500, "Failed to fetch document");
        }
    }

    // Get document by ID with versions
    async getDocumentWithVersions(id: string): Promise<IDocumentWithVersions | null> {
        try {
            const document = await this.prisma.document.findUnique({
                where: { id },
                include: {
                    versions: {
                        orderBy: { version: "desc" },
                    },
                },
            });
            return document as IDocumentWithVersions | null;
        } catch (error) {
            throw new AppError(500, "Failed to fetch document with versions");
        }
    }

    // Get all documents for an idea
    async getDocumentsByIdeaId(ideaId: string): Promise<IDocument[]> {
        try {
            const documents = await this.prisma.document.findMany({
                where: { ideaId },
                orderBy: { createdAt: "desc" },
            });
            return documents as IDocument[];
        } catch (error) {
            throw new AppError(500, "Failed to fetch documents for idea");
        }
    }

    // Update document
    async updateDocument(id: string, data: IUpdateDocumentData): Promise<IDocument> {
        try {
            const document = await this.prisma.document.update({
                where: { id },
                data: {
                    title: data.title,
                    content: data.content,
                    status: data.status,
                },
            });
            return document as IDocument;
        } catch (error) {
            throw new AppError(500, "Failed to update document");
        }
    }

    // Create a document version
    async createVersion(
        documentId: string,
        version: number,
        content: string,
        changelog?: string
    ): Promise<IDocumentVersion> {
        try {
            const documentVersion = await this.prisma.documentVersion.create({
                data: {
                    documentId,
                    version,
                    content,
                    changelog,
                },
            });
            return documentVersion as IDocumentVersion;
        } catch (error) {
            throw new AppError(500, "Failed to create document version");
        }
    }

    // Get version history for a document
    async getVersionHistory(documentId: string): Promise<IDocumentVersion[]> {
        try {
            const versions = await this.prisma.documentVersion.findMany({
                where: { documentId },
                orderBy: { version: "desc" },
            });
            return versions as IDocumentVersion[];
        } catch (error) {
            throw new AppError(500, "Failed to fetch version history");
        }
    }

    // Get a specific version
    async getVersion(documentId: string, version: number): Promise<IDocumentVersion | null> {
        try {
            const docVersion = await this.prisma.documentVersion.findUnique({
                where: {
                    documentId_version: {
                        documentId,
                        version,
                    },
                },
            });
            return docVersion as IDocumentVersion | null;
        } catch (error) {
            throw new AppError(500, "Failed to fetch document version");
        }
    }

    // Get the latest version number for a document
    async getLatestVersionNumber(documentId: string): Promise<number> {
        try {
            const latestVersion = await this.prisma.documentVersion.findFirst({
                where: { documentId },
                orderBy: { version: "desc" },
                select: { version: true },
            });
            return latestVersion?.version || 0;
        } catch (error) {
            throw new AppError(500, "Failed to get latest version number");
        }
    }

    // Delete a document
    async deleteDocument(id: string): Promise<void> {
        try {
            await this.prisma.document.delete({
                where: { id },
            });
        } catch (error) {
            throw new AppError(500, "Failed to delete document");
        }
    }
}

export default DocumentRepository;
