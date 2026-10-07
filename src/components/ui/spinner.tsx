import { cn } from "cn"
import { Loader as Loader2Icon, type IconProps } from "reicon-react"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      weight="Filled"
      className={cn("size-4 animate-spin", className)}
      // Reicon pins `color` to a plain string; React's SVG attributes let it
      // be `undefined`, which exactOptionalPropertyTypes rejects. The props
      // actually used here (className, data-*) are identical on both sides.
      {...(props as IconProps)}
    />
  )
}

export { Spinner }
