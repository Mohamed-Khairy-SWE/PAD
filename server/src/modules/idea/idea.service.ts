import { NextFunction } from "express";
import AppError from "../../utils/app-error";
import IdeaRepository from "./idea.repository";
import AiService from "../ai/ai.service";
import {
    ICreateIdeaData,
    IUpdateIdeaData,
    IIdea,
    IIdeaResponse,
} from "./types/IIdea";

class IdeaService {
    private static ideaRepository: IdeaRepository = IdeaRepository.getInstance();

    // Minimum and maximum character limits for idea text
    private static MIN_CHAR_LIMIT = 20;
    private static MAX_CHAR_LIMIT = 10000;

    // Create a new idea
    static async createIdea(
        data: ICreateIdeaData,
        next: NextFunction
    ): Promise<IIdea | void> {
        // Validate idea text
        const validationError = this.validateIdeaText(data.rawText);
        if (validationError) {
            return next(new AppError(400, validationError));
        }

        // Normalize whitespace
        const normalizedText = this.normalizeText(data.rawText);

        // Create the idea
        const idea = await this.ideaRepository.createIdea({
            rawText: normalizedText,
        });

        return idea as IIdea;
    }

    // Get idea by ID
    static async getIdea(
        ideaId: string,
        next: NextFunction
    ): Promise<IIdea | void> {
        const idea = await this.ideaRepository.getIdeaById(ideaId);
        if (!idea) {
            return next(new AppError(404, "Idea not found"));
        }

        return idea as IIdea;
    }

    // List all ideas
    static async listIdeas(): Promise<IIdeaResponse[]> {
        const ideas = await this.ideaRepository.getAllIdeas();
        return ideas as IIdeaResponse[];
    }

    // Analyze idea with AI
    static async analyzeIdea(
        ideaId: string,
        next: NextFunction
    ): Promise<IIdea | void> {
        const idea = await this.ideaRepository.getIdeaById(ideaId);
        if (!idea) {
            return next(new AppError(404, "Idea not found"));
        }

        // Call AI service to analyze the idea
        const analysisResult = await AiService.analyzeIdea(
            idea.refinedText || idea.rawText,
            next
        );

        if (!analysisResult) {
            return; // Error already handled by AI service
        }

        // Update the idea with analysis result
        const updatedIdea = await this.ideaRepository.updateIdea(ideaId, {
            analysisResult,
        });

        return updatedIdea as IIdea;
    }

    // Refine an idea with new text
    static async refineIdea(
        ideaId: string,
        data: IUpdateIdeaData,
        next: NextFunction
    ): Promise<IIdea | void> {
        const idea = await this.ideaRepository.getIdeaById(ideaId);
        if (!idea) {
            return next(new AppError(404, "Idea not found"));
        }

        // Check if idea is already confirmed
        if (idea.status === "confirmed") {
            return next(new AppError(400, "Cannot refine a confirmed idea"));
        }

        // Validate refined text if provided
        if (data.refinedText) {
            const validationError = this.validateIdeaText(data.refinedText);
            if (validationError) {
                return next(new AppError(400, validationError));
            }
        }

        // Update the idea
        const updatedIdea = await this.ideaRepository.updateIdea(ideaId, {
            refinedText: data.refinedText
                ? this.normalizeText(data.refinedText)
                : undefined,
        });

        return updatedIdea as IIdea;
    }

    // Confirm an idea
    static async confirmIdea(
        ideaId: string,
        next: NextFunction
    ): Promise<IIdea | void> {
        const idea = await this.ideaRepository.getIdeaById(ideaId);
        if (!idea) {
            return next(new AppError(404, "Idea not found"));
        }

        // Check if idea is already confirmed
        if (idea.status === "confirmed") {
            return next(new AppError(400, "Idea is already confirmed"));
        }

        // Require AI analysis before confirmation
        if (!idea.analysisResult) {
            return next(
                new AppError(400, "AI analysis is required before confirmation")
            );
        }

        // Confirm the idea
        const confirmedIdea = await this.ideaRepository.confirmIdea(ideaId);

        return confirmedIdea as IIdea;
    }

    // Helper: Validate idea text
    private static validateIdeaText(text: string): string | null {
        if (!text || text.trim().length === 0) {
            return "Idea text is required";
        }

        if (text.trim().length < this.MIN_CHAR_LIMIT) {
            return `Idea must be at least ${this.MIN_CHAR_LIMIT} characters`;
        }

        if (text.length > this.MAX_CHAR_LIMIT) {
            return `Idea must not exceed ${this.MAX_CHAR_LIMIT} characters`;
        }

        return null;
    }

    // Helper: Normalize whitespace
    private static normalizeText(text: string): string {
        return text.trim().replace(/\s+/g, " ");
    }
}

export default IdeaService;
