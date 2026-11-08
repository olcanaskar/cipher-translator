import type { SVGProps } from 'react'

export type IconName =
  | 'alert'
  | 'check'
  | 'chevronDown'
  | 'close'
  | 'code'
  | 'copy'
  | 'eye'
  | 'eyeOff'
  | 'hash'
  | 'key'
  | 'lock'
  | 'paste'
  | 'search'
  | 'share'
  | 'shield'
  | 'swap'
  | 'trash'
  | 'unlock'

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName
  size?: number
}

function iconContent(name: IconName) {
  switch (name) {
    case 'alert':
      return (
        <>
          <path d="M12 3 2.6 20.4h18.8L12 3Z" />
          <path d="M12 9v5" />
          <path d="M12 17.2h.01" />
        </>
      )
    case 'check':
      return <path d="m20 6-11 11-5-5" />
    case 'chevronDown':
      return <path d="m6 9 6 6 6-6" />
    case 'close':
      return (
        <>
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </>
      )
    case 'code':
      return (
        <>
          <path d="m8 7-5 5 5 5" />
          <path d="m16 7 5 5-5 5" />
        </>
      )
    case 'copy':
      return (
        <>
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M5 15V5a2 2 0 0 1 2-2h10" />
        </>
      )
    case 'eye':
      return (
        <>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )
    case 'eyeOff':
      return (
        <>
          <path d="m3 3 18 18" />
          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
          <path d="M9.9 5.2A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-3.2 4.2" />
          <path d="M6.6 6.6C3.6 8.6 2 12 2 12s3.5 7 10 7a10.6 10.6 0 0 0 5.4-1.6" />
        </>
      )
    case 'hash':
      return (
        <>
          <path d="M4 9h16" />
          <path d="M4 15h16" />
          <path d="M10 3 8 21" />
          <path d="m16 3-2 18" />
        </>
      )
    case 'key':
      return (
        <>
          <circle cx="7.5" cy="15.5" r="3.5" />
          <path d="m10 13 10-10" />
          <path d="m16 3 4 4" />
          <path d="m18 5 2-2" />
        </>
      )
    case 'lock':
      return (
        <>
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </>
      )
    case 'paste':
      return (
        <>
          <rect x="5" y="5" width="14" height="16" rx="2" />
          <path d="M9 5V3h6v2" />
          <path d="M9 11h6" />
          <path d="M9 15h6" />
        </>
      )
    case 'search':
      return (
        <>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </>
      )
    case 'share':
      return (
        <>
          <circle cx="18" cy="5" r="2.5" />
          <circle cx="6" cy="12" r="2.5" />
          <circle cx="18" cy="19" r="2.5" />
          <path d="m8.2 10.8 7.6-4.6" />
          <path d="m8.2 13.2 7.6 4.6" />
        </>
      )
    case 'shield':
      return (
        <>
          <path d="M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z" />
          <path d="m9 12 2 2 4-4" />
        </>
      )
    case 'swap':
      return (
        <>
          <path d="M7 4v16" />
          <path d="m4 7 3-3 3 3" />
          <path d="M17 20V4" />
          <path d="m14 17 3 3 3-3" />
        </>
      )
    case 'trash':
      return (
        <>
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="m19 6-1 14H6L5 6" />
          <path d="M10 11v5" />
          <path d="M14 11v5" />
        </>
      )
    case 'unlock':
      return (
        <>
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 7.5-2" />
        </>
      )
  }
}

export function Icon({ name, size = 20, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {iconContent(name)}
    </svg>
  )
}
