import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SkeletonImage } from "@/components/SkeletonImage";
import { SocialIcons } from "@/components/SocialIcons";
import type { Config } from "@/types";

export function Hero({ config }: { config: Config }) {
  const { personal, social } = config;
  const [first, ...rest] = personal.name.split(" ");

  return (
    <section className="pt-10 pb-10 md:pt-[clamp(40px,7vw,76px)] md:pb-[clamp(40px,6vw,72px)]">
      {/* Mobile: name + portrait side by side, lead/actions full width below.
          Wide (≥861px): text column vs portrait column, as in the prototype. */}
      <div className="grid grid-cols-[1fr_auto] items-center gap-x-5 gap-y-7 wide:grid-cols-[1.35fr_0.9fr] wide:gap-x-[clamp(28px,5vw,64px)] wide:gap-y-0">
        <h1 className="font-display text-[clamp(32px,9vw,68px)] leading-[1.02] font-bold tracking-[-0.035em] wide:mb-5.5">
          {first}
          <br />
          {rest.join(" ")}
          <span className="text-faint">.</span>
        </h1>

        <div className="w-[36vw] max-w-48 wide:row-span-2 wide:w-auto wide:max-w-none">
          <div className="relative aspect-4/5 overflow-hidden rounded-[22px] border border-border-strong bg-muted shadow-[var(--shadow-deep)]">
            <SkeletonImage
              src="/images/portrait.jpg"
              alt={personal.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="mt-3 flex justify-center wide:hidden">
            <SocialIcons
              github={social.github.url}
              linkedin={social.linkedin}
              email={social.email}
              size="sm"
            />
          </div>
          <div className="mt-4 hidden wide:block">
            <SocialIcons
              github={social.github.url}
              linkedin={social.linkedin}
              email={social.email}
            />
          </div>
        </div>

        <div className="col-span-2 wide:col-span-1">
          <p className="mb-7 max-w-[38ch] text-[clamp(17px,1.6vw,19px)] leading-relaxed text-pretty text-muted-foreground">
            {personal.lead}
          </p>
          <div className="mb-7.5 flex flex-wrap items-center gap-3">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4.5 py-2.75 text-[14.5px] font-semibold tracking-[-0.01em] whitespace-nowrap text-primary-foreground transition-all duration-300 ease-snap hover:bg-[var(--primary-press)] hover:shadow-[0_8px_22px_-8px_var(--primary)] active:translate-y-px"
            >
              View projects <ArrowRight className="size-3.75" strokeWidth={2} />
            </Link>
            <a
              href={`mailto:${social.email}`}
              className="inline-flex items-center rounded-full border border-border-strong px-4.5 py-2.75 text-[14.5px] font-semibold tracking-[-0.01em] whitespace-nowrap text-foreground transition-all duration-300 ease-snap hover:border-primary-line hover:bg-primary-soft hover:text-primary active:translate-y-px"
            >
              Get in touch
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-4.5 text-[13.5px] text-faint">
            <span className="whitespace-nowrap">{personal.location}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
