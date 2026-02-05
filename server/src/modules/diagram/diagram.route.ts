import { Router } from "express";
import {
    generateDiagrams,
    getDiagramsByIdea,
    getDiagram,
    getDiagramWithVersions,
    updateDiagram,
    getDiagramVersions,
    regenerateDiagram,
} from "./diagram.controller";

const DiagramRouter: Router = Router();

// Generate diagrams for an idea
DiagramRouter.post("/generate/:ideaId", generateDiagrams);

// Get all diagrams for an idea
DiagramRouter.get("/idea/:ideaId", getDiagramsByIdea);

// Get a single diagram
DiagramRouter.get("/:id", getDiagram);

// Get diagram with version history
DiagramRouter.get("/:id/full", getDiagramWithVersions);

// Update a diagram
DiagramRouter.put("/:id", updateDiagram);

// Get version history for a diagram
DiagramRouter.get("/:id/versions", getDiagramVersions);

// Regenerate a diagram
DiagramRouter.post("/:id/regenerate", regenerateDiagram);

export default DiagramRouter;
