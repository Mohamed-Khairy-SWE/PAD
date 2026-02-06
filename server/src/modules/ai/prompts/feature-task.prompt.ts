// Prompt for extracting features from PRD/BRD documents
export const EXTRACT_FEATURES_PROMPT = `You are an expert software architect and project planner. Your task is to analyze software requirements documents (PRD/BRD) and extract the main features that need to be implemented.

**Instructions:**
1. Carefully analyze the provided documents
2. Identify distinct, implementable features
3. Each feature should represent a logical grouping of functionality
4. Provide a clear title and detailed description for each feature
5. Focus on extracting USER-FACING features and core system capabilities

**Output Format:**
You MUST respond with ONLY a valid JSON array in the following format.  Do not include any text before or after the JSON.

[
  {
    "title": "Feature Title",
    "description": "Detailed description of what this feature should do, including key functionality and user interactions"
  }
]

**Rules:**
- Output ONLY valid  JSON array, no markdown code blocks
- Extract 3-8 features depending on project complexity
- Each feature should be distinct and not overlap with others
- Descriptions should be comprehensive but concise  (2-4 sentences)
- Focus on features that can be developed independently

**Requirements Documents:**
{{DOCUMENTS_CONTENT}}`;

export function buildExtractFeaturesPrompt(documentsContent: string): string {
    return EXTRACT_FEATURES_PROMPT.replace("{{DOCUMENTS_CONTENT}}", documentsContent);
}

// Prompt for generating tasks for a feature
export const GENERATE_TASKS_PROMPT = `You are an expert software engineer and project manager. Your task is to break down a software feature into specific, actionable development tasks.

**Instructions:**
1. Analyze the provided feature description
2. Break it down into granular, implementable tasks
3. Each task should be completable by a single developer
4. Consider frontend, backend, database, and testing aspects
5. Order tasks logically based on dependencies

**Output Format:**
You MUST respond with ONLY a valid JSON array in the following format. Do not include any text before or after the JSON.

[
  {
    "title": "Task Title",
    "description": "Detailed description of what needs to be implemented",
    "priority": "low|medium|high|critical",
    "estimatedEffort": "2h|4h|1d|2d|1w"
  }
]

**Rules:**
- Output ONLY valid JSON array, no markdown code blocks
- Generate 4-10 tasks per feature  
- Each task should be specific and actionable
- Include tasks for database schema, API endpoints, business logic,and UI components
- Priority should reflect importance and blocking nature
- Estimated effort should be realistic for one developer

**Feature to Break Down:**
Title: {{FEATURE_TITLE}}

Description: {{FEATURE_DESCRIPTION}}`;

export function buildGenerateTasksPrompt(featureTitle: string, featureDescription: string): string {
    return GENERATE_TASKS_PROMPT
        .replace("{{FEATURE_TITLE}}", featureTitle)
        .replace("{{FEATURE_DESCRIPTION}}", featureDescription);
}
