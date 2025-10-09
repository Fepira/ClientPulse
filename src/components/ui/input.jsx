import * as React from "react"
import { cn } from "@/lib/utils"

const inputVariants = {
  base: "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  size: {
    default: "h-10",
    sm: "h-9 text-xs",
  }
};

const Input = React.forwardRef(({ className, type, size = 'default', ...props }, ref) => {
  return (
    (<input
      type={type}
      className={cn(
        inputVariants.base,
        inputVariants.size[size],
        className
      )}
      ref={ref}
      {...props} />)
  );
})
Input.displayName = "Input"

const inputFieldSmClass = cn(inputVariants.base, inputVariants.size.sm);

export { Input, inputFieldSmClass };