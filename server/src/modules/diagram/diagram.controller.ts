import { Request, Response, NextFunction } from "express";
import DiagramService from "./diagram.service";
import { IUpdateDiagramData } from "./types/IDiagram";

// Generate diagrams for an idea
export const generateDiagrams = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { ideaId } = req.params;

    const diagrams = await DiagramService.generateDiagrams(ideaId, next);
    if (!diagrams) return;

    res.status(201).json({
        status: "success",
        data: {
            diagrams,
            count: diagrams.length,
        },
    });
};

// Get all diagrams for an idea
export const getDiagramsByIdea = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { ideaId } = req.params;

    const diagrams = await DiagramService.getDiagramsByIdea(ideaId);

    res.status(200).json({
        status: "success",
        data: {
            diagrams,
            count: diagrams.length,
        },
    });
};

// Get a single diagram
export const getDiagram = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.params;

    const diagram = await DiagramService.getDiagram(id, next);
    if (!diagram) return;

    res.status(200).json({
        status: "success",
        data: { diagram },
    });
};

// Get diagram with versions
export const getDiagramWithVersions = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.params;

    const diagram = await DiagramService.getDiagramWithVersions(id, next);
    if (!diagram) return;

    res.status(200).json({
        status: "success",
        data: { diagram },
    });
};

// Update a diagram
export const updateDiagram = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.params;
    const data: IUpdateDiagramData = req.body;

    const diagram = await DiagramService.updateDiagram(id, data, next);
    if (!diagram) return;

    res.status(200).json({
        status: "success",
        data: { diagram },
    });
};

// Get version history
export const getDiagramVersions = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.params;

    const versions = await DiagramService.getDiagramVersions(id);

    res.status(200).json({
        status: "success",
        data: {
            versions,
            count: versions.length,
        },
    });
};

// Regenerate a diagram
export const regenerateDiagram = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.params;

    const diagram = await DiagramService.regenerateDiagram(id, next);
    if (!diagram) return;

    res.status(200).json({
        status: "success",
        data: { diagram },
    });
};
