import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { User } from "../../types"

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  token: localStorage.getItem("babycare_admin_token"),
  user: JSON.parse(localStorage.getItem("babycare_admin_user") || "null"),
  isAuthenticated: !!localStorage.getItem("babycare_admin_token"),
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ token: string; user: User }>) {
      state.token = action.payload.token
      state.user = action.payload.user
      state.isAuthenticated = true
      localStorage.setItem("babycare_admin_token", action.payload.token)
      localStorage.setItem("babycare_admin_user", JSON.stringify(action.payload.user))
    },
    clearCredentials(state) {
      state.token = null
      state.user = null
      state.isAuthenticated = false
      localStorage.removeItem("babycare_admin_token")
      localStorage.removeItem("babycare_admin_user")
    },
  },
})

export const { setCredentials, clearCredentials } = authSlice.actions
export default authSlice.reducer
