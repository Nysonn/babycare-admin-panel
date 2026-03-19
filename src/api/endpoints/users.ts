import api from "../axios"
import type { User, UserDetail, ActivityItem } from "../../types"

export const listUsers = (): Promise<User[]> =>
  api.get("/api/v1/admin/users").then((res) => res.data)

export const getUser = (id: string): Promise<UserDetail> =>
  api.get(`/api/v1/admin/users/${id}`).then((res) => res.data)

export const suspendUser = (id: string): Promise<{ message: string }> =>
  api.put(`/api/v1/admin/users/${id}/suspend`).then((res) => res.data)

export const deleteUser = (id: string): Promise<{ message: string }> =>
  api.delete(`/api/v1/admin/users/${id}`).then((res) => res.data)

export const approveBabysitter = (id: string): Promise<{ message: string }> =>
  api.put(`/api/v1/admin/babysitters/${id}/approve`).then((res) => res.data)

export const getActivityReport = (): Promise<ActivityItem[]> =>
  api.get("/api/v1/admin/activity").then((res) => res.data)
