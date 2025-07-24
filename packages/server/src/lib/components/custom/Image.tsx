import { cn } from "../../utils";

type Props = {
  src?: string | null;
  alt?: string | null;
  className?: string;
  [key: string]: any;
};

export function Image({ src, alt, className, ...props }: Props) {
  return (
    <img
      src={src ?? "/static/haitheLogo.webp"}
      alt={alt || "default"}
      className={cn(className)}
      {...props}
      onError={(e) => {
        e.currentTarget.src = "/static/haitheLogo.webp";
      }}
    />
  );
}