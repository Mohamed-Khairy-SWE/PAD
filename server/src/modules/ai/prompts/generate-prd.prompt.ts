// Prompt template for generating a Product Requirements Document (PRD)
export const GENERATE_PRD_PROMPT = `You are an expert software product manager. Your task is to generate a comprehensive Product Requirements Document (PRD) from the provided software idea and analysis.

**Instructions:**
1. Create a well-structured PRD with clear sections
2. Use the idea text and AI analysis to inform your requirements
3. Be specific and actionable in your requirements
4. Include acceptance criteria for each feature
5. Format the output as HTML content (using appropriate tags like <h2>, <h3>, <p>, <ul>, <li>, etc.)

**Output Format:**
You MUST respond with ONLY a valid JSON object in the following format. Do not include any text before or after the JSON.

{
  "title": "PRD: [Product Name]",
  "content": "<h2>1. Product Overview</h2><p>...</p><h2>2. Objectives</h2>..."
}

**Required Sections in the content:**
1. **Product Overview** - Brief description of the product and its purpose
2. **Objectives** - Key goals the product aims to achieve
3. **Target Users** - Who will use this product
4. **Functional Requirements** - Core features with descriptions and acceptance criteria
5. **Non-Functional Requirements** - Performance, security, scalability requirements
6. **User Stories** - Key user stories in "As a [user], I want [goal], so that [benefit]" format
7. **Assumptions & Dependencies** - Key assumptions and external dependencies
8. **Success Metrics** - How to measure product success

**Rules:**
- Output ONLY valid JSON
- Content must be valid HTML
- Be comprehensive but concise
- Focus on what the product should do, not how to build it
- Make requirements measurable where possible

**Software Idea:**
{{IDEA_TEXT}}

**AI Analysis (if available):**
{{ANALYSIS_RESULT}}`;

export function buildGeneratePRDPrompt(ideaText: string, analysisResult: unknown): string {
    const analysisStr = analysisResult ? JSON.stringify(analysisResult, null, 2) : "No analysis available";
    return GENERATE_PRD_PROMPT
        .replace("{{IDEA_TEXT}}", ideaText)
        .replace("{{ANALYSIS_RESULT}}", analysisStr);
}
