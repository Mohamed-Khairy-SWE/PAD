import { AdminPrivilege, UserRole } from "../../../enum/UserRole";

export type ICreateUser = {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: UserRole;
    privileges?: AdminPrivilege[];
};

export type NewUserData = ICreateUser & {
    username: string;
};

export type IUser = {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phone: string | null;
    password: string;
    role: string; // UserRole enum value as string
    active: boolean;
    emailVerified: boolean;
    passwordChangedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    avatar?: string;
    providerProfile?: { id: string };
    privileges?: { id: string; userId: string; name: string; createdAt: Date }[]; // AdminPrivilege relation from database
};

export type UserResponse = {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    role: UserRole;
    active: boolean;
    createdAt: Date;
    phone: string;
    privileges?: AdminPrivilege[];
};

export type UpdateUserRequest = ICreateUser & {
    id: string;
    username: string;
};

export interface UsersBatchResponse {
    users: UserResponse[];
    total: number;
}
