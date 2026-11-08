import type { SVGProps } from 'react'
import { ICON_PATHS } from './iconPaths'

export type IconName = keyof typeof ICON_PATHS

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName
  size?: number
}

export function Icon({ name, size = 24, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 -960 960 960"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  )
}
