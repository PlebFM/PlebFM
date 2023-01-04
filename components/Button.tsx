import { ReactNode } from 'react';
import { webpack } from 'next/dist/compiled/webpack/webpack';
import javascript = webpack.javascript;

interface ButtonProps {
  href?: string;
  children: ReactNode;
  className?: string;
  size?: string;
  color?: string;
  iconPosition?: string;
  style?: string;
  disabled?: boolean;
  vertical?: boolean;
  icon?: ReactNode;
  onClick?: javascript;
}

export default function Button(props: ButtonProps) {
  let className =
    'uppercase flex tracking-[0.75rem] justify-center items-center';
  if (props.iconPosition === 'left' && !props.vertical)
    className += ' flex-row-reverse space-x-reverse';
  if (props.vertical) className += ' flex-col';

  if (props.style !== 'free') className += ' border border-2';

  if (props.disabled)
    className += ' border-pfm-neutral-700 text-pfm-neutral-700';
  else if (props.color === 'orange')
    className += ' border-pfm-orange-800 text-pfm-orange-800';

  if (!props.disabled && props.color !== 'orange')
    className += ' drop-shadow-glow-white';
  else if (!props.disabled && props.color === 'orange')
    className += ' drop-shadow-glow-white';

  if (props.size === 'large') className += ' p-6 space-x-4 text-2xl';
  else if (props.size === 'small') className += ' p-3 space-x-2 text-base';
  else className += ' p-5 space-x-3 text-xl';
  if (props.className) className += ' ' + props.className;

  const Icon = () => {
    if (!props.icon) {
      return <></>;
    }
    let iconClassName =
      props.size === 'large'
        ? 'w-6 h-6'
        : props.size === 'small'
        ? 'w-4 h-4'
        : 'w-5 h-5';
    if (props.iconPosition === 'left') iconClassName += ' order-0';
    return (
      <span
        className={
          props.size === 'large'
            ? 'w-6 h-6'
            : props.size === 'small'
            ? 'w-4 h-4'
            : 'w-5 h-5'
        }
      >
        {props.icon}
      </span>
    );
  };

  if (props.href) {
    return (
      <a href={props.href} className={className}>
        <span>{props.children}</span>
        <Icon />
      </a>
    );
  } else {
    return (
      <button
        className={className}
        disabled={props.disabled}
        onClick={props.onClick}
      >
        <span>{props.children}</span>
        <Icon />
      </button>
    );
  }
}
