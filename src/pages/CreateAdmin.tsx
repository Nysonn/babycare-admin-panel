import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Eye, EyeOff, UserPlus } from "lucide-react"
import toast from "react-hot-toast"
import axios from "axios"
import { createAdmin } from "../api/endpoints/admin"
import { Spinner } from "../components/ui/Spinner"
import type { ApiError } from "../types"

interface FormValues {
  full_name: string
  email: string
  password: string
  confirm_password: string
}

interface FormErrors {
  full_name?: string
  email?: string
  password?: string
  confirm_password?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const validate = (values: FormValues): FormErrors => {
  const errors: FormErrors = {}

  if (!values.full_name.trim()) {
    errors.full_name = "Full name is required."
  }

  if (!values.email.trim()) {
    errors.email = "Email is required."
  } else if (!EMAIL_RE.test(values.email)) {
    errors.email = "Please enter a valid email address."
  }

  if (!values.password) {
    errors.password = "Password is required."
  } else if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters."
  }

  if (!values.confirm_password) {
    errors.confirm_password = "Please confirm your password."
  } else if (values.confirm_password !== values.password) {
    errors.confirm_password = "Passwords do not match."
  }

  return errors
}

const EMPTY: FormValues = {
  full_name: "",
  email: "",
  password: "",
  confirm_password: "",
}

export const CreateAdmin = () => {
  const [values, setValues] = useState<FormValues>(EMPTY)
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const set = (field: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const mutation = useMutation({
    mutationFn: () =>
      createAdmin({
        full_name: values.full_name.trim(),
        email: values.email.trim(),
        password: values.password,
      }),
    onSuccess: () => {
      toast.success("Admin account created successfully")
      setValues(EMPTY)
      setErrors({})
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.data) {
        const apiErr = error.response.data as ApiError
        if (error.response.status === 409) {
          toast.error("An account with this email already exists")
        } else {
          toast.error(apiErr.error || "Failed to create admin account")
        }
      } else {
        toast.error("Failed to create admin account")
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(values)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    mutation.mutate()
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-[480px]">
        <div className="rounded-xl bg-white p-8 shadow-sm dark:bg-zinc-900">
          {/* Card header */}
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-zinc-100">New Admin Account</h2>
              <p className="text-xs text-slate-400 dark:text-zinc-500">Fill in the details below</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Full Name */}
            <Field
              label="Full Name"
              htmlFor="full_name"
              error={errors.full_name}
            >
              <input
                id="full_name"
                type="text"
                value={values.full_name}
                onChange={set("full_name")}
                placeholder="Jane Doe"
                className={inputClass(!!errors.full_name)}
              />
            </Field>

            {/* Email */}
            <Field label="Email Address" htmlFor="email" error={errors.email}>
              <input
                id="email"
                type="email"
                value={values.email}
                onChange={set("email")}
                placeholder="jane@example.com"
                className={inputClass(!!errors.email)}
              />
            </Field>

            {/* Password */}
            <Field label="Password" htmlFor="password" error={errors.password}>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={values.password}
                  onChange={set("password")}
                  placeholder="Min. 8 characters"
                  className={`${inputClass(!!errors.password)} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            {/* Confirm Password */}
            <Field
              label="Confirm Password"
              htmlFor="confirm_password"
              error={errors.confirm_password}
            >
              <div className="relative">
                <input
                  id="confirm_password"
                  type={showConfirm ? "text" : "password"}
                  value={values.confirm_password}
                  onChange={set("confirm_password")}
                  placeholder="Repeat password"
                  className={`${inputClass(!!errors.confirm_password)} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="mt-2 flex w-full items-center justify-center rounded-lg bg-primary-500 py-2.5 font-semibold text-white hover:bg-primary-600 transition-colors disabled:opacity-60"
            >
              {mutation.isPending ? <Spinner size="sm" /> : "Create Admin Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

interface FieldProps {
  label: string
  htmlFor: string
  error?: string
  children: React.ReactNode
}

const Field = ({ label, htmlFor, error, children }: FieldProps) => (
  <div>
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-zinc-300">
      {label}
    </label>
    {children}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
)

const inputClass = (hasError: boolean) =>
  `w-full rounded-lg border ${
    hasError ? "border-red-400 focus:ring-red-100" : "border-slate-200 focus:ring-primary-100 dark:border-zinc-700 dark:focus:ring-primary-900/40"
  } px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-primary-400 focus:ring-2 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500`
