import { useAppSelector } from "../store"
import type { ToasterProps } from "react-hot-toast"

export const useToastStyles = (): ToasterProps["toastOptions"] => {
  const darkMode = useAppSelector((state) => state.ui.darkMode)

  if (darkMode) {
    return {
      style: {
        background: "#27272a",
        color: "#f4f4f5",
        border: "1px solid #3f3f46",
        borderRadius: "10px",
        fontSize: "14px",
      },
      success: {
        iconTheme: {
          primary: "#ec4899",
          secondary: "#27272a",
        },
      },
      error: {
        iconTheme: {
          primary: "#f87171",
          secondary: "#27272a",
        },
      },
    }
  }

  return {
    style: {
      background: "#ffffff",
      color: "#1e293b",
      border: "1px solid #fce7f3",
      borderRadius: "10px",
      fontSize: "14px",
    },
    success: {
      iconTheme: {
        primary: "#ec4899",
        secondary: "#ffffff",
      },
    },
    error: {
      iconTheme: {
        primary: "#ef4444",
        secondary: "#ffffff",
      },
    },
  }
}
