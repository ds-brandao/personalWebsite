import { getConfig } from "@/lib/data";
import { TopNav } from "@/components/TopNav";
import { BottomTabBar } from "@/components/BottomTabBar";
import { SocialIcons } from "@/components/SocialIcons";

export default async function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getConfig();

  return (
    <div className="flex min-h-dvh flex-col">
      <TopNav name={config.personal.name} />
      <main className="mx-auto w-full max-w-[1080px] flex-1 px-(--pad)">
        {children}
      </main>
      <footer className="mb-16 border-t border-border bg-bg-tint md:mb-0">
        <div className="mx-auto flex max-w-[1080px] flex-wrap items-center justify-between gap-4 px-(--pad) py-7.5 text-[13px] text-faint">
          <span>
            &copy; {new Date().getFullYear()} {config.personal.name}
            {process.env.NEXT_PUBLIC_COMMIT_SHA && (
              <span className="ml-2 font-mono opacity-60">
                {process.env.NEXT_PUBLIC_COMMIT_SHA}
              </span>
            )}
          </span>
          <span className="font-mono text-xs">{config.personal.location}</span>
          <SocialIcons
            github={config.social.github.url}
            linkedin={config.social.linkedin}
            size="sm"
          />
        </div>
      </footer>
      <BottomTabBar />
    </div>
  );
}
