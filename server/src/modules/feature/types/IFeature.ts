// Feature status and priority types
export type FeatureSource = "auto" | "manual" | "ai_suggested";
export type FeatureStatus = "active" | "archived";
export type Priority = "low" | "medium" | "high" | "critical";

// Base feature entity interface
export interface IFeature {
    id: string;
    ideaId: string;
    title: string;
    description: string;
    source: FeatureSource;
    status: FeatureStatus;
    priority: Priority;
    createdAt: Date;
    updatedAt: Date;
}

// Feature version interface
export interface IFeatureVersion {
    id: string;
    featureId: string;
    version: number;
    title: string;
    description: string;
    changelog: string | null;
    createdAt: Date;
}

// Input for creating a new feature
export interface ICreateFeatureData {
    title: string;
    description: string;
    source?: FeatureSource;
    priority?: Priority;
}

// Input for updating a feature
export interface IUpdateFeatureData {
    title?: string;
    description?: string;
    priority?: Priority;
    status?: FeatureStatus;
    changelog?: string;
}

// Repository-specific data
export interface ICreateFeatureRepositoryData {
    ideaId: string;
    title: string;
    description: string;
    source: FeatureSource;
    priority: Priority;
}

export interface IUpdateFeatureRepositoryData {
    title?: string;
    description?: string;
    priority?: Priority;
    status?: FeatureStatus;
}

// Feature with related data
export interface IFeatureWithTasks {
    id: string;
    ideaId: string;
    title: string;
    description: string;
    source: FeatureSource;
    status: FeatureStatus;
    priority: Priority;
    createdAt: Date;
    updatedAt: Date;
    tasks: any[]; // Will be populated with tasks
    diagramLinks?: any[]; // Will be populated with diagram links
}

// API response types
export interface IFeatureResponse {
    feature: IFeature;
}

export interface IFeaturesListResponse {
    features: IFeature[];
    count: number;
}
