// Task status and priority types
export type TaskStatus = "planned" | "in_progress" | "completed" | "blocked";
export type Priority = "low" | "medium" | "high" | "critical";

// Base task entity interface
export interface ITask {
    id: string;
    featureId: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: Priority;
    estimatedEffort: string | null;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

// Task version interface
export interface ITaskVersion {
    id: string;
    taskId: string;
    version: number;
    title: string;
    description: string;
    status: TaskStatus;
    changelog: string | null;
    createdAt: Date;
}

// Task dependency interface
export interface ITaskDependency {
    id: string;
    taskId: string;
    dependsOnTaskId: string;
    createdAt: Date;
}

// Input for creating a new task
export interface ICreateTaskData {
    title: string;
    description: string;
    priority?: Priority;
    estimatedEffort?: string;
    order?: number;
}

// Input for updating a task
export interface IUpdateTaskData {
    title?: string;
    description?: string;
    priority?: Priority;
    status?: TaskStatus;
    estimatedEffort?: string;
    order?: number;
    changelog?: string;
}

// Repository-specific data
export interface ICreateTaskRepositoryData {
    featureId: string;
    title: string;
    description: string;
    priority: Priority;
    estimatedEffort?: string;
    order: number;
    status: TaskStatus;
}

export interface IUpdateTaskRepositoryData {
    title?: string;
    description?: string;
    priority?: Priority;
    status?: TaskStatus;
    estimatedEffort?: string;
    order?: number;
}

// Task with dependencies
export interface ITaskWithDependencies extends ITask {
    dependencies: ITaskDependency[];
    dependents: ITaskDependency[];
}

// API response types
export interface ITaskResponse {
    task: ITask;
}

export interface ITasksListResponse {
    tasks: ITask[];
    count: number;
}
