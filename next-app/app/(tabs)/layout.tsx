import { getConfig } from "@/lib/data";
import { TopNav } from "@/components/TopNav";
import { BottomTabBar } from "@/components/BottomTabBar";

export default async function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getConfig();

  return (
    <>
      <TopNav name={config.personal.name} />
      <main className="mx-auto max-w-5xl px-4 pb-4 md:pb-8 md:px-6">
        {children}
      </main>
      <footer className="border-t border-border py-4 mb-16 md:mb-0 text-center text-xs text-muted-foreground">
        <span>&copy; {new Date().getFullYear()} {config.personal.name}</span>
        {process.env.NEXT_PUBLIC_COMMIT_SHA && (
          <span className="ml-2 font-mono opacity-60">
            {process.env.NEXT_PUBLIC_COMMIT_SHA}
          </span>
        )}
      </footer>
      <BottomTabBar />
    </>
  );
}
