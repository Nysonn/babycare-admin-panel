import axios from "axios"
import store from "../store"
import { setSessionExpired } from "../store/slices/uiSlice"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("babycare_admin_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(setSessionExpired(true))
    }
    return Promise.reject(error)
  }
)

export default api
