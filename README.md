# PAD - Product Architecture Designer

**PAD** is an AI-powered platform that transforms software ideas into comprehensive Software Development Life Cycle (SDLC) artifacts. PAD helps engineers and programmers accelerate their development workflow by automatically generating requirements documents, architecture diagrams, task breakdowns, and implementation workflows.

## What is PAD?

Given a business idea or client brief, PAD automatically produces a full SDLC artifact set:

- **Requirements Documents** (PRD & BRD)
- **Architecture Diagrams** in MermaidJS (ERD, Sequence, Schema)
- **Feature Breakdowns** with task management
- **Implementation Workflows** for AI IDE integration
- **Live-Editable Diagram Viewer** with real-time preview

## Platform Modules

PAD is organized into 6 core modules:

| Module | Description |
|--------|-------------|
| **[Module 1: Idea Intake & Pre-Validation](./documents/modules/module_1_idea_intake_pre_validation.md)** | Submit software ideas and receive AI-powered suggestions and clarifications |
| **[Module 2: Document Generation (PRD & BRD)](./documents/modules/module_2_document_generation_prd_brd.md)** | Auto-generate Product and Business Requirements Documents |
| **[Module 3: Diagram Generation](./documents/modules/module_3_diagram_generation.md)** | Create ERD, Sequence, and Schema diagrams with Mermaid |
| **[Module 4: Feature Breakdown & Task Management](./documents/modules/module_4_feature_breakdown_task_management.md)** | Organize features into actionable tasks with dependencies |
| **[Module 5: Implementation Workflow](./documents/modules/module_5_implementation_workflow_ai_ide_integration.md)** | Generate workflows for AI IDE execution (Cursor, Copilot) |
| **[Module 6: Iterative Feedback & Chat Updates](./documents/modules/module_6_iterative_feedback_chat_based_updates.md)** | Refine projects via chat-based interactions |

## Tech Stack

### Backend (`/server`)
- **Runtime**: Node.js + Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **AI Integration**: Google Gemini API
- **Authentication**: JWT + Session-based

### Frontend (`/web`)
- **Framework**: Next.js 14+
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Diagrams**: MermaidJS (live editor & preview)

## Project Structure

```
PAD/
├── documents/
│   └── modules/           # Module specifications
├── server/                # Node.js + Express backend
│   ├── prisma/            # Database schema
│   ├── src/
│   │   ├── modules/       # API modules (auth, user, etc.)
│   │   ├── middlewares/   # Express middlewares
│   │   └── utils/         # Utilities and helpers
│   └── README.md          # Server documentation
├── web/                   # Next.js frontend
│   ├── app/               # App router pages
│   ├── components/        # React components
│   └── README.md          # Frontend documentation
└── README.md              # This file
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- pnpm (recommended) or npm

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PAD
   ```

2. **Set up the backend**
   ```bash
   cd server
   pnpm install
   cp .env.example .env
   # Update .env with your database credentials
   pnpm prisma:generate
   pnpm dev
   ```

3. **Set up the frontend**
   ```bash
   cd web
   pnpm install
   pnpm dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api/v1

## Documentation

- [Module 1: Idea Intake & Pre-Validation](./documents/modules/module_1_idea_intake_pre_validation.md)
- [Module 2: Document Generation](./documents/modules/module_2_document_generation_prd_brd.md)
- [Module 3: Diagram Generation](./documents/modules/module_3_diagram_generation.md)
- [Module 4: Feature Breakdown](./documents/modules/module_4_feature_breakdown_task_management.md)
- [Module 5: Implementation Workflow](./documents/modules/module_5_implementation_workflow_ai_ide_integration.md)
- [Module 6: Iterative Feedback](./documents/modules/module_6_iterative_feedback_chat_based_updates.md)

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting a pull request.

## License

This project is licensed under the Elrayes License.
