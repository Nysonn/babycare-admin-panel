import api from "../axios"
import type { Report } from "../../types"

export const listReports = (status?: string): Promise<Report[]> =>
  api.get("/api/v1/admin/reports", { params: status ? { status } : {} }).then((res) => res.data ?? [])

export const updateReportStatus = (
  id: string,
  status: "resolved" | "dismissed"
): Promise<{ message: string; report: Report }> =>
  api.put(`/api/v1/admin/reports/${id}`, { status }).then((res) => res.data)
