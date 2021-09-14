// obtained from 'react-icons' library types
export interface IconBaseProps extends React.SVGAttributes<SVGElement> {
  children?: React.ReactNode
  size?: string | number
  color?: string
  title?: string
}

export type SeparatorPosition = 'left' | 'right';

export type IconType = (props: IconBaseProps) => JSX.Element;
