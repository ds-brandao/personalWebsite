import { EmberCanvas } from "@/components/EmberCanvas";

export default function Home() {
  return (
    <>
      <EmberCanvas className="fixed inset-0 z-0" />
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <h1 className="font-display text-6xl font-bold gradient-text">
          Ember Canvas
        </h1>
      </div>
    </>
  );
}
