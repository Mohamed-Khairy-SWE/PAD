import { NextFunction } from "express";
import config from "../../config/config";
import AppError from "../../utils/app-error";
import { IIdeaAnalysisResult, IGeneratedDocumentContent } from "./types/IAi";
import { buildAnalyzeIdeaPrompt } from "./prompts/analyze-idea.prompt";
import { buildGeneratePRDPrompt } from "./prompts/generate-prd.prompt";
import { buildGenerateBRDPrompt } from "./prompts/generate-brd.prompt";

// Puter.js type (using any for the instance since types aren't fully exposed for init method)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PuterInstance = any;

class AiService {
    private static MAX_RETRIES = 2;
    private static puter: PuterInstance | null = null;

    // Initialize Puter client with auth token
    private static getPuter(): PuterInstance {
        if (!this.puter) {
            if (!config.puter.authToken) {
                // Fallback for non-authenticated usage (might be limited/unavailable)
                console.warn("Puter Auth Token not found. AI features might fail.");
            }

            // Use require to load the Node.js specific init function
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { init } = require("@heyputer/puter.js/src/init.cjs");

            this.puter = init(config.puter.authToken);
        }
        return this.puter;
    }
    private static async callLLM(prompt: string): Promise<string> {
        const puter = this.getPuter();

        const response = await puter.ai.chat(prompt, {
            model: "claude-sonnet-4-5",
        });

        // Debug: log the response structure
        console.log("Puter AI response:", JSON.stringify(response, null, 2));

        // Extract text content from the response
        // Handle various response formats from Puter.js
        let text: string | undefined;

        // Try response.message.content (array or single)
        if (response.message?.content) {
            const content = response.message.content;
            const firstContent = Array.isArray(content) ? content[0] : content;

            if (typeof firstContent === "string") {
                text = firstContent;
            } else if (firstContent && typeof firstContent === "object" && "text" in firstContent) {
                text = firstContent.text as string;
            }
        }

        // Try response.text directly (some Puter responses use this)
        if (!text && (response as unknown as { text?: string }).text) {
            text = (response as unknown as { text?: string }).text;
        }

        // Try response.content directly
        if (!text && (response as unknown as { content?: string }).content) {
            const content = (response as unknown as { content?: string }).content;
            if (typeof content === "string") {
                text = content;
            }
        }

        if (!text) {
            throw new Error("No text content in response");
        }

        return text;
    }

    // Parse and validate the AI response
    private static parseAnalysisResult(
        responseText: string
    ): IIdeaAnalysisResult | null {
        try {
            // Try to extract JSON from the response
            let jsonStr = responseText.trim();

            // Handle cases where the response is wrapped in markdown code blocks
            const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (jsonMatch) {
                jsonStr = jsonMatch[1].trim();
            }

            const parsed = JSON.parse(jsonStr);

            // Validate the structure
            if (
                !Array.isArray(parsed.missingDetails) ||
                !Array.isArray(parsed.complementarySuggestions) ||
                !Array.isArray(parsed.constraintsAndRisks) ||
                !Array.isArray(parsed.clarifyingQuestions)
            ) {
                return null;
            }

            return {
                missingDetails: parsed.missingDetails,
                complementarySuggestions: parsed.complementarySuggestions,
                constraintsAndRisks: parsed.constraintsAndRisks,
                clarifyingQuestions: parsed.clarifyingQuestions,
            };
        } catch (error) {
            console.error("Failed to parse AI response:", error);
            return null;
        }
    }

    // Parse document generation response
    private static parseDocumentResult(
        responseText: string
    ): IGeneratedDocumentContent | null {
        try {
            let jsonStr = responseText.trim();

            // Handle cases where the response is wrapped in markdown code blocks
            const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (jsonMatch) {
                jsonStr = jsonMatch[1].trim();
            }

            const parsed = JSON.parse(jsonStr);

            // Validate the structure
            if (!parsed.title || !parsed.content) {
                return null;
            }

            return {
                title: parsed.title,
                content: parsed.content,
            };
        } catch (error) {
            console.error("Failed to parse document response:", error);
            return null;
        }
    }

    // Analyze a software idea
    static async analyzeIdea(
        ideaText: string,
        next: NextFunction
    ): Promise<IIdeaAnalysisResult | void> {
        const prompt = buildAnalyzeIdeaPrompt(ideaText);

        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
            try {
                const responseText = await this.callLLM(prompt);
                const result = this.parseAnalysisResult(responseText);

                if (result) {
                    return result;
                }

                // If parsing failed but no exception, try again
                if (attempt < this.MAX_RETRIES) {
                    console.log(`Retry ${attempt}: Invalid JSON response, retrying...`);
                    continue;
                }
            } catch (error) {
                lastError = error as Error;
                console.error(`AI call attempt ${attempt} failed:`, error);

                if (attempt < this.MAX_RETRIES) {
                    // Wait a bit before retrying
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    continue;
                }
            }
        }

        // All retries exhausted - return a graceful fallback
        if (lastError) {
            console.error("AI analysis failed after retries:", lastError);
            return next(
                new AppError(503, "AI service temporarily unavailable. Please try again.")
            );
        }

        // Parsing failed after retries - return fallback response
        return {
            missingDetails: [
                "Unable to fully analyze the idea at this time. Please provide more details.",
            ],
            complementarySuggestions: [],
            constraintsAndRisks: [
                "AI analysis encountered an issue. Manual review recommended.",
            ],
            clarifyingQuestions: [
                "Could you provide more context about your target users?",
                "What is the primary problem this software aims to solve?",
            ],
        };
    }

    // Generate PRD document
    static async generatePRD(
        ideaText: string,
        analysisResult: unknown,
        next: NextFunction
    ): Promise<IGeneratedDocumentContent | void> {
        const prompt = buildGeneratePRDPrompt(ideaText, analysisResult);

        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
            try {
                const responseText = await this.callLLM(prompt);
                const result = this.parseDocumentResult(responseText);

                if (result) {
                    return result;
                }

                if (attempt < this.MAX_RETRIES) {
                    console.log(`PRD generation retry ${attempt}: Invalid JSON response`);
                    continue;
                }
            } catch (error) {
                lastError = error as Error;
                console.error(`PRD generation attempt ${attempt} failed:`, error);

                if (attempt < this.MAX_RETRIES) {
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    continue;
                }
            }
        }

        if (lastError) {
            console.error("PRD generation failed after retries:", lastError);
            return next(
                new AppError(503, "AI service temporarily unavailable. Please try again.")
            );
        }

        // Fallback PRD
        return {
            title: "PRD: Product Requirements Document",
            content: `<h2>1. Product Overview</h2>
<p>This document outlines the product requirements based on the provided idea. AI generation encountered an issue, please review and update manually.</p>
<h2>2. Original Idea</h2>
<p>${ideaText}</p>
<h2>3. Functional Requirements</h2>
<p>Please define the core features required for this product.</p>
<h2>4. Non-Functional Requirements</h2>
<p>Please specify performance, security, and scalability requirements.</p>`,
        };
    }

    // Generate BRD document
    static async generateBRD(
        ideaText: string,
        analysisResult: unknown,
        next: NextFunction
    ): Promise<IGeneratedDocumentContent | void> {
        const prompt = buildGenerateBRDPrompt(ideaText, analysisResult);

        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
            try {
                const responseText = await this.callLLM(prompt);
                const result = this.parseDocumentResult(responseText);

                if (result) {
                    return result;
                }

                if (attempt < this.MAX_RETRIES) {
                    console.log(`BRD generation retry ${attempt}: Invalid JSON response`);
                    continue;
                }
            } catch (error) {
                lastError = error as Error;
                console.error(`BRD generation attempt ${attempt} failed:`, error);

                if (attempt < this.MAX_RETRIES) {
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    continue;
                }
            }
        }

        if (lastError) {
            console.error("BRD generation failed after retries:", lastError);
            return next(
                new AppError(503, "AI service temporarily unavailable. Please try again.")
            );
        }

        // Fallback BRD
        return {
            title: "BRD: Business Requirements Document",
            content: `<h2>1. Executive Summary</h2>
<p>This document outlines the business requirements based on the provided idea. AI generation encountered an issue, please review and update manually.</p>
<h2>2. Business Objectives</h2>
<p>Please define the key business goals for this project.</p>
<h2>3. Original Idea</h2>
<p>${ideaText}</p>
<h2>4. Stakeholders</h2>
<p>Please identify key stakeholders and their interests.</p>`,
        };
    }
}

export default AiService;

