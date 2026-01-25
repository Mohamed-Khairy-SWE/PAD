import {
    Idea,
    CreateIdeaInput,
    RefineIdeaInput,
    ApiResponse,
    IdeaResponse,
    IdeasListResponse,
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
