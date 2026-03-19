interface SpinnerProps {
  size?: "sm" | "md" | "lg"
}

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-4",
}

export const Spinner = ({ size = "md" }: SpinnerProps) => {
  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-primary-200 border-t-primary-500`}
      />
    </div>
  )
}
