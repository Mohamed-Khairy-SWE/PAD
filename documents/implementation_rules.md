# Backend Implementation Rules

## Core Principles

### 1. Database Schema Management
- Create Prisma models separately for each module
- Run migrations independently per module
- **NEVER use Prisma `enum` types** - always use `String` type with validation
- Follow snake_case for database column names using `@map()`
- Use PascalCase for model names (singular)

### 2. Module Architecture

#### 2.1 Module Structure
Every module must follow this structure:
```
modules/
  └── [module-name]/
      ├── types/
      │   └── I[ModuleName].ts
      ├── [module-name].repository.ts
      ├── [module-name].service.ts
      ├── [module-name].controller.ts
      └── [module-name].route.ts
```

#### 2.2 Related Modules Grouping
When modules are related (e.g., provider profile ecosystem), group them under a parent directory:
```
modules/
  └── provider/
      ├── profile/
      ├── experience/
      ├── education/
      ├── language/
      ├── skill/
      └── provider-service/
```

### 3. Type System Rules

#### 3.1 No Prisma Type Dependencies
**CRITICAL**: Never use Prisma-generated types in module interfaces
```typescript
// ❌ WRONG - Prisma type dependency
import { Prisma } from "@prisma/client";
experiences?: Prisma.ProviderExperienceCreateWithoutProviderProfileInput[];

// ✅ CORRECT - Custom types
import { ICreateExperienceData } from "../../experience/types/IExperience";
experiences?: ICreateExperienceData[];
```

#### 3.2 Type Location
- All types MUST be in `(module)/types/` directory
- Use interface naming: `I[EntityName]`, `ICreate[EntityName]Data`, `IUpdate[EntityName]Data`
- Never define types inline in repository or service files

#### 3.3 Type Composition
Import types from sibling modules for composition:
```typescript
// In profile/types/IProfile.ts
import { IExperience } from "../../experience/types/IExperience";
import { IEducation } from "../../education/types/IEducation";

export interface IProfileResponse {
    experiences?: IExperience[];
    education?: IEducation[];
}
```

### 4. Layer Responsibilities (CRITICAL)

Each layer has **strict responsibilities**. Violating these boundaries leads to coupling, testing difficulties, and maintenance issues.

#### 4.1 Repository Layer
**Purpose**: Pure database operations only.

**MUST DO**:
- Execute Prisma queries (create, read, update, delete)
- Handle database-specific includes/relations
- Return raw Prisma results
- Receive clean, pre-processed data ready for database insertion
- Use typed interfaces (e.g., `ICreateProfileRepositoryData`)
- Throw `AppError` on database failures

**MUST NOT DO**:
- ❌ Business logic or validation
- ❌ Data transformation (dates, formatting, mapping)
- ❌ Access control / authorization checks
- ❌ Call other services or external APIs
- ❌ Format responses

```typescript
// ✅ CORRECT - Repository receives clean, typed data
async createProfile(userId: string, data: ICreateProfileRepositoryData) {
    return await this.prisma.providerProfile.create({
        data: {
            userId,
            ...data.title,
            experiences: data.experiences ? { create: data.experiences } : undefined
        }
    });
}
```

---

#### 4.2 Service Layer
**Purpose**: Business logic, validation, and data transformation.

**MUST DO**:
- Implement ALL business logic and rules
- Validate business constraints (e.g., "can only cancel if status is X")
- Transform incoming data to repository format:
  - Convert date strings to `Date` objects
  - Map arrays to nested create format
  - Clean/sanitize input data
- Check authorization (e.g., "is this user the project owner?")
- Orchestrate calls to multiple repositories if needed
- Call external services (email, Stripe, etc.)
- Pass errors to `next()` middleware

**MUST NOT DO**:
- ❌ Direct Prisma queries (use repository)
- ❌ Access `req` or `res` objects
- ❌ Format HTTP responses
- ❌ Define routes or middleware

```typescript
// ✅ CORRECT - Service handles business logic and transforms data
static async createProfile(userId: string, data: ICreateProfileData, next: NextFunction) {
    // Business validation
    if (!data.title || data.title.length < 3) {
        return next(new AppError(400, "Title must be at least 3 characters"));
    }

    // Data transformation - convert dates
    const experiences = data.experiences?.map(exp => ({
        ...exp,
        startDate: new Date(exp.startDate),
        endDate: exp.endDate ? new Date(exp.endDate) : undefined,
    }));

    // Prepare repository-ready data
    const repositoryData: ICreateProfileRepositoryData = {
        title: data.title,
        bio: data.bio,
        experiences,
    };

    // Call repository with clean data
    return await this.repository.create(userId, repositoryData);
}
```

---

#### 4.3 Controller Layer
**Purpose**: Thin HTTP handler - extract request data, call service, format response.

**MUST DO**:
- Extract data from `req.body`, `req.params`, `req.query`, `req.user`
- Call service methods with extracted data
- Format and send HTTP responses with status codes
- Pass `next` function to service for error handling

**MUST NOT DO**:
- ❌ Business logic or validation (belongs in service)
- ❌ Data transformation (belongs in service)
- ❌ Direct database/repository access
- ❌ Define routes

```typescript
// ✅ CORRECT - Controller is thin, just handles HTTP
export const createProject = async (req: Request, res: Response, next: NextFunction) => {
    // Extract from request
    const { proposalId, providerProfileId, totalPrice } = req.body;
    const clientId = (req.user as any).id;

    // Call service
    const project = await ProjectService.createProject(
        clientId,
        providerProfileId,
        proposalId,
        totalPrice,
        next
    );

    // Format response
    if (project) {
        return res.status(201).json({
            status: "success",
            message: "Project created successfully",
            data: project
        });
    }
};
```

---

#### 4.4 Route Layer
**Purpose**: Define endpoints and apply middleware.

**MUST DO**:
- Define HTTP endpoints (GET, POST, PATCH, DELETE)
- Apply authentication middleware (`protect`)
- Apply authorization middleware (`checkPermissions`)
- Apply file upload middleware when needed
- Group related routes logically

**MUST NOT DO**:
- ❌ Contain any logic
- ❌ Call services or repositories directly
- ❌ Access request body or transform data

```typescript
// ✅ CORRECT - Routes only define endpoints and middleware
const ProjectRouter = Router();
ProjectRouter.use(protect);
ProjectRouter.post("/", createProject);
ProjectRouter.get("/me", getMyProjects);
ProjectRouter.patch("/:id/complete", markComplete);
```

---

#### 4.5 Types Layer
**Purpose**: Define interfaces for data shapes.

**MUST DO**:
- Define `I[Entity]` for entity representation
- Define `ICreate[Entity]Data` for creation input
- Define `IUpdate[Entity]Data` for update input
- Export types for use by other layers

**MUST NOT DO**:
- ❌ Import from Prisma (use custom types)
- ❌ Contain logic or functions

### 5. Module Independence

#### 5.1 Separate Modules for Related Entities
Each related entity should be its own complete module:
- ✅ `modules/provider/experience/` (full module)
- ✅ `modules/provider/education/` (full module)
- ❌ Experience types in profile module (coupled)

#### 5.2 Each Module is Self-Contained
Every module must have:
- Own types in `types/` directory
- Own repository with CRUD operations
- Own service with business logic
- Own controller with HTTP handlers
- Own route definitions

### 6. Code Reuse and Modification
- **Prioritize modifying existing code** over creating duplicates
- Follow established patterns in the codebase
- Maintain consistency with existing modules

### 7. Data Type Conventions

#### 7.1 String-based Enums
Use string types with TypeScript union types:
```typescript
// ✅ CORRECT
export type ServiceType = "ENGINEERING" | "WRITING" | "TUTORING";
export interface IProviderService {
    serviceType: string; // Stored as string in DB
}
```

#### 7.2 Date Handling
- **Frontend → Service**: Receive as string or Date
- **Service → Repository**: Always convert to Date objects
- **Repository → Database**: Prisma handles Date to database conversion

### 8. Import Path Conventions
- Use relative imports for same module: `"./types/IProfile"`
- Use relative imports for sibling modules: `"../../experience/types/IExperience"`
- Use absolute imports for shared utilities: `"../../../utils/app-error"`

### 9. Error Handling

> **⚠️ MANDATORY**: All modules MUST follow the same error handling patterns as the `server/src/modules/user` module. This ensures consistency across the codebase.

#### 9.1 Controller Error Handling
- Wrap **ALL** controller methods with `catchAsync` from `utils/catch-async`.
- Pass `next` to the service method call.
- Check for returned `user`/`data` before sending response (if service returns undefined due to error).

```typescript
// ✅ CORRECT - Controller with catchAsync
import { catchAsync } from "../../utils/catch-async";

export const createEntity = catchAsync(
    async (request: Request, response: Response, next: NextFunction) => {
        const data = request.body;
        const entity = await EntityService.create(data, next);
        if (!entity) return; // Service returned undefined due to error
        response.status(201).json({ status: "success", data: { entity } });
    }
);
```

#### 9.2 Service Error Handling
- Accept `next: NextFunction` as the **last parameter**.
- Use `return next(new AppError(code, message))` for business logic validation errors (e.g. "User not found", "Invalid password").
- Do **NOT** wrap the main logic in `try/catch` unless performing specific cleanup; rely on bubbling up repository errors.

```typescript
// ✅ CORRECT - Service with next parameter
static async create(data: ICreateData, next: NextFunction) {
    if (!data.name) {
        return next(new AppError(400, "Name is required"));
    }
    return await this.repository.create(data);
}
```

#### 9.3 Repository Error Handling
- Wrap database calls in `try/catch`.
- Throw `AppError(500, "Specific Message")` in the catch block.

```typescript
// ✅ CORRECT - Repository with try/catch
async create(data: ICreateData) {
    try {
        return await this.prisma.entity.create({ data });
    } catch (error) {
        throw new AppError(500, "Failed to create entity");
    }
}
```

#### 9.4 File Cleanup on Failed Requests
When a request includes file uploads, you **MUST** delete the uploaded files if the request fails at any point. This prevents orphaned files on the server.

**Implementation Pattern:**
```typescript
// In Service Layer - Clean up files on validation failure
static async createWithFile(
    data: ICreateData,
    uploadedFile: Express.Multer.File | undefined,
    next: NextFunction
) {
    // Delete uploaded file if validation fails
    if (!data.name) {
        if (uploadedFile) {
            await deleteFile(uploadedFile.path); // Use your file deletion utility
        }
        return next(new AppError(400, "Name is required"));
    }

    try {
        return await this.repository.create(data, uploadedFile?.filename);
    } catch (error) {
        // Delete uploaded file if database operation fails
        if (uploadedFile) {
            await deleteFile(uploadedFile.path);
        }
        throw error;
    }
}
```

**File Cleanup Requirements:**
- Delete files immediately when validation fails in the service layer.
- Delete files when database operations fail (wrap in try/catch for cleanup).
- Use a centralized file deletion utility (e.g., `utils/file-utils.ts`).
- Log file deletion failures for debugging purposes.

- Use strict typing for errors where possible.
- Always include `try/catch` in repository methods to catch database errors explicitly.

### 10. Migration Strategy
- One migration per feature or module implementation
- **Naming convention**: `NNN_entity_or_feature_name`
  - Examples: `001_user_auth`, `002_provider_profile`, `004_provider_application_auto_publish`
  - Use 3-digit prefix for ordering
  - Use snake_case for the description
- Run migrations in development: `npx prisma migrate dev --name [migration_name]`
- Regenerate Prisma client after schema changes: `npx prisma generate`

## Module 2 Implementation Example

This example demonstrates all rules:

**Directory Structure:**
```
modules/provider/
  ├── profile/
  │   ├── types/IProfile.ts (imports from siblings)
  │   ├── profile.repository.ts
  │   ├── profile.service.ts (transforms data)
  │   ├── profile.controller.ts
  │   └── profile.route.ts
  ├── experience/
  │   ├── types/IExperience.ts (independent types)
  │   ├── experience.repository.ts
  │   ├── experience.service.ts
  │   ├── experience.controller.ts
  │   └── experience.route.ts
  └── [other related modules...]
```

**Key Points:**
1. Profile imports types from Experience, NOT Prisma types
2. Each entity (experience, education) is own module
3. Service layer transforms dates before passing to repository
4. Repository receives clean ICreateProfileRepositoryData
5. No coupling between modules except through type imports

### 11. File Handling & Attachments
- **NEVER use polymorphic relations** (e.g., `FileContext`) for linking files to entities.
- **ALWAYS create explicit join tables** for each entity that requires file attachments.
- Naming convention: `[EntityName]File` (e.g., `RequestFile`, `ProposalFile`).
- The join table must link `[entityId]` and `fileId`.
- Use the `File` model for storing metadata and nested writes for transactional creation.

### 12. Entity Separation (Clean Schema Design)
- **Each logical entity should be a separate model** with explicit relations.
- **NEVER embed admin/audit fields directly in the main entity** when they represent a distinct action.
- Use 1:1 relations for action records (e.g., `ProviderApplication` → `ApplicationReview`).

**Example**:
```prisma
// ❌ WRONG - Admin fields embedded in application
model ProviderApplication {
    adminId       String?
    adminReason   String?
    rejectedAt    DateTime?
}

// ✅ CORRECT - Separate Review model
model ProviderApplication {
    review ApplicationReview?
}

model ApplicationReview {
    id            String @id
    applicationId String @unique
    adminId       String
    decision      String
    reason        String?
    reviewedAt    DateTime
}
```

### 13. Prisma Schema Documentation
- **Document all relationships with cardinality comments**
- Place comment on the line **above** the relation field
- Use format: `// ModelA -> ModelB (One -> One|One -> Many|Many -> One)`

**Example**:
```prisma
model User {
    // Relations
    // User -> AdminPrivilege (One -> Many)
    privileges      AdminPrivilege[]
    // User -> ProviderProfile (One -> One)
    providerProfile ProviderProfile?
}

model AdminPrivilege {
    // Relations
    // AdminPrivilege -> User (Many -> One)
    user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### 14. Schema Diagram Maintenance
- **Update `documents/schema.mermaid`** whenever schema changes occur
- Keep entity definitions in sync with actual Prisma models
- Update relationships to reflect new models

### 15. Prisma Schema Model Ordering
- **Order models by module number** as defined in `documents/modules/`
- Group models with section comment headers: `// ============================================`
- Include module name in header: `// Module N: Module Name`
- Models within a module should be ordered logically (parent entities before child entities)

**Example**:
```prisma
// ============================================
// Module 1: Identity & Access Management (IAM)
// ============================================

model User { ... }
model AdminPrivilege { ... }

// ============================================
// Module 2: Provider Profile & Onboarding
// ============================================

model ProviderProfile { ... }
model ProviderService { ... }
```

## Checklist for New Module Implementation

- [ ] Create module directory with proper structure
- [ ] Define all types in `types/` directory (no Prisma types)
- [ ] Implement repository with pure DB operations
- [ ] Implement service with data transformation logic
- [ ] Implement controller for HTTP handling
- [ ] Define routes with proper middleware
- [ ] Create Prisma models (no enums, use strings)
- [ ] Run migration separately
- [ ] Update app.ts with route imports
- [ ] Verify no Prisma type dependencies in interfaces
- [ ] Test with TypeScript compilation (`npx tsc --noEmit`)