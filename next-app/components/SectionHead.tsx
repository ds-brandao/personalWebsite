import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

interface SectionHeadProps {
  kicker: string;
  title?: string;
  link?: { href: string; label: string; external?: boolean };
}

export function SectionHead({ kicker, title, link }: SectionHeadProps) {
  const linkClass =
    "group/link inline-flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap text-muted-foreground transition-all duration-300 ease-snap hover:gap-2.5 hover:text-primary";

  return (
    <div
      className={
        title
          ? "mb-7.5 flex flex-wrap items-baseline justify-between gap-4"
          : "mb-2.5 flex flex-wrap items-baseline justify-between gap-4"
      }
    >
      <div>
        <span className="kicker">{kicker}</span>
        {title && (
          <h2 className="mt-2 font-display text-[clamp(22px,3vw,28px)] font-semibold tracking-[-0.02em]">
            {title}
          </h2>
        )}
      </div>
      {link &&
        (link.external ? (
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            {link.label} <ExternalLink className="size-3.25" strokeWidth={1.8} />
          </a>
        ) : (
          <Link href={link.href} className={linkClass}>
            {link.label} <ArrowRight className="size-3.75" strokeWidth={1.9} />
          </Link>
        ))}
    </div>
  );
}
