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

// Prompt for re-analyzing with user answers
export const REANALYZE_WITH_ANSWERS_PROMPT = `You are an expert software architect and product analyst. Your task is to re-analyze a software idea using additional context provided by the user's answers to clarifying questions.

**Instructions:**
1. Review the original software idea
2. Consider the user's answers to previous clarifying questions
3. Provide an updated analysis with the new context
4. Identify any remaining gaps or new considerations

**Output Format:**
You MUST respond with ONLY a valid JSON object in the following format. Do not include any text before or after the JSON.

{
  "missingDetails": [
    "List of remaining missing details (fewer now that user provided answers)"
  ],
  "complementarySuggestions": [
    "Updated list of complementary features considering user's clarifications"
  ],
  "constraintsAndRisks": [
    "Updated constraints and risks based on the new information"
  ],
  "clarifyingQuestions": [
    "Any remaining questions, or new questions based on the answers (can be empty if clear enough)"
  ]
}

**Rules:**
- Output ONLY valid JSON, no markdown code blocks
- Each array can contain 0-5 items (reduce items as clarity improves)
- Reference the user's answers in your analysis
- Be specific and actionable
- If the user has provided sufficient clarity, you may have fewer questions

**Original Software Idea:**
{{IDEA_TEXT}}

**User's Answers to Clarifying Questions:**
{{ANSWERS}}`;

export interface IQuestionAnswerInput {
  question: string;
  answer: string;
}

export function buildReanalyzeWithAnswersPrompt(
  ideaText: string,
  answers: IQuestionAnswerInput[]
): string {
  const formattedAnswers = answers
    .map((qa, i) => `Q${i + 1}: ${qa.question}\nA${i + 1}: ${qa.answer}`)
    .join("\n\n");

  return REANALYZE_WITH_ANSWERS_PROMPT
    .replace("{{IDEA_TEXT}}", ideaText)
    .replace("{{ANSWERS}}", formattedAnswers);
}
