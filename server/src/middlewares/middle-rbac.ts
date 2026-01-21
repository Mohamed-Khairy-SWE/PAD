import { NextFunction, Request, Response } from "express";

export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: No user found" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: Insufficient role permissions" });
    }

    next();
  };
};

export const requirePrivilege = (...privs: string[]) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: No user found" });
    }

    const userPrivileges = req.user.privileges || [];
    // Extract privilege names from the privilege objects
    const userPrivNames = userPrivileges.map(p => p.name);

    const hasRequiredPrivilege = privs.some((p) => userPrivNames.includes(p));

    if (!hasRequiredPrivilege) {
      return res.status(403).json({ message: "Forbidden: Insufficient privileges" });
    }

    next();
  };
};
