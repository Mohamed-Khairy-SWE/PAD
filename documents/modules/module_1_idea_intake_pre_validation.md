## 1. Module Objective

The objective of the Idea Intake & Pre-Validation module is to **allow users (engineers or programmers) to submit software ideas and receive enhanced suggestions and clarifications** before any further processing.

This module ensures that:

- Users can input their software idea in natural language
- PAD analyzes the idea to identify missing details, potential improvements, and extensions
- Users can confirm or refine their idea before moving to document and diagram generation
- A foundation is laid for generating PRD, BRD, features, diagrams, and workflows in subsequent modules

---

## 2. Module Scope Definition

### Included Capabilities

- Idea submission via a chat-like interface
- AI-powered idea analysis and suggestion generation
- Clarifying questions to fill gaps in the idea
- Presentation of complementary suggestions to enhance the idea
- User confirmation of the idea before processing
- Logging of confirmed ideas for further modules

### Excluded Capabilities

- Document generation (PRD, BRD)
- Diagram generation
- Feature breakdown or workflows
- AI IDE execution

---

## 3. User Types Involved

- **Engineer / Programmer (User)**: Submits the software idea and interacts with the AI for suggestions and clarification
- **PAD System (AI)**: Provides analysis, suggestions, and clarifying questions
- **Admin**: Not involved in this module for MVP

---

## 4. Idea Intake Lifecycle Scenarios

### 4.1 Idea Submission

**Scenario**

1. User logs into PAD and navigates to “New Idea”
2. User enters a brief description of their software idea
3. PAD analyzes the input and identifies gaps, potential improvements, and extensions
4. PAD displays suggestions and clarifying questions in a chat interface

**Acceptance Criteria**

- Text input is intuitive and supports multiline descriptions
- AI suggestions appear in real-time or within a few seconds
- Suggestions are categorized: missing details, complementary features, potential constraints

---

### 4.2 User Confirmation

**Scenario**

1. User reviews PAD’s suggestions
2. User can accept, reject, or modify suggestions
3. Once satisfied, user confirms the idea for processing by the next module

**Rules**

- Only confirmed ideas proceed to document and diagram generation
- Unconfirmed ideas can be saved as drafts for later refinement

---

### 4.3 Iterative Refinement (Optional in MVP)

**Scenario**

1. User interacts with PAD chat to refine the idea
2. PAD updates suggestions based on new input
3. User confirms the refined idea

**Acceptance Criteria**

- PAD maintains conversation history for context
- Suggestions dynamically adapt to user modifications

---

## 5. Error & Edge Case Handling

### Covered Scenarios

- Empty idea submission → prompt user to enter text
- Idea too vague → PAD asks clarifying questions
- Idea exceeding character limit → truncate or split input for processing
- Multiple submissions of the same idea → warn user or merge drafts

---

## 6. Module Dependencies

- No prior modules required
- Subsequent modules (Document Generation, Diagrams, Features, Workflow) **depend on confirmed ideas** from this module

---

## 7. Module 1 Exit Criteria (Idea Intake & Pre-Validation)

The module is considered complete when:

- Users can submit a software idea successfully
- PAD provides AI-generated suggestions and clarifying questions
- Users can confirm or refine their idea
- Confirmed ideas are stored and ready for downstream modules
- Basic error handling and edge cases are covered


## 8. Tasks ideas:

Idea Intake & Pre-Validation

Scope: idea input → AI analysis → clarification → confirmation → persistence

🧩 A. Frontend Tasks (React)
A1. Idea Intake UI

Create NewIdeaPage

Add multiline text input

Enforce minimum character count (e.g. 20 chars)

Disable submit on empty input

Add loading state on submission

📌 No AI logic here

A2. Chat-Like Conversation UI

Create IdeaChatPanel

Render:

User messages

AI messages

Support message types:

analysis

clarifying_question

suggestion

Auto-scroll on new messages

Preserve message order

A3. Suggestions Display

Group AI output into sections:

Missing Details

Complementary Suggestions

Constraints / Risks

Allow user to:

Accept suggestion

Reject suggestion

Edit suggestion text

A4. Idea Confirmation UI

Add Confirm Idea button

Disable confirmation until:

AI analysis exists

Show confirmation success state

Route user to next module placeholder

A5. Draft Handling

Add “Save as Draft” action

Allow loading existing drafts

Visual indicator: Draft vs Confirmed

A6. Error States

Empty input warning

AI timeout message

Validation error display

🧩 B. Backend Tasks (Node + Express)
B1. Idea API Routes

Create routes:

POST   /api/ideas
GET    /api/ideas/:id
POST   /api/ideas/:id/confirm
POST   /api/ideas/:id/refine

B2. Idea Persistence

Create ideas table:

id

raw_text

refined_text

status (draft | confirmed)

created_at

Save raw idea immediately

Never overwrite raw input

B3. Validation Layer

Reject empty or too-short ideas

Enforce max character limit

Normalize whitespace

B4. AI Analysis Endpoint
POST /api/ai/analyze-idea


Responsibilities:

Accept idea text

Call AI orchestrator

Validate AI output

Return structured response

B5. Confirmation Logic

Confirmed ideas become read-only

Prevent confirmation without AI analysis

Mark confirmed timestamp

B6. Duplicate Detection (Basic)

Hash idea text

Warn if similar hash exists

Allow override

🧩 C. AI Orchestrator Tasks (MOST IMPORTANT)
C1. Task Definition: Analyze Idea

Create file:

packages/ai-orchestrator/tasks/analyze-idea.ts


Responsibilities:

Receive idea text

Build prompt

Call LLM gateway

Validate output

Return structured result

C2. Prompt Contract

Create:

packages/prompts/idea/analyze-idea.md


Rules inside prompt:

JSON output only

No assumptions

Ask questions when unclear

Categorize results

C3. Output Schema

Create:

IdeaAnalysisSchema = {
  missingDetails: string[]
  complementarySuggestions: string[]
  constraintsAndRisks: string[]
  clarifyingQuestions: string[]
}


📌 If validation fails → retry once → fail gracefully

C4. LLM Gateway

Single provider-agnostic function

No business logic

No retries beyond max = 2

No streaming (MVP)

C5. Context Handling (Optional MVP+)

Pass conversation history

Limit history size

Never mutate past messages

🧩 D. Cross-Cutting Tasks
D1. Logging

Log:

Idea submissions

AI calls (metadata only)

Confirmation events

No raw prompt storage

D2. Version Safety

Never mutate:

Raw idea

Initial AI output

All refinements are additive

D3. Error Recovery

AI failure → return partial response

Timeout → retry option

Schema violation → fallback message



don't forget to wire everything together