import {
    ICreateUser,
    IUser,
    NewUserData,
    UpdateUserRequest,
    UserResponse,
} from "./types/IUser";
import { hash, compare } from "../../utils/hashing-handler";
import UserRepository from "./user.repository";
import { NextFunction } from "express";
import AppError from "../../utils/app-error";
import { UserRole } from "../../enum/UserRole";

class UserService {
    private static userRepository: UserRepository = UserRepository.getInstance();

    /*
     * Create User a new user with some roles
     */
    static async saveUser(userData: ICreateUser, next: NextFunction) {
        const { email, password } = userData;
        if (!password || !email) {
            return next(new AppError(400, "Password and email are required"));
        }
        const user = await this.userRepository.getUserByUsernameOrEmail(email);
        if (user) {
            return next(new AppError(400, "User with this email already exists"));
        }

        const hashedPassword = await hash(password);
        const username = email.split("@")[0].toLowerCase();
        const newUserData: NewUserData = {
            ...userData,
            password: hashedPassword,
            username,
        };
        return this.userRepository.addUser(newUserData);
    }

    static async updateUserProfilePassword(
        userId: string,
        currentPassword: string,
        newPassword: string,
        next: NextFunction
    ) {
        if (!userId) {
            return next(new AppError(400, "User ID is required to update password"));
        }
        if (!currentPassword || !newPassword) {
            return next(new AppError(400, "Current and new password are required"));
        }
        const user = await this.userRepository.getUserById(userId);
        if (!user) {
            return next(new AppError(404, "This user does not exist"));
        }

        const passwordChecked = await compare(currentPassword, user.password);
        if (!passwordChecked) {
            return next(new AppError(400, "Current password is incorrect"));
        }

        const hashedPassword = await hash(newPassword);
        return await this.userRepository.updateUserPassword(
            userId,
            hashedPassword
        );
    }

    /*
     * Update User
     */
    static async updateUser(updatedData: UpdateUserRequest, next: NextFunction) {
        const { id } = updatedData;
        const user = await this.getUser(id, next);
        if (!user) return;

        // * check if the new email or username belongs to another user
        const checkedEmailUser =
            await this.userRepository.getUserByUsernameOrEmail(updatedData.email);
        if (checkedEmailUser && checkedEmailUser.id !== user.id) {
            return next(new AppError(400, "The provided new email already exists"));
        }

        const checkedUsernameUser =
            await this.userRepository.getUserByUsernameOrEmail(updatedData.username);
        if (checkedUsernameUser && checkedUsernameUser.id !== user.id) {
            next(new AppError(400, "The provided new username already exists"));
            return;
        }

        // Note: privileges are managed separately through admin.repository, not here
        const userData: IUser = {
            ...user,
            ...updatedData,
            privileges: user.privileges, // Keep existing privileges from database
        };
        return this.userRepository.updateUserById(userData);
    }

    /*
     * Delete User
     */
    static async deleteUser(userId: string, next: NextFunction) {
        const user = await this.getUser(userId, next);
        if (!user) return;

        // Use transaction to ensure atomic deletion
        return await this.userRepository.getPrismaClient().$transaction(async (tx) => {
            // Delete the user
            return await this.userRepository.deleteUser(userId, tx);
        });
    }

    /*
     * Get all users
     */
    static async getAllUsers(role?: UserRole): Promise<UserResponse[]> {
        const users = (await this.userRepository.getAllUsers(role)).map(
            (user) => user as UserResponse
        );
        return users;
    }

    /*
     * Get user by ID
     */
    static async getUser(userId: string, next: NextFunction) {
        const user = await this.userRepository.getUserById(userId);
        if (!user) {
            next(
                new AppError(
                    404,
                    `User with ID: ${userId} no longer exists, try again!`
                )
            );
            return;
        }
        return user;
    }

    /*
     * Get user by email or username
     */
    static async getUserByUsernameOrEmail(
        usernameOrEmail: string,
        next: NextFunction
    ) {
        const user = await this.userRepository.getUserByUsernameOrEmail(
            usernameOrEmail
        );
        if (!user) {
            next(
                new AppError(
                    401,
                    `The provided user: ${usernameOrEmail} or password is incorrect, try again!`
                )
            );
            return;
        }
        return user;
    }

    static async isUserEmailExisted(email: string, next: NextFunction) {
        const user = await this.userRepository.getUserByUsernameOrEmail(email);
        if (user) {
            next(
                new AppError(
                    400,
                    `The provided email: ${email} already exists, choose a valid email and try again!`
                )
            );
            return { status: "fail" };
        }
        return { status: "success" };
    }

    static async updateUserPasswordByEmail(email: string, password: string) {
        return this.userRepository.updateUserPasswordByEmail(email, password);
    }

    // Check if the user found by his email if not create a new user
    static async findOrCreateUserByEmail(data: NewUserData) {
        return this.userRepository.findOrCreateUserByEmail(data);
    }

    // Update the user account to make it active or inactive
    static async updateUserStatus(
        userId: string,
        active: boolean,
        next: NextFunction
    ) {
        if (!userId) {
            return next(new AppError(400, "User ID is required"));
        }
        const user = await this.userRepository.getUserById(userId);
        if (!user) {
            return next(new AppError(401, "User does not exist"));
        }
        return this.userRepository.updateUserStatus(userId, active);
    }

    // Update the user password
    static async updateUserPassword(
        userId: string,
        password: string,
        next: NextFunction
    ) {
        if (!userId) {
            return next(new AppError(400, "User ID is required"));
        }
        if (!password) {
            return next(new AppError(400, "New user password is required"));
        }
        const hashedPassword = await hash(password);
        const user = await this.userRepository.getUserById(userId);
        if (!user) {
            return next(new AppError(401, "User does not exist"));
        }
        return this.userRepository.updateUserPassword(userId, hashedPassword);
    }

    // Update the user role
    static async updateUserRole(userId: string, role: UserRole) {
        return this.userRepository.updateUserRole(userId, role);
    }

    // Create a batch of users
    static async createBatchUsers(users: NewUserData[]) {
        const usersWithHashedPassword = await Promise.all(
            users.map(async (user) => ({
                ...user,
                password: await hash(user.password),
                username: user.email.split("@")[0],
            }))
        );

        return await this.userRepository.createBatchUsers(usersWithHashedPassword);
    }

    // get a batch of users
    static async getBatchUsers(
        params: {
            page: number;
            limit: number;
            search?: string;
            role?: UserRole;
            status?: boolean;
        },
        currentUserEmail: string,
        _next: NextFunction
    ) {
        const excluded: string[] = [currentUserEmail];
        const { users, total } = await this.userRepository.getBatchUsers(
            params,
            excluded
        );

        return {
            users,
            total,
            totalPages: Math.ceil(total / params.limit),
            page: params.page,
        };
    }

    static async getMinBatchUsers(role: string) {
        return await this.userRepository.getMinBatchUsers(role);
    }

    // * Get users Statistics
    static async getUsersStatistics() {
        let users = 0,
            admins = 0,
            providers = 0,
            active = 0,
            inactive = 0;

        const [rolesData, activeData] = await Promise.all([
            this.userRepository.getUsersRoleNumbers(),
            this.userRepository.getUsersActiveNumbers(),
        ]);

        // get the roles numbers
        rolesData.forEach((roleNumber) => {
            const roleCount = roleNumber._count.role;
            users += roleCount;

            admins +=
                roleNumber.role === "ADMIN" || roleNumber.role === "SUPER_ADMIN"
                    ? roleCount
                    : 0;
            providers += roleNumber.role === "PROVIDER" ? roleCount : 0;
        });

        // get the active numbers
        activeData.forEach((activeNumber) => {
            const activeCount = activeNumber._count.active;
            active += activeNumber.active ? activeCount : 0;
            inactive += !activeNumber.active ? activeCount : 0;
        });

        return { users, providers, admins, active, inactive };
    }

    static async updateUserProfile(
        updatedData: UpdateUserRequest & { hasNewAvatar: string; avatar?: string },
        fileFilename: string | undefined,
        next: NextFunction
    ) {

        try {
            const { id } = updatedData;
            const user = await this.getUser(id, next);
            if (!user) return;

            // * check if the new email or username belongs to another user
            const checkedEmailUser =
                await this.userRepository.getUserByUsernameOrEmail(updatedData.email);
            if (checkedEmailUser && checkedEmailUser.id !== user.id) {
                return next(new AppError(400, "The provided new email already exists"));
            }

            const checkedUsernameUser =
                await this.userRepository.getUserByUsernameOrEmail(
                    updatedData.username
                );
            if (checkedUsernameUser && checkedUsernameUser.id !== user.id) {
                next(new AppError(400, "The provided new username already exists"));
                return;
            }

            const data: {
                id: string;
                firstName: string;
                lastName: string;
                email: string;
                phone: string;
                avatar?: string;
            } = {
                id: user.id,
                firstName: updatedData.firstName,
                lastName: updatedData.lastName,
                email: updatedData.email,
                phone: updatedData.phone,
                ...(updatedData.hasNewAvatar === "true" &&
                    fileFilename && { avatar: fileFilename }),
            };

            const updatedUser = await this.userRepository.updateUserProfile(data);
            return updatedUser;
        } catch (error) {
            return next(new AppError(500, "Failed to update profile"));
        }
    }
}

export default UserService;
