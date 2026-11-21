interface StrokeIconProps {
  className?: string;
  alt?: string;
}

export function StrokeIcon({ className = "size-5", alt = "Stroke" }: StrokeIconProps) {
  return (
    <>
      <img src="/icon.png" alt={alt} className={`${className} block dark:hidden`} />
      <img src="/icon-dark.png" alt={alt} className={`${className} hidden dark:block`} />
    </>
  );
}

/**
 * The mark as an app icon: a rounded tile in the page's raised color with the
 * mark for the current theme inside, so it never shows as a white square on a
 * dark page.
 */
export function StrokeAppTile({
  className = "size-12 rounded-[14px]",
  markClassName = "size-[62%]",
}: {
  className?: string;
  markClassName?: string;
}) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center bg-raised shadow-[0_10px_30px_-12px_rgb(0_0_0/0.35)] ring-1 ring-black/[0.06] dark:ring-white/[0.1] ${className}`}
    >
      <StrokeIcon className={markClassName} alt="" />
    </span>
  );
}
