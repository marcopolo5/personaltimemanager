import { User } from "./User"

export interface CustomResponse {
  message:string
  token:string,
  user: User
}
