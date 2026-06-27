import { cn } from "@/lib/utils";
import { initials as toInitials } from "@/lib/utils";

export function Avatar({
  firstName,
  lastName,
  src,
  size = 36,
  className,
}: {
  firstName?: string | null;
  lastName?: string | null;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  const label = toInitials(firstName, lastName);
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={label}
        width={size}
        height={size}
        className={cn("rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] font-semibold text-[var(--primary-hover)]",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {label}
    </span>
  );
}

/** Logo carré d'une entreprise (image ou initiale). */
export function CompanyLogo({
  name,
  src,
  size = 40,
  className,
}: {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={name}
        className={cn("rounded-lg object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--primary)] to-[#8b5cf6] font-bold text-white",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {name.trim()[0]?.toUpperCase() ?? "?"}
    </span>
  );
}
