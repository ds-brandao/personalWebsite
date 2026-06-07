"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * <img> with a pulsing striped skeleton overlay that fades out once the
 * image loads. Must be placed inside a `position: relative` container.
 */
export function SkeletonImage({
  className,
  alt = "",
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [loaded, setLoaded] = useState(false);

  // Callback ref catches images that completed before hydration (cache hits),
  // where onLoad never fires.
  const imgRef = useCallback((node: HTMLImageElement | null) => {
    if (node?.complete) setLoaded(true);
  }, []);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        alt={alt}
        {...props}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={className}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 bg-muted transition-opacity duration-500",
          loaded ? "opacity-0" : "opacity-100"
        )}
      >
        <div className="stripes animate-pulse" />
      </div>
    </>
  );
}
