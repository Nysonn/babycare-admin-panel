import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { Eye, EyeOff } from "lucide-react"
import toast from "react-hot-toast"
import axios from "axios"
import { loginAdmin } from "../api/endpoints/auth"
import { useAppDispatch } from "../store"
import { setCredentials } from "../store/slices/authSlice"
import { Spinner } from "../components/ui/Spinner"
import type { ApiError } from "../types"

export const Login = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState("")

  const mutation = useMutation({
    mutationFn: loginAdmin,
    onSuccess: (data) => {
      if (data.user.role !== "admin") {
        setFormError("Access denied. Admin accounts only.")
        return
      }
      dispatch(setCredentials({ token: data.token, user: data.user }))
      toast.success(`Welcome back, ${data.user.full_name}`)
      navigate("/")
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.data) {
        const apiError = error.response.data as ApiError
        setFormError(apiError.error || "Invalid email or password")
      } else {
        setFormError("Invalid email or password")
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")
    mutation.mutate({ email, password })
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 p-12 text-white">
        <div className="max-w-md text-center">
          <div className="mb-6 text-5xl font-bold tracking-tight">BabyCare</div>
          <p className="text-xl font-medium text-primary-100 leading-relaxed">
            Managing trusted care, one family at a time.
          </p>
          <div className="mt-10 flex justify-center gap-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full ${i === 0 ? "bg-white" : "bg-primary-300"}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-white px-6 py-12 dark:bg-zinc-900">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-primary-600">BabyCare Admin</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">Sign in to your admin account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-zinc-300"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-zinc-300"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 pr-10 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 dark:placeholder-zinc-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {formError && (
              <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex w-full items-center justify-center rounded-lg bg-primary-500 px-4 py-2.5 font-semibold text-white transition hover:bg-primary-600 disabled:opacity-60"
            >
              {mutation.isPending ? <Spinner size="sm" /> : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
