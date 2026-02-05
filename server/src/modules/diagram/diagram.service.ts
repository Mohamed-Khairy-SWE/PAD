import { NextFunction } from "express";
import AppError from "../../utils/app-error";
import DiagramRepository from "./diagram.repository";
import IdeaRepository from "../idea/idea.repository";
import AiService from "../ai/ai.service";
import {
    IDiagram,
    IUpdateDiagramData,
    DiagramType,
} from "./types/IDiagram";

class DiagramService {
    private static diagramRepository: DiagramRepository = DiagramRepository.getInstance();
    private static ideaRepository: IdeaRepository = IdeaRepository.getInstance();

    // Generate all diagrams for an idea
    static async generateDiagrams(
        ideaId: string,
        next: NextFunction
    ): Promise<IDiagram[] | void> {
        // Get the idea
        const idea = await this.ideaRepository.getIdeaById(ideaId);
        if (!idea) {
            return next(new AppError(404, "Idea not found"));
        }

        // Require confirmed status
        if (idea.status !== "confirmed") {
            return next(new AppError(400, "Cannot generate diagrams for unconfirmed idea"));
        }

        // Get PRD/BRD content for context
        const ideaText = idea.refinedText || idea.rawText;

        // Generate each diagram type
        const diagramTypes: DiagramType[] = ["ERD", "SEQUENCE", "SCHEMA"];
        const diagrams: IDiagram[] = [];

        for (const type of diagramTypes) {
            const generated = await AiService.generateDiagram(type, ideaText, next);
            if (!generated) {
                continue; // Skip if generation failed
            }

            const diagram = await this.diagramRepository.createDiagram({
                ideaId,
                type,
                title: generated.title,
                mermaidCode: generated.mermaidCode,
            });

            diagrams.push(diagram as IDiagram);
        }

        return diagrams;
    }

    // Get diagram by ID
    static async getDiagram(
        diagramId: string,
        next: NextFunction
    ): Promise<IDiagram | void> {
        const diagram = await this.diagramRepository.getDiagramById(diagramId);
        if (!diagram) {
            return next(new AppError(404, "Diagram not found"));
        }
        return diagram as IDiagram;
    }

    // Get all diagrams for an idea
    static async getDiagramsByIdea(ideaId: string): Promise<IDiagram[]> {
        const diagrams = await this.diagramRepository.getDiagramsByIdeaId(ideaId);
        return diagrams as IDiagram[];
    }

    // Update a diagram (with version history)
    static async updateDiagram(
        diagramId: string,
        data: IUpdateDiagramData,
        next: NextFunction
    ): Promise<IDiagram | void> {
        const existing = await this.diagramRepository.getDiagramById(diagramId);
        if (!existing) {
            return next(new AppError(404, "Diagram not found"));
        }

        // If mermaid code is changing, create a version snapshot first
        if (data.mermaidCode && data.mermaidCode !== existing.mermaidCode) {
            await this.diagramRepository.createVersion(
                diagramId,
                existing.mermaidCode,
                data.changelog || "Previous version"
            );
        }

        // Update the diagram
        const updated = await this.diagramRepository.updateDiagram(diagramId, {
            title: data.title,
            mermaidCode: data.mermaidCode,
            status: data.status,
        });

        return updated as IDiagram;
    }

    // Get diagram with version history
    static async getDiagramWithVersions(
        diagramId: string,
        next: NextFunction
    ) {
        const diagram = await this.diagramRepository.getDiagramWithVersions(diagramId);
        if (!diagram) {
            return next(new AppError(404, "Diagram not found"));
        }
        return diagram;
    }

    // Get versions for a diagram
    static async getDiagramVersions(diagramId: string) {
        return await this.diagramRepository.getVersionsByDiagramId(diagramId);
    }

    // Regenerate a specific diagram
    static async regenerateDiagram(
        diagramId: string,
        next: NextFunction
    ): Promise<IDiagram | void> {
        const existing = await this.diagramRepository.getDiagramWithVersions(diagramId);
        if (!existing) {
            return next(new AppError(404, "Diagram not found"));
        }

        // Get the idea for context
        const idea = await this.ideaRepository.getIdeaById(existing.ideaId);
        if (!idea) {
            return next(new AppError(404, "Associated idea not found"));
        }

        // Save current version
        await this.diagramRepository.createVersion(
            diagramId,
            existing.mermaidCode,
            "Before regeneration"
        );

        // Regenerate
        const ideaText = idea.refinedText || idea.rawText;
        const generated = await AiService.generateDiagram(
            existing.type as DiagramType,
            ideaText,
            next
        );

        if (!generated) {
            return; // Error handled by AI service
        }

        // Update with new content
        const updated = await this.diagramRepository.updateDiagram(diagramId, {
            title: generated.title,
            mermaidCode: generated.mermaidCode,
        });

        return updated as IDiagram;
    }
}

export default DiagramService;
