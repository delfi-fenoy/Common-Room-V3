import { Role, User } from "./user";

export interface UserPreview extends User{
    id: number
    username: string
    profilePictureUrl?: string
    role: Role
}