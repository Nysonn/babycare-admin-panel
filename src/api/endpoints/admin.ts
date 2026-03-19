import api from "../axios"
import type { CreateAdminRequest, User } from "../../types"

export const createAdmin = (data: CreateAdminRequest): Promise<User> =>
  api.post("/api/v1/admin/create", data).then((res) => res.data)
