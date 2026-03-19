import api from "../axios"
import type { LoginRequest, LoginResponse } from "../../types"

export const loginAdmin = (data: LoginRequest): Promise<LoginResponse> =>
  api.post("/api/v1/auth/login", data).then((res) => res.data)

export const logoutAdmin = (): Promise<void> =>
  api.post("/api/v1/auth/logout").then((res) => res.data)
