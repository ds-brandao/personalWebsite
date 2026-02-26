export default function Home() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div>
        <h1 className="font-display text-6xl font-bold gradient-text">
          Daniel Brandao
        </h1>
        <p className="text-text-secondary mt-4 text-lg">
          Theme test — warm ember palette
        </p>
        <div className="flex gap-3 mt-6">
          <div className="w-12 h-12 rounded bg-ember" />
          <div className="w-12 h-12 rounded bg-ember-glow" />
          <div className="w-12 h-12 rounded bg-amber" />
          <div className="w-12 h-12 rounded bg-coral" />
        </div>
      </div>
    </div>
  );
}
