import {
    Idea,
    CreateIdeaInput,
    RefineIdeaInput,
    ApiResponse,
    IdeaResponse,
    IdeasListResponse,
    Document,
    DocumentWithVersions,
    DocumentVersion,
    UpdateDocumentInput,
    DocumentResponse,
    DocumentsListResponse,
    DocumentVersionsResponse,
    ExportFormat,
    Diagram,
    DiagramWithVersions,
    DiagramVersion,
    UpdateDiagramInput,
    DiagramResponse,
    DiagramsListResponse,
    DiagramVersionsResponse,
} from "./types/idea";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

// Helper to make authenticated requests
async function fetchWithAuth<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        credentials: "include", // Include cookies for JWT auth
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "An error occurred");
    }

    return data;
}

// Idea API functions
export const ideaApi = {
    // Create a new idea
    async create(input: CreateIdeaInput): Promise<Idea> {
        const response = await fetchWithAuth<IdeaResponse>("/ideas", {
            method: "POST",
            body: JSON.stringify(input),
        });
        return response.data!.idea;
    },

    // Get a specific idea by ID
    async getById(id: string): Promise<Idea> {
        const response = await fetchWithAuth<IdeaResponse>(`/ideas/${id}`);
        return response.data!.idea;
    },

    // List all ideas for the current user
    async list(): Promise<Idea[]> {
        const response = await fetchWithAuth<IdeasListResponse>("/ideas");
        return response.data!.ideas;
    },

    // Analyze an idea with AI
    async analyze(id: string): Promise<Idea> {
        const response = await fetchWithAuth<IdeaResponse>(`/ideas/${id}/analyze`, {
            method: "POST",
        });
        return response.data!.idea;
    },

    // Refine an idea
    async refine(id: string, input: RefineIdeaInput): Promise<Idea> {
        const response = await fetchWithAuth<IdeaResponse>(`/ideas/${id}/refine`, {
            method: "POST",
            body: JSON.stringify(input),
        });
        return response.data!.idea;
    },

    // Confirm an idea
    async confirm(id: string): Promise<Idea> {
        const response = await fetchWithAuth<IdeaResponse>(`/ideas/${id}/confirm`, {
            method: "POST",
        });
        return response.data!.idea;
    },
};

// Document API functions
export const documentApi = {
    // Generate PRD & BRD for an idea
    async generate(ideaId: string): Promise<Document[]> {
        const response = await fetchWithAuth<DocumentsListResponse>(`/documents/generate/${ideaId}`, {
            method: "POST",
        });
        return response.data!.documents;
    },

    // Get a document by ID
    async getById(id: string): Promise<Document> {
        const response = await fetchWithAuth<DocumentResponse>(`/documents/${id}`);
        return response.data!.document;
    },

    // Get document with versions
    async getWithVersions(id: string): Promise<DocumentWithVersions> {
        const response = await fetchWithAuth<{ document: DocumentWithVersions }>(`/documents/${id}/full`);
        return response.data!.document;
    },

    // Get all documents for an idea
    async getByIdeaId(ideaId: string): Promise<Document[]> {
        const response = await fetchWithAuth<DocumentsListResponse>(`/documents/idea/${ideaId}`);
        return response.data!.documents;
    },

    // Update a document
    async update(id: string, data: UpdateDocumentInput): Promise<Document> {
        const response = await fetchWithAuth<DocumentResponse>(`/documents/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
        return response.data!.document;
    },

    // Get version history
    async getVersions(id: string): Promise<DocumentVersion[]> {
        const response = await fetchWithAuth<DocumentVersionsResponse>(`/documents/${id}/versions`);
        return response.data!.versions;
    },

    // Revert to a specific version
    async revertToVersion(id: string, version: number): Promise<Document> {
        const response = await fetchWithAuth<DocumentResponse>(`/documents/${id}/revert/${version}`, {
            method: "POST",
        });
        return response.data!.document;
    },

    // Regenerate a document
    async regenerate(id: string): Promise<Document> {
        const response = await fetchWithAuth<DocumentResponse>(`/documents/${id}/regenerate`, {
            method: "POST",
        });
        return response.data!.document;
    },

    // Export document
    async export(id: string, format: ExportFormat): Promise<Blob> {
        const response = await fetch(`${API_BASE_URL}/documents/${id}/export/${format}`, {
            credentials: "include",
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Export failed");
        }
        return response.blob();
    },
};

// Diagram API functions
export const diagramApi = {
    // Generate diagrams for an idea
    async generate(ideaId: string): Promise<Diagram[]> {
        const response = await fetchWithAuth<DiagramsListResponse>(`/diagrams/generate/${ideaId}`, {
            method: "POST",
        });
        return response.data!.diagrams;
    },

    // Get all diagrams for an idea
    async getByIdeaId(ideaId: string): Promise<Diagram[]> {
        const response = await fetchWithAuth<DiagramsListResponse>(`/diagrams/idea/${ideaId}`);
        return response.data!.diagrams;
    },

    // Get a single diagram
    async getById(id: string): Promise<Diagram> {
        const response = await fetchWithAuth<DiagramResponse>(`/diagrams/${id}`);
        return response.data!.diagram;
    },

    // Get diagram with versions
    async getWithVersions(id: string): Promise<DiagramWithVersions> {
        const response = await fetchWithAuth<{ diagram: DiagramWithVersions }>(`/diagrams/${id}/full`);
        return response.data!.diagram;
    },

    // Update a diagram
    async update(id: string, data: UpdateDiagramInput): Promise<Diagram> {
        const response = await fetchWithAuth<DiagramResponse>(`/diagrams/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
        return response.data!.diagram;
    },

    // Get version history
    async getVersions(id: string): Promise<DiagramVersion[]> {
        const response = await fetchWithAuth<DiagramVersionsResponse>(`/diagrams/${id}/versions`);
        return response.data!.versions;
    },

    // Regenerate a diagram
    async regenerate(id: string): Promise<Diagram> {
        const response = await fetchWithAuth<DiagramResponse>(`/diagrams/${id}/regenerate`, {
            method: "POST",
        });
        return response.data!.diagram;
    },
};
