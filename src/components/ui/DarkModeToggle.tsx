import { Moon, Sun } from "lucide-react"
import { useAppDispatch, useAppSelector } from "../../store"
import { toggleDarkMode } from "../../store/slices/uiSlice"

export const DarkModeToggle = () => {
  const dispatch = useAppDispatch()
  const darkMode = useAppSelector((state) => state.ui.darkMode)

  return (
    <button
      onClick={() => dispatch(toggleDarkMode())}
      title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      className="rounded-lg p-1.5 text-gray-400 hover:bg-primary-50 hover:text-primary-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors duration-150"
    >
      {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  )
}
