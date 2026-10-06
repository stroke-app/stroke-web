import { useEffect, useRef } from "react";

import { cn } from "#/lib/utils";

/**
 * The Stroke desktop app in the hero, a real screenshot inside a framed
 * hairline frame lit softly from above.
 */
export function AppWindow({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      {/* A soft light centered on the window's top edge; it fades out before
          reaching its own bounds, so it never shows a hard edge. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-[8%] -top-36 -z-10 h-72 bg-[radial-gradient(closest-side,rgb(255_255_255/0.07),transparent)]"
      />

      {/* Hairline frame, brightest along the top edge. */}
      <div className="rounded-2xl bg-linear-to-b from-white/22 via-white/8 to-white/4 p-px shadow-[0_40px_120px_-30px_rgb(0_0_0/0.9)]">
        <div className="overflow-hidden rounded-[calc(1rem-1px)]">
          <img
            src="/app-screenshot.png"
            width={2208}
            height={1371}
            loading="eager"
            alt="The Stroke app connected to a Postgres database, showing a table sidebar with row counts, bulk table actions, and quick access to SQL, dashboards, AI, schema, diagrams, and the MCP server"
            className="block w-full"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * A YouTube demo of the Stroke app, framed to match {@link AppWindow}, the
 * same light and hairline frame, wrapping a 16:9 embed.
 */
export function VideoDemo({
  videoId,
  title,
  className,
}: {
  videoId: string;
  title: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      {/* A soft light centered on the window's top edge; it fades out before
          reaching its own bounds, so it never shows a hard edge. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-[8%] -top-36 -z-10 h-72 bg-[radial-gradient(closest-side,rgb(255_255_255/0.07),transparent)]"
      />

      {/* Hairline frame, brightest along the top edge. */}
      <div className="rounded-2xl bg-linear-to-b from-white/22 via-white/8 to-white/4 p-px shadow-[0_40px_120px_-30px_rgb(0_0_0/0.9)]">
        <div className="aspect-video overflow-hidden rounded-[calc(1rem-1px)] bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}`}
            title={title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="block h-full w-full border-0"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * The launch video, self-hosted on R2 and framed to match {@link AppWindow}.
 * It starts muted the first time it scrolls into view, unless the visitor
 * prefers reduced motion; the native controls handle sound and fullscreen.
 * The browser plays the first source whose `media` query matches.
 */
export function LaunchVideo({
  sources,
  poster,
  title,
  className,
}: {
  sources: { src: string; media?: string }[];
  poster: string;
  title: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        video.play().catch(() => {});
      },
      { threshold: 0.25 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={cn("relative", className)}>
      {/* A soft light centered on the window's top edge; it fades out before
          reaching its own bounds, so it never shows a hard edge. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-[8%] -top-36 -z-10 h-72 bg-[radial-gradient(closest-side,rgb(255_255_255/0.07),transparent)]"
      />

      {/* Hairline frame, brightest along the top edge. */}
      <div className="rounded-2xl bg-linear-to-b from-white/22 via-white/8 to-white/4 p-px shadow-[0_40px_120px_-30px_rgb(0_0_0/0.9)]">
        <div className="aspect-video overflow-hidden rounded-[calc(1rem-1px)] bg-black">
          <video
            ref={ref}
            poster={poster}
            title={title}
            aria-label={title}
            muted
            loop
            playsInline
            controls
            preload="metadata"
            className="block h-full w-full"
          >
            {sources.map((s) => (
              <source key={s.src} src={s.src} media={s.media} type="video/mp4" />
            ))}
          </video>
        </div>
      </div>
    </div>
  );
}
