import type { Region } from "@/lib/taxonomy";

// Thin monochrome line icons. They inherit color via `currentColor`, so wrapping them
// in a text-brand-* class tints them in the sage palette. Flag emoji stay (they're data).
export type IconName =
  | "link"
  | "gauge"
  | "compass"
  | "factory"
  | "globe"
  | "inbox"
  | "check"
  | "sparkles"
  | "leaf"
  // regions
  | "crescent"
  | "columns"
  | "pagoda"
  | "sun"
  | "star"
  | "mountains"
  | "wave"
  // contact / social
  | "mail"
  | "phone"
  | "pin"
  | "linkedin"
  | "instagram"
  | "x";

const PATHS: Record<IconName, React.ReactNode> = {
  link: (
    <>
      <path d="M9 15l6-6" />
      <path d="M11 6l1-1a4 4 0 0 1 6 6l-1 1" />
      <path d="M13 18l-1 1a4 4 0 0 1-6-6l1-1" />
    </>
  ),
  gauge: (
    <>
      <path d="M3.5 15a8.5 8.5 0 1 1 17 0" />
      <path d="M12 14l3.5-3" />
      <circle cx="12" cy="14" r="1.1" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5l-2 5-5 2 2-5z" />
    </>
  ),
  factory: (
    <>
      <path d="M3 20V11l5 3V11l5 3V8l5 3v9z" />
      <path d="M3 20h18" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z" />
    </>
  ),
  inbox: (
    <>
      <path d="M4 13l2-7h12l2 7" />
      <path d="M4 13v5h16v-5h-4.5a3.5 3.5 0 0 1-7 0z" />
    </>
  ),
  check: <path d="M5 12l4 4L19 7" />,
  sparkles: (
    <>
      <path d="M12 4l1.4 4L18 9.4 13.4 11 12 15l-1.4-4L6 9.4 10.6 8z" />
      <path d="M18.5 14.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" />
    </>
  ),
  leaf: (
    <>
      <path d="M20 4C9 4 4 9 4 18c0 1 .3 2 .3 2S14 20 18 12c-3 1-6 1-8 3 1-4 4-7 10-11z" />
    </>
  ),
  crescent: <path d="M16 4a8 8 0 1 0 0 16 6 6 0 0 1 0-16z" />,
  columns: (
    <>
      <path d="M4 9l8-5 8 5" />
      <path d="M6 9v8M10 9v8M14 9v8M18 9v8" />
      <path d="M4 20h16" />
    </>
  ),
  pagoda: (
    <>
      <path d="M4 8h16M6 8l-2 3h16l-2-3" />
      <path d="M7 11v3h10v-3" />
      <path d="M9 14v4h6v-4" />
      <path d="M11 4h2" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" />
    </>
  ),
  star: <path d="M12 4l2.3 5.2 5.7.5-4.3 3.8 1.3 5.6L12 16.8 7 19.7l1.3-5.6L4 10.3l5.7-.5z" />,
  mountains: <path d="M3 18l6-9 4 5 2-3 6 7z" />,
  wave: (
    <>
      <path d="M3 9c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
      <path d="M3 14c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3.5 7l8.5 6 8.5-6" />
    </>
  ),
  phone: <path d="M5 4h3l1.6 4-2 1.2a11 11 0 0 0 5.2 5.2l1.2-2 4 1.6v3a2 2 0 0 1-2.2 2A16 16 0 0 1 3.2 6.2 2 2 0 0 1 5 4z" />,
  pin: (
    <>
      <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M7 10v7M7 7.5v.01M11 17v-4a2 2 0 0 1 4 0v4" />
    </>
  ),
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="0.6" />
    </>
  ),
  x: <path d="M5 5l14 14M19 5L5 19" />,
};

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}

export const REGION_ICON: Record<Region, IconName> = {
  MIDDLE_EAST: "crescent",
  EUROPE: "columns",
  ASIA: "pagoda",
  AFRICA: "sun",
  NORTH_AMERICA: "star",
  SOUTH_AMERICA: "mountains",
  OCEANIA: "wave",
};
