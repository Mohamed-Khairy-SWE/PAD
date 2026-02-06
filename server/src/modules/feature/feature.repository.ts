import { PrismaClient } from "@prisma/client";
import AppError from "../../utils/app-error";
import {
    ICreateFeatureRepositoryData,
    IUpdateFeatureRepositoryData,
    IFeature,
    IFeatureVersion,
    IFeatureWithTasks,
} from "./types/IFeature";

export default class FeatureRepository {
    private static instance: FeatureRepository;
    private prisma: PrismaClient;

    private constructor() {
        this.prisma = new PrismaClient();
    }

    public static getInstance(): FeatureRepository {
        if (!FeatureRepository.instance) {
            FeatureRepository.instance = new FeatureRepository();
        }
        return FeatureRepository.instance;
    }

    // Create a new feature
    async createFeature(data: ICreateFeatureRepositoryData): Promise<IFeature> {
        try {
            return await this.prisma.feature.create({
                data: {
                    ideaId: data.ideaId,
                    title: data.title,
                    description: data.description,
                    source: data.source,
                    priority: data.priority,
                },
            }) as IFeature;
        } catch (error) {
            throw new AppError(500, "Failed to create feature");
        }
    }

    // Get a feature by ID
    async getFeatureById(id: string): Promise<IFeature | null> {
        try {
            return await this.prisma.feature.findUnique({
                where: { id },
            }) as IFeature | null;
        } catch (error) {
            throw new AppError(500, "Failed to fetch feature");
        }
    }

    // Get all features for an idea
    async getFeaturesByIdeaId(ideaId: string): Promise<IFeature[]> {
        try {
            return await this.prisma.feature.findMany({
                where: { ideaId },
                orderBy: { createdAt: "desc" },
            }) as IFeature[];
        } catch (error) {
            throw new AppError(500, "Failed to fetch features");
        }
    }

    // Get feature with tasks and diagram links
    async getFeatureWithTasks(id: string): Promise<IFeatureWithTasks | null> {
        try {
            return await this.prisma.feature.findUnique({
                where: { id },
                include: {
                    tasks: {
                        orderBy: { order: "asc" },
                    },
                    diagramLinks: {
                        include: {
                            diagram: true,
                        },
                    },
                },
            }) as IFeatureWithTasks | null;
        } catch (error) {
            throw new AppError(500, "Failed to fetch feature with tasks");
        }
    }

    // Update a feature
    async updateFeature(
        id: string,
        data: IUpdateFeatureRepositoryData
    ): Promise<IFeature> {
        try {
            return await this.prisma.feature.update({
                where: { id },
                data,
            }) as IFeature;
        } catch (error) {
            throw new AppError(500, "Failed to update feature");
        }
    }

    // Delete a feature
    async deleteFeature(id: string): Promise<void> {
        try {
            await this.prisma.feature.delete({
                where: { id },
            });
        } catch (error) {
            throw new AppError(500, "Failed to delete feature");
        }
    }

    // Create a version entry
    async createVersion(
        featureId: string,
        title: string,
        description: string,
        changelog: string | null
    ): Promise<IFeatureVersion> {
        try {
            // Get the current max version
            const maxVersion = await this.prisma.featureVersion.findFirst({
                where: { featureId },
                orderBy: { version: "desc" },
                select: { version: true },
            });

            const nextVersion = maxVersion ? maxVersion.version + 1 : 1;

            return await this.prisma.featureVersion.create({
                data: {
                    featureId,
                    version: nextVersion,
                    title,
                    description,
                    changelog,
                },
            });
        } catch (error) {
            throw new AppError(500, "Failed to create feature version");
        }
    }

    // Get version history
    async getVersionHistory(featureId: string): Promise<IFeatureVersion[]> {
        try {
            return await this.prisma.featureVersion.findMany({
                where: { featureId },
                orderBy: { version: "desc" },
            });
        } catch (error) {
            throw new AppError(500, "Failed to fetch version history");
        }
    }

    // Link feature to diagram
    async linkDiagram(featureId: string, diagramId: string): Promise<void> {
        try {
            await this.prisma.featureDiagramLink.create({
                data: {
                    featureId,
                    diagramId,
                },
            });
        } catch (error) {
            throw new AppError(500, "Failed to link diagram");
        }
    }

    // Unlink feature from diagram
    async unlinkDiagram(featureId: string, diagramId: string): Promise<void> {
        try {
            await this.prisma.featureDiagramLink.deleteMany({
                where: {
                    featureId,
                    diagramId,
                },
            });
        } catch (error) {
            throw new AppError(500, "Failed to unlink diagram");
        }
    }
}
