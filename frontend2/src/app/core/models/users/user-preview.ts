import { Role, User } from "./User"

export interface UserPreview extends User{
    id: number
    username: string
    profilePictureUrl?: string
    role: Role
}