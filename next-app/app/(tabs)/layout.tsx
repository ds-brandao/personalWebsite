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
      <main className="mx-auto max-w-5xl px-4 pb-24 md:pb-8 md:px-6">
        {children}
      </main>
      <BottomTabBar />
    </>
  );
}
