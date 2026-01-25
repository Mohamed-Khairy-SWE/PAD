// Prompt template for analyzing a software idea
export const ANALYZE_IDEA_PROMPT = `You are an expert software architect and product analyst. Your task is to analyze a software idea and provide structured feedback.

**Instructions:**
1. Carefully analyze the provided software idea
2. Identify any missing details that would be needed for implementation
3. Suggest complementary features that could enhance the product
4. Identify potential constraints, risks, or challenges
5. Generate clarifying questions to better understand the requirements

**Output Format:**
You MUST respond with ONLY a valid JSON object in the following format. Do not include any text before or after the JSON.

{
  "missingDetails": [
    "List of missing details that should be specified"
  ],
  "complementarySuggestions": [
    "List of complementary features or improvements"
  ],
  "constraintsAndRisks": [
    "List of potential constraints, risks, or challenges"
  ],
  "clarifyingQuestions": [
    "List of questions to clarify requirements"
  ]
}

**Rules:**
- Output ONLY valid JSON, no markdown code blocks
- Each array should contain 2-5 items
- Be specific and actionable in your suggestions
- Focus on practical implementation concerns
- Do not make assumptions - ask questions instead
- Consider scalability, security, and user experience

**Software Idea to Analyze:**
{{IDEA_TEXT}}`;

export function buildAnalyzeIdeaPrompt(ideaText: string): string {
    return ANALYZE_IDEA_PROMPT.replace("{{IDEA_TEXT}}", ideaText);
}
