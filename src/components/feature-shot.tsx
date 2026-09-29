import { Maximize2Icon, XIcon } from "lucide-react";
import { useRef } from "react";

import { cn } from "#/lib/utils";

/**
 * A real screenshot from the app inside a feature tile. Files live in
 * public/features/; pass the image's true pixel size so the tile reserves
 * the right space before it loads. Clicking it opens the full-resolution
 * image in a modal dialog (Esc, the close button, or any click closes it).
 */
export function FeatureShot({
  src,
  width,
  height,
  alt,
  flush = false,
}: {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** Edge to edge inside a frame that already has its own radius and border. */
  flush?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        aria-label={`Zoom in: ${alt}`}
        className={cn(
          "group/shot relative block w-full cursor-zoom-in outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring",
          !flush && "rounded-lg",
        )}
      >
        <img
          src={src}
          width={width}
          height={height}
          alt=""
          loading="lazy"
          decoding="async"
          className={cn(
            "block h-auto w-full",
            !flush &&
              "rounded-lg outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10",
          )}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-2.5 right-2.5 flex size-8 items-center justify-center rounded-lg bg-background/85 text-foreground opacity-0 shadow-sm backdrop-blur-sm transition-opacity duration-150 group-hover/shot:opacity-100 group-focus-visible/shot:opacity-100"
        >
          <Maximize2Icon className="size-4" strokeWidth={1.75} />
        </span>
      </button>

      {/* Esc closes a modal <dialog> natively; the click is a pointer shortcut. */}
      {/* oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <dialog
        ref={dialog}
        aria-label={alt}
        onClick={() => dialog.current?.close()}
        className="lightbox m-auto max-h-none max-w-none cursor-zoom-out bg-transparent p-0"
      >
        <img
          src={src}
          width={width}
          height={height}
          alt={alt}
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
