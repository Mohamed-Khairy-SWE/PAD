import { IUser, UserResponse } from "../../modules/user/types/IUser";

// * Convert to user Response
export const convertToUserResponse = (user: IUser): UserResponse => {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    username: user.username,
    avatar: user.avatar,
    role: user.role,
    active: user.active,
    phone: user.phone,
    createdAt: user.createdAt,
    privileges: user.privileges,
  } as UserResponse;
};
