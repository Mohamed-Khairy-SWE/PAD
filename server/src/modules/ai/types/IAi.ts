// AI Analysis result schema for idea intake
export interface IIdeaAnalysisResult {
    missingDetails: string[];
    complementarySuggestions: string[];
    constraintsAndRisks: string[];
    clarifyingQuestions: string[];
}

// Input for AI analysis
export interface IAnalyzeIdeaInput {
    ideaText: string;
    conversationHistory?: IConversationMessage[];
}

// Conversation message for context
export interface IConversationMessage {
    role: "user" | "assistant";
    content: string;
}

// Response from LLM gateway
export interface ILLMResponse {
    content: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}
