import { cn } from "@/lib/utils";

interface StripedPatternProps {
  className?: string;
  stripeColor?: string;
  backgroundColor?: string;
  stripeWidth?: number;
  stripeAngle?: number;
  opacity?: number;
}

export function StripedPattern({
  className,
  stripeColor = "rgba(255, 255, 255, 0.05)",
  backgroundColor = "transparent",
  stripeWidth = 20,
  stripeAngle = 45,
  opacity = 1,
}: StripedPatternProps) {
  const patternId = `striped-pattern-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div
      className={cn("absolute inset-0 overflow-hidden", className)}
      style={{ opacity }}
    >
      <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id={patternId}
            width={stripeWidth * 2}
            height={stripeWidth * 2}
            patternUnits="userSpaceOnUse"
            patternTransform={`rotate(${stripeAngle})`}
          >
            <rect width={stripeWidth * 2} height={stripeWidth * 2} fill={backgroundColor} />
            <rect width={stripeWidth} height={stripeWidth * 2} fill={stripeColor} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}
