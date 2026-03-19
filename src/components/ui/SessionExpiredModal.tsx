import { useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../../store"
import { clearCredentials } from "../../store/slices/authSlice"
import { setSessionExpired } from "../../store/slices/uiSlice"

export const SessionExpiredModal = () => {
  const sessionExpired = useAppSelector((state) => state.ui.sessionExpired)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  if (!sessionExpired) return null

  const handleLoginAgain = () => {
    dispatch(clearCredentials())
    dispatch(setSessionExpired(false))
    navigate("/login")
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-2xl text-center dark:bg-zinc-900">
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/40">
            <svg
              className="h-7 w-7 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z"
              />
            </svg>
          </div>
        </div>
        <h2 className="mb-2 text-xl font-bold text-slate-800 dark:text-zinc-100">Session Expired</h2>
        <p className="mb-6 text-sm text-slate-500 dark:text-zinc-400">
          Your session has expired. Please log in again.
        </p>
        <button
          onClick={handleLoginAgain}
          className="w-full rounded-lg bg-primary-500 px-4 py-2.5 font-semibold text-white hover:bg-primary-600 transition-colors"
        >
          Log In Again
        </button>
      </div>
    </div>
  )
}
