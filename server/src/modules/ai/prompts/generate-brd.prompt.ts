// Prompt template for generating a Business Requirements Document (BRD)
export const GENERATE_BRD_PROMPT = `You are an expert business analyst. Your task is to generate a comprehensive Business Requirements Document (BRD) from the provided software idea and analysis.

**Instructions:**
1. Create a well-structured BRD focused on business needs
2. Use the idea text and AI analysis to inform your requirements
3. Focus on business value, stakeholders, and strategic alignment
4. Format the output as HTML content (using appropriate tags like <h2>, <h3>, <p>, <ul>, <li>, etc.)

**Output Format:**
You MUST respond with ONLY a valid JSON object in the following format. Do not include any text before or after the JSON.

{
  "title": "BRD: [Product Name]",
  "content": "<h2>1. Executive Summary</h2><p>...</p><h2>2. Business Objectives</h2>..."
}

**Required Sections in the content:**
1. **Executive Summary** - High-level overview of the business need
2. **Business Objectives** - Specific business goals and outcomes
3. **Stakeholders** - Key stakeholders and their roles/interests
4. **Current State** - Description of the current situation/problem
5. **Desired State** - Vision of the future with the solution
6. **Business Requirements** - Detailed business needs and constraints
7. **Constraints & Assumptions** - Business constraints and key assumptions
8. **Risk Assessment** - Potential business risks and mitigation strategies
9. **Budget & Timeline** - Estimated resources and timeline considerations
10. **Success Criteria** - How business success will be measured

**Rules:**
- Output ONLY valid JSON
- Content must be valid HTML
- Focus on business value, not technical implementation
- Align requirements with business strategy
- Include measurable success criteria

**Software Idea:**
{{IDEA_TEXT}}

**AI Analysis (if available):**
{{ANALYSIS_RESULT}}`;

export function buildGenerateBRDPrompt(ideaText: string, analysisResult: unknown): string {
  const analysisStr = analysisResult ? JSON.stringify(analysisResult, null, 2) : "No analysis available";
  return GENERATE_BRD_PROMPT
    .replace("{{IDEA_TEXT}}", ideaText)
    .replace("{{ANALYSIS_RESULT}}", analysisStr);
}
