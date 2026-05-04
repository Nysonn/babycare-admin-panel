export interface User {
  id: string
  full_name: string
  email: string
  phone: string
  role: "admin" | "parent" | "babysitter"
  status: "active" | "suspended" | "deleted"
  created_at: string
}

export interface BabysitterProfile {
  user_id: string
  full_name: string
  email: string
  phone: string
  location: string
  profile_picture_url: string
  languages: string[]
  days_per_week: number
  hours_per_day: number
  rate_type: "hourly" | "daily" | "weekly" | "monthly"
  rate_amount: number
  payment_method: string
  is_approved: boolean
}

export interface ParentProfile {
  id: string
  full_name: string
  email: string
  phone: string
  status: string
  location: string
  occupation: string
  preferred_hours: string
  created_at: string
}

export interface UserDetail extends User {
  location?: string
  occupation?: string
  preferred_hours?: string
  profile_picture_url?: string
  languages?: string[]
  days_per_week?: number
  hours_per_day?: number
  rate_type?: string
  rate_amount?: number
  payment_method?: string
  is_approved?: boolean
  national_id_url?: string
  lci_letter_url?: string
  cv_url?: string
}

export interface ActivityItem {
  user_id: string
  full_name: string
  role: string
  activity_label: "Low" | "Medium" | "High"
  message_count: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  expires_at: string
  user: User
}

export interface CreateAdminRequest {
  full_name: string
  email: string
  password: string
}

export interface Report {
  id: string
  reporter_id: string
  reported_user_id: string
  report_type: "spam" | "harassment" | "inappropriate" | "other"
  description: string | null
  status: "pending" | "resolved" | "dismissed"
  created_at: string
  updated_at: string
  reporter_name: string
  reporter_email: string
  reported_name: string
  reported_email: string
}

export interface ApiError {
  error: string
}
