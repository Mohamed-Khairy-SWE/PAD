# PAD Web - Next.js Frontend

Frontend application for **PAD (Product Architecture Designer)** - an AI-powered platform that transforms software ideas into comprehensive SDLC artifacts with live MermaidJS diagram editing.

## Purpose

The PAD web interface provides:

- **Idea Submission**: Chat-like interface for submitting and refining software ideas
- **Document Viewer**: View and edit generated PRD and BRD documents
- **Diagram Editor**: Live MermaidJS editor with real-time preview
- **Task Manager**: Feature breakdown with task tracking and dependencies
- **Workflow Visualizer**: Implementation workflow with AI IDE integration
- **Chat Interface**: Iterative feedback and project updates

## UI Layout

PAD uses a split-panel interface:

```
┌─────────────────────────────────────────────────────────┐
│                      Header                              │
├───────────────────┬─────────────────────────────────────┤
│                   │                                      │
│    Chat Panel     │          Content Panel               │
│                   │                                      │
│  - Idea Input     │  Tabs:                              │
│  - AI Responses   │  - Documents (PRD/BRD)              │
│  - Suggestions    │  - Diagrams (Mermaid Editor)        │
│  - Feedback       │  - Features (Task Lists)            │
│                   │  - Workflow (Steps)                 │
│                   │                                      │
└───────────────────┴─────────────────────────────────────┘
```

## Prerequisites

- Node.js 18+
- pnpm or npm

## Setup Instructions

### 1. Install Dependencies

```bash
cd web
pnpm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env.local
```

**Required Variables**:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### 3. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### 4. Build for Production

```bash
pnpm build
pnpm start
```

## Project Structure

```
web/
├── app/                       # Next.js App Router
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page
│   ├── (auth)/                # Authentication pages
│   │   ├── login/
│   │   └── register/
│   └── (dashboard)/           # Main application
│       ├── layout.tsx         # Dashboard layout
│       ├── ideas/             # Module 1: Idea intake
│       ├── documents/         # Module 2: PRD/BRD
│       ├── diagrams/          # Module 3: Mermaid diagrams
│       ├── features/          # Module 4: Feature breakdown
│       └── workflows/         # Module 5: Implementation
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── chat/                  # Chat panel components
│   ├── editor/                # Document & Mermaid editors
│   ├── diagrams/              # Diagram viewer & editor
│   ├── features/              # Feature & task components
│   └── workflow/              # Workflow visualization
├── hooks/                     # Custom React hooks
├── lib/                       # Utilities and API client
├── styles/                    # Global styles
├── public/                    # Static assets
├── components.json            # shadcn/ui configuration
├── next.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

## Key Features

### Chat Interface (Module 1 & 6)
- Natural language idea submission
- AI-powered suggestions and clarifications
- Iterative feedback for any project element
- Conversation history and context tracking

### Document Editor (Module 2)
- Rich text editing for PRD and BRD
- Version history and comparison
- Export to Markdown, PDF, HTML
- Requirement linking to features

### Diagram Editor (Module 3)
- **MermaidJS live editor** with syntax highlighting
- Real-time diagram preview
- Support for ERD, Sequence, and Schema diagrams
- Export diagrams as PNG, SVG, or Mermaid code

### Feature & Task Manager (Module 4)
- Feature extraction from documents
- Task breakdown with dependencies
- Priority and effort estimation
- Progress tracking (Planned → In Progress → Completed)

### Workflow Visualizer (Module 5)
- Ordered implementation steps
- Dependency visualization
- AI IDE export format
- Progress monitoring with alerts

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format code with Prettier |

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Diagrams**: MermaidJS
- **State**: React Context / Zustand
- **API**: Fetch with custom client

## PAD Modules Integration

| Module | Web Pages |
|--------|-----------|
| **Module 1** - Idea Intake | `/ideas` + Chat Panel |
| **Module 2** - Document Generation | `/documents` |
| **Module 3** - Diagram Generation | `/diagrams` |
| **Module 4** - Feature Breakdown | `/features` |
| **Module 5** - Implementation Workflow | `/workflows` |
| **Module 6** - Iterative Feedback | Chat Panel (global) |

## Current Status

**Implemented:**
- Project structure and configuration
- shadcn/ui component library
- Basic layouts and navigation

**In Progress:**
- Chat interface for idea submission
- Document viewer and editor
- Mermaid diagram editor with live preview
- Feature and task management
- Workflow visualization

## Support

For issues or questions, please refer to the [main README](../README.md) and module documentation in `/documents/modules/`.