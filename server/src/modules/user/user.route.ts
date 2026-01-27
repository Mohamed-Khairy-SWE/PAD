import { Router } from "express";
import {
    createBatchUsers,
    deleteUser,
    getAllUsers,
    getBatchUsers,
    getMinBatchUsers,
    getUser,
    getUsersStatistics,
    saveUser,
    updateUser,
    updateUserPassword,
    updateUserProfile,
    updateUserProfilePassword,
    updateUserStatus,
} from "./user.controller";

const UserRouter:Router = Router();

UserRouter.route("/batch").post(createBatchUsers).get(getBatchUsers);
UserRouter.route("/min-batch").get(getMinBatchUsers);
UserRouter.route("/statistics").get(getUsersStatistics);
UserRouter.route("/:id/profile/password").patch(updateUserProfilePassword);

UserRouter.route("/").post(saveUser).get(getAllUsers);

UserRouter.route("/:id/password").patch(updateUserPassword);

UserRouter.route("/:id/profile").put(updateUserProfile);

UserRouter.route("/:id")
    .get(getUser)
    .delete(deleteUser)
    .put(updateUser)
    .patch(updateUserStatus);

export default UserRouter;
