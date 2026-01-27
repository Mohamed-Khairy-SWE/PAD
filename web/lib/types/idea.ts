// Idea status type
export type IdeaStatus = "draft" | "confirmed";

// AI Analysis result schema
export interface IIdeaAnalysisResult {
    missingDetails: string[];
    complementarySuggestions: string[];
    constraintsAndRisks: string[];
    clarifyingQuestions: string[];
}

// Base idea entity interface
export interface Idea {
    id: string;
    rawText: string;
    refinedText: string | null;
    status: IdeaStatus;
    analysisResult: IIdeaAnalysisResult | null;
    createdAt: string;
    updatedAt: string;
}

// Input for creating a new idea
export interface CreateIdeaInput {
    rawText: string;
}

// Input for refining an idea
export interface RefineIdeaInput {
    refinedText: string;
}

// API Response types
export interface ApiResponse<T> {
    status: "success" | "fail" | "error";
    message?: string;
    data?: T;
}

export interface IdeaResponse {
    idea: Idea;
}

export interface IdeasListResponse {
    ideas: Idea[];
    count: number;
}

// ============================================
// Document Types (Module 2)
// ============================================

export type DocumentType = "PRD" | "BRD";
export type DocumentStatus = "draft" | "published";

export interface Document {
    id: string;
    ideaId: string;
    type: DocumentType;
    title: string;
    content: string;
    status: DocumentStatus;
    createdAt: string;
    updatedAt: string;
}

export interface DocumentVersion {
    id: string;
    documentId: string;
    version: number;
    content: string;
    changelog: string | null;
    createdAt: string;
}

export interface DocumentWithVersions extends Document {
    versions: DocumentVersion[];
}

export interface UpdateDocumentInput {
    title?: string;
    content?: string;
    status?: DocumentStatus;
    changelog?: string;
}

export interface DocumentResponse {
    document: Document;
}

export interface DocumentsListResponse {
    documents: Document[];
    count: number;
}

export interface DocumentVersionsResponse {
    versions: DocumentVersion[];
    count: number;
}

export type ExportFormat = "markdown" | "html";
