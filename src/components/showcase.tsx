import { XIcon } from "lucide-react";
import { useEffect, useRef } from "react";

import { Section, SectionIntro } from "#/components/page";
import { cn } from "#/lib/utils";

/**
 * Feature sections built from real screenshots and screen recordings of the
 * app. Each tile is a dark frame holding the media, with a title and one
 * sentence under it. Files live in public/shots/.
 */

export type Media =
  | { kind: "image"; src: string; width: number; height: number; alt: string; inset?: boolean }
  | { kind: "video"; src: string; poster: string; width: number; height: number; label: string }
  /** A coded product mockup, for a feature with no screenshot. */
  | { kind: "node"; node: React.ReactNode };

export type Tile = {
  title: string;
  body: string;
  media: Media;
  /** Short points under the body. */
  points?: string[];
  /** Columns out of 6 on wide screens. */
  span?: 2 | 3 | 4 | 6;
};

const SPAN = {
  2: "lg:col-span-2",
  3: "lg:col-span-3",
  4: "lg:col-span-4",
  6: "lg:col-span-6",
} as const;

/** Plays muted on a loop once it scrolls into view; a still frame with reduced motion. */
export function LoopVideo({ media }: { media: Extract<Media, { kind: "video" }> }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.3 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);
  return (
    <video
      ref={ref}
      src={media.src}
      poster={media.poster}
      width={media.width}
      height={media.height}
      muted
      loop
      playsInline
      preload="none"
      aria-label={media.label}
      className="block h-full w-full object-cover object-top-left"
    />
  );
}

function TileMedia({ media }: { media: Media }) {
  const dialog = useRef<HTMLDialogElement>(null);
  if (media.kind === "video") return <LoopVideo media={media} />;
  if (media.kind === "node")
    return <div className="h-full w-full overflow-hidden">{media.node}</div>;
  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        aria-label={`Zoom in: ${media.alt}`}
        className={cn(
          "block h-full w-full cursor-zoom-in overflow-hidden outline-offset-[-2px] focus-visible:outline-2 focus-visible:outline-ring",
          // A crop of one menu or dialog sits on the app's surface, top-aligned.
          media.inset && "px-6 pt-6 md:px-8 md:pt-8",
        )}
      >
        <img
          src={media.src}
          width={media.width}
          height={media.height}
          alt=""
          loading="lazy"
          decoding="async"
          className={cn(
            "block w-full",
            media.inset
              ? "bezel h-auto rounded-lg shadow-[0_0_0_1px_rgb(255_255_255/0.08)]"
              : "h-full object-cover object-top-left",
          )}
        />
      </button>
      {/* Esc closes a modal <dialog> natively; the click is a pointer shortcut. */}
      {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <dialog
        ref={dialog}
        aria-label={media.alt}
        onClick={() => dialog.current?.close()}
        className="lightbox m-auto max-h-none max-w-none cursor-zoom-out bg-transparent p-0"
      >
        <img
          src={media.src}
          width={media.width}
          height={media.height}
          alt={media.alt}
          className="block h-auto max-h-[92vh] w-auto max-w-[95vw] rounded-xl outline-1 -outline-offset-1 outline-white/15"
        />
        <button
          type="button"
          onClick={() => dialog.current?.close()}
          aria-label="Close"
          className="fixed top-4 right-4 flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors duration-150 hover:bg-white/20"
        >
          <XIcon className="size-5" strokeWidth={1.75} />
        </button>
      </dialog>
    </>
  );
}

export function TileGrid({ tiles, className }: { tiles: Tile[]; className?: string }) {
  return (
    <ul
      className={cn("grid grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-6", className)}
    >
      {tiles.map((tile) => (
        <li
          key={tile.title}
          className={cn("flex flex-col", SPAN[tile.span ?? 3], tile.span === 6 && "md:col-span-2")}
        >
          <div
            className={cn(
              "keep-dark dark bezel overflow-hidden rounded-xl bg-[#0a0a0b] shadow-[0_0_0_1px_color-mix(in_srgb,var(--ink)_10%,transparent)]",
              tile.span === 6 ? "aspect-[16/9]" : "aspect-[16/10]",
            )}
          >
            <TileMedia media={tile.media} />
          </div>
          <h3 className="mt-5 text-[15px] font-[560] tracking-[-0.01em] text-foreground">
            {tile.title}
          </h3>
          <p className="mt-1.5 max-w-[60ch] text-[15px] leading-relaxed text-pretty text-muted-foreground">
            {tile.body}
          </p>
          {tile.points && (
            <ul className="mt-4 space-y-2 text-[14px] leading-[1.55] text-muted-foreground">
              {tile.points.map((point) => (
                <li key={point} className="flex gap-3">
                  <span aria-hidden="true" className="mt-[0.7em] h-px w-2.5 shrink-0 bg-faint" />
                  <span className="text-pretty">{point}</span>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

export function ShowcaseSection({
  id,
  eyebrow,
  title,
  intro,
  link,
  tiles,
}: {
  id: string;
  eyebrow: string;
  title: string;
  intro: React.ReactNode;
  link?: React.ComponentProps<typeof SectionIntro>["link"];
  tiles: Tile[];
}) {
  return (
    <Section id={id}>
      <SectionIntro eyebrow={eyebrow} title={title} link={link}>
        {intro}
      </SectionIntro>
      <TileGrid tiles={tiles} className="mt-14 md:mt-20" />
    </Section>
  );
}

/** Shorthands for the files in public/shots/. */
export const shot = (
  name: string,
  width: number,
  height: number,
  alt: string,
  inset = false,
): Media => ({ kind: "image", src: `/shots/${name}.webp`, width, height, alt, inset });

export const clip = (name: string, label: string, width = 1600, height = 1004): Media => ({
  kind: "video",
  src: `/shots/${name}.mp4`,
  poster: `/shots/${name}-poster.webp`,
  width,
  height,
  label,
});
