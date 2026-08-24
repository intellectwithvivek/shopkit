/**
 * Inline SVG, because the whole point of a zero-dependency UI library is not
 * following it with a 40kB icon package. Every icon is `aria-hidden` — the
 * accessible name always comes from the control that wraps it.
 */

type IconProps = { size?: number }

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
})

export const SearchIcon = ({ size = 17 }: IconProps) => (
  <svg {...base(size)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
)

export const BagIcon = ({ size = 18 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M6 7h12l1 13H5L6 7Z" />
    <path d="M9 7a3 3 0 0 1 6 0" />
  </svg>
)

export const ArrowIcon = ({ size = 16 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
)

export const TruckIcon = ({ size = 18 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M2 7h11v9H2z" />
    <path d="M13 10h4l3 3v3h-7z" />
    <circle cx="6" cy="18" r="1.6" />
    <circle cx="17" cy="18" r="1.6" />
  </svg>
)

export const ReturnIcon = ({ size = 18 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M3 10h11a5 5 0 0 1 0 10H8" />
    <path d="m7 6-4 4 4 4" />
  </svg>
)

export const ShieldIcon = ({ size = 18 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M12 3l7 3v6c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6l7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

/**
 * Placeholder press logos, in the spirit of Logoipsum: recognisably a wordmark,
 * recognisably not a real company. Inline so the LogoCloud needs no remote host
 * and renders identically offline.
 */
export const pressLogos = [
  { name: 'Monograph', glyph: <circle cx="9" cy="9" r="7" /> },
  { name: 'Fieldnote', glyph: <path d="M3 15 9 3l6 12z" /> },
  { name: 'Provision', glyph: <rect x="3" y="3" width="12" height="12" rx="3" /> },
  { name: 'Longform', glyph: <path d="M3 9h12M9 3v12" /> },
  { name: 'Objecta', glyph: <path d="M9 2 16 9l-7 7L2 9z" /> },
] as const

export const PressLogo = ({ index }: { index: number }) => {
  const logo = pressLogos[index % pressLogos.length]
  return (
    <svg
      className="sk-logo"
      viewBox="0 0 132 20"
      role="img"
      aria-label={logo.name}
      focusable="false"
    >
      <g stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round">
        {logo.glyph}
      </g>
      <text
        x="24"
        y="14.5"
        fill="currentColor"
        fontSize="13"
        fontWeight="600"
        letterSpacing="-0.3"
      >
        {logo.name}
      </text>
    </svg>
  )
}

export const GitHubIcon = ({ size = 16 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-2.92-.89-2.92-2.94 0-.58.21-1.07.55-1.45-.05-.14-.24-.68.05-1.42 0 0 .55-.18 1.82.68a6.9 6.9 0 0 1 1.66-.22c.56 0 1.13.07 1.66.22 1.26-.86 1.82-.68 1.82-.68.29.74.1 1.28.05 1.42.34.38.55.87.55 1.45 0 2.06-1.15 2.74-2.93 2.94.3.26.56.76.56 1.54 0 1.11-.01 2-.01 2.28 0 .21.15.46.55.38A7.99 7.99 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
  </svg>
)

export const StarIcon = ({ size = 15 }: IconProps) => (
  <svg {...base(size)}>
    <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1.1 5.8L12 16.9l-5.3 2.7 1.1-5.8-4.3-4.1 5.9-.8L12 3.5Z" />
  </svg>
)

export const TerminalIcon = ({ size = 15 }: IconProps) => (
  <svg {...base(size)}>
    <rect x="3" y="4" width="18" height="16" rx="2.5" />
    <path d="m7 10 2.5 2L7 14" />
    <path d="M13 15h4" />
  </svg>
)

export const SparkIcon = ({ size = 15 }: IconProps) => (
  <svg {...base(size)}>
    <path d="M12 3v4M12 17v4M4.5 12h4M15.5 12h4M6.7 6.7l2.8 2.8M14.5 14.5l2.8 2.8M17.3 6.7l-2.8 2.8M9.5 14.5l-2.8 2.8" />
  </svg>
)
