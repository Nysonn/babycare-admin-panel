import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"

interface UiState {
  sessionExpired: boolean
  sidebarCollapsed: boolean
  darkMode: boolean
}

const initialState: UiState = {
  sessionExpired: false,
  // Collapse sidebar by default on mobile (< 768px)
  sidebarCollapsed: typeof window !== "undefined" && window.innerWidth < 768,
  darkMode: typeof window !== "undefined" && localStorage.getItem("babycare_dark_mode") === "true",
}

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setSessionExpired(state, action: PayloadAction<boolean>) {
      state.sessionExpired = action.payload
    },
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload
    },
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode
      localStorage.setItem("babycare_dark_mode", String(state.darkMode))
    },
  },
})

export const { setSessionExpired, setSidebarCollapsed, toggleDarkMode } = uiSlice.actions
export default uiSlice.reducer
