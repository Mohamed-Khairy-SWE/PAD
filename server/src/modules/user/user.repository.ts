import PrismaClientSingleton from "../../data-server-clients/prisma-client";
import { PrismaClient } from "@prisma/client";
import { IUser, NewUserData, UsersBatchResponse } from "./types/IUser";
import { UserRole } from "../../enum/UserRole";
import AppError from "../../utils/app-error";
import config from "../../config/config";

class UserRepository {
    private prisma: PrismaClient;
    static userRepositoryInstance: UserRepository;

    private constructor() {
        // initialize a prisma client to perform interactions with DB
        this.prisma = PrismaClientSingleton.getPrismaClient();
    }

    static getInstance(): UserRepository {
        if (!UserRepository.userRepositoryInstance) {
            UserRepository.userRepositoryInstance = new UserRepository();
        }
        return UserRepository.userRepositoryInstance;
    }

    // Getter for prisma client (needed for transactions in UserService)
    getPrismaClient(): PrismaClient {
        return this.prisma;
    }

    // Create user with specific roles
    async addUser(userData: NewUserData) {
        try {
            return await this.prisma.user.create({
                data: {
                    email: userData.email,
                    username: userData.username || userData.email.split('@')[0], // Fallback if still needed or ensure service sends it
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    role: userData.role,
                    password: userData.password,
                    phone: userData.phone,
                },
                include: {
                    privileges: true,
                },
            });
        } catch (error) {
            throw new AppError(500, `Failed to create user`);
        }
    }

    async getAllUsers(role?: UserRole) {
        const users = await this.prisma.user.findMany({
            where: {
                role,
                email: {
                    notIn: [config.adminDefault.email ? config.adminDefault.email : ""],
                },
            },
        });
        return users as IUser[];
    }

    // Get a limit of users for a specific page with the ability of filtering according to many options like role, active, search input
    async getBatchUsers(
        {
            page,
            limit,
            search,
            role,
            status,
        }: {
            page: number;
            limit: number;
            search?: string;
            role?: string;
            status?: boolean;
        },
        excluded: string[]
    ): Promise<UsersBatchResponse> {
        try {
            const skip = (page - 1) * limit;

            const where: any = {};

            // Search filter
            if (search) {
                where.OR = [
                    { firstName: { contains: search, mode: "insensitive" } },
                    { lastName: { contains: search, mode: "insensitive" } },
                    { username: { contains: search, mode: "insensitive" } },
                    { email: { contains: search, mode: "insensitive" } },
                ];
            }

            // Role filter
            if (role && role !== "all") {
                where.role = role;
            }

            // Check if there is a filter by the active status
            if (status != undefined) {
                where.active = status;
            }
            if (excluded.length) {
                where.email = { notIn: excluded };
            }

            // Get all filtered users
            const [users, total] = await Promise.all([
                this.prisma.user.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
                }),
                this.prisma.user.count({ where }),
            ]);

            return { users: users as any, total };
        } catch (error) {
            throw new AppError(500, `Error getting batch of users`);
        }
    }

    async getMinBatchUsers(role: string) {
        try {
            return await this.prisma.user.findMany({
                where: {
                    role,
                    email: {
                        notIn: [config.adminDefault.email ? config.adminDefault.email : ""],
                    },
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            });
        } catch (error) {
            throw new AppError(500, `Error getting batch of users`);
        }
    }

    async getUserById(userId: string) {
        try {
            const user = await this.prisma.user.findFirst({
                where: { id: userId },
            });
            return user as IUser | null;
        } catch (error) {
            throw new AppError(500, `Error getting user`);
        }
    }

    async updateUserById(userData: IUser) {
        try {
            const { id, privileges, providerProfile, ...restData } = userData;

            return await this.prisma.user.update({
                where: { id },
                data: restData,
            });
        } catch (error) {
            throw new AppError(500, `Failed to update user with ID ${userData.id}`);
        }
    }

    deleteUser(userId: string, tx?: any) {
        try {
            const prisma = tx || this.prisma;
            return prisma.user.delete({ where: { id: userId } });
        } catch (error) {
            throw new AppError(500, `Error deleting user`);
        }
    }

    getUserByUsernameOrEmail(usernameOrEmail: string) {
        try {
            return this.prisma.user.findFirst({
                where: {
                    OR: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
                },
                include: {
                    privileges: true, // Include admin privileges relation
                },
            });
        } catch (error) {
            throw new AppError(500, "Error getting user by email or username");
        }
    }

    updateUserPasswordByEmail(email: string, password: string) {
        try {
            return this.prisma.user.update({
                where: {
                    email,
                },
                data: {
                    password,
                    passwordChangedAt: new Date(),
                },
            });
        } catch (error) {
            throw new AppError(500, `Error updating user password`);
        }
    }

    // Check if the user found by his email if not create a new user
    async findOrCreateUserByEmail(data: NewUserData) {
        try {
            const { email } = data;
            let user = await this.getUserByUsernameOrEmail(email);
            if (!user) {
                user = await this.addUser(data);
            }
            return user;
        } catch (error) {
            throw new AppError(500, `An error occurred`);
        }
    }

    // update user state
    async updateUserStatus(userId: string, active: boolean) {
        try {
            return await this.prisma.user.update({
                where: { id: userId },
                data: { active },
            });
        } catch (error) {
            throw new AppError(500, `User not found or update failed`);
        }
    }

    async updateUserPassword(userId: string, password: string) {
        try {
            return await this.prisma.user.update({
                where: { id: userId },
                data: {
                    password,
                    passwordChangedAt: new Date(),
                },
            });
        } catch (error) {
            throw new AppError(500, `User not found or update failed`);
        }
    }

    async updateUserRole(userId: string, role: string, tx?: any) {
        try {
            const prisma = tx || this.prisma;
            return await prisma.user.update({
                where: { id: userId },
                data: { role },
            });
        } catch (error) {
            throw new AppError(500, `User not found or update failed`);
        }
    }

    // * Get users roles number (how many users does each role includes)
    async getUsersRoleNumbers() {
        try {
            return await this.prisma.user.groupBy({
                by: ["role"],
                _count: { role: true },
            });
        } catch (error) {
            throw new AppError(500, `Error getting user role numbers`);
        }
    }

    async getUsersActiveNumbers() {
        try {
            return await this.prisma.user.groupBy({
                by: ["active"],
                _count: { active: true },
            });
        } catch (error) {
            throw new AppError(500, `Error getting user active numbers`);
        }
    }

    async updateUserProfile(data: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        avatar?: string;
    }) {
        try {
            return await this.prisma.user.update({
                where: {
                    id: data.id,
                },
                data: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    phone: data.phone,
                    ...(data.avatar && { avatar: data.avatar }),
                },
            });
        } catch (error) {
            throw new AppError(500, "Error updating user profile");
        }
    }

    // ! FOR TESTING ONLY
    // ! CREATE MANY USERS AT ONCE
    async createBatchUsers(users: any) {
        try {
            return await this.prisma.user.createMany({
                data: users,
            });
        } catch (error) {
            throw new AppError(500, `User not found or update failed`);
        }
    }
}

export default UserRepository;
