import { AdminPrivilege, UserRole } from "../enum/UserRole";

// Define role-based privileges
const rolePrivileges: Record<string, AdminPrivilege[]> = {
    [UserRole.SUPER_ADMIN]: Object.values(AdminPrivilege) as AdminPrivilege[],
    [UserRole.ADMIN]: [
        AdminPrivilege.USERS,
        AdminPrivilege.PROFILES,
        AdminPrivilege.SERVICES,
        AdminPrivilege.REPORTS,
    ],
    [UserRole.USER]: [],
};

// Define allowed tabs for each role
const roleTabs: Record<string, string[]> = {
    [UserRole.SUPER_ADMIN]: [
        "dashboard",
        "users",
        "operations",
        "profiles",
        "services",
        "payments",
        "subscriptions",
        "settings",
        "reports",
    ],
    [UserRole.ADMIN]: [
        "dashboard",
        "users",
        "profiles",
        "services",
        "reports",
    ],
    [UserRole.USER]: [
        "dashboard",
        "profile",
    ],
};

/**
 * Get privileges for a role, optionally including database-stored privileges
 */
export function getRolePrivileges(role: string, dbPrivileges: string[] = []): AdminPrivilege[] {
    const basePrivileges = rolePrivileges[role] || [];
    const additionalPrivileges = dbPrivileges
        .filter((p) => Object.values(AdminPrivilege).includes(p as AdminPrivilege))
        .map((p) => p as AdminPrivilege);

    // Merge and deduplicate
    return [...new Set([...basePrivileges, ...additionalPrivileges])];
}

/**
 * Get allowed tabs for a role, optionally including database-stored privileges
 */
export function getRoleAllowedTabs(role: string, dbPrivileges: string[] = []): string[] {
    const baseTabs = roleTabs[role] || [];

    // Add additional tabs based on privileges
    const additionalTabs: string[] = [];
    if (dbPrivileges.includes(AdminPrivilege.PAYMENTS)) {
        additionalTabs.push("payments");
    }
    if (dbPrivileges.includes(AdminPrivilege.SUBSCRIPTIONS)) {
        additionalTabs.push("subscriptions");
    }
    if (dbPrivileges.includes(AdminPrivilege.SETTINGS)) {
        additionalTabs.push("settings");
    }

    // Merge and deduplicate
    return [...new Set([...baseTabs, ...additionalTabs])];
}

/**
 * Check if a role has a specific privilege
 */
export function hasPrivilege(
    role: string,
    privilege: AdminPrivilege,
    dbPrivileges: string[] = []
): boolean {
    const allPrivileges = getRolePrivileges(role, dbPrivileges);
    return allPrivileges.includes(privilege);
}
