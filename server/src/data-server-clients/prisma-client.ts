import { PrismaClient } from "@prisma/client";

class PrismaClientSingleton {
    private static prismaInstance: PrismaClient | null = null;

    private constructor() { }

    static getPrismaClient(): PrismaClient {
        if (!PrismaClientSingleton.prismaInstance) {
            PrismaClientSingleton.prismaInstance = new PrismaClient();
        }
        return PrismaClientSingleton.prismaInstance;
    }

    static async disconnect(): Promise<void> {
        if (PrismaClientSingleton.prismaInstance) {
            await PrismaClientSingleton.prismaInstance.$disconnect();
            PrismaClientSingleton.prismaInstance = null;
        }
    }
}

export default PrismaClientSingleton;
