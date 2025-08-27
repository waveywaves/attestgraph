import * as React from "react"
import { cn } from "@/lib/utils"

export interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  content: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  children: React.ReactNode;
}

const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({ className, content, side = 'top', children, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false);

    const tooltipPositions = {
      top: 'bottom-full mb-2 left-1/2 transform -translate-x-1/2',
      right: 'left-full ml-2 top-1/2 transform -translate-y-1/2',
      bottom: 'top-full mt-2 left-1/2 transform -translate-x-1/2',
      left: 'right-full mr-2 top-1/2 transform -translate-y-1/2'
    };

    const arrowPositions = {
      top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-800',
      right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-800',
      bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-800',
      left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-800'
    };

    return (
      <div className="relative inline-block" ref={ref} {...props}>
        <div
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
          className="cursor-help"
        >
          {children}
        </div>
        {isVisible && (
          <div
            className={cn(
              "absolute z-50 px-3 py-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg max-w-xs whitespace-normal",
              tooltipPositions[side],
              className
            )}
          >
            {content}
            <div
              className={cn(
                "absolute w-0 h-0 border-4",
                arrowPositions[side]
              )}
            />
          </div>
        )}
      </div>
    );
  }
)

Tooltip.displayName = "Tooltip"

export { Tooltip }
