import Image from 'next/image';

interface AvatarProps {
  firstNym?: string;
  lastNym?: string;
  color?: string;
  size?: string;
}

export default function Avatar(props: AvatarProps) {
  let color = 'bg-pfm-neutral-600';
  let imageSrc = 'Loading';

  const colorMap = {
    tealLight: 'bg-pfm-teal-800',
    teal: 'bg-pfm-teal-500',
    tealDark: 'bg-pfm-teal-200',
    orangeLight: 'bg-pfm-orange-800',
    orange: 'bg-pfm-orange-500',
    orangeDark: 'bg-pfm-orange-200',
    purpleLight: 'bg-pfm-purple-800',
    purple: 'bg-pfm-purple-500',
    purpleDark: 'bg-pfm-purple-200',
  };

  if (props.color) color = colorMap[props.color as keyof typeof colorMap];

  if (props.lastNym) imageSrc = props.lastNym;
  let size = {
    padding: 'p-4',
    width: 'w-full',
    imageWidth: 180,
  };

  if (props.size) {
    switch (props.size) {
      case 'xs':
        size.padding = 'p-1';
        size.width = 'w-10';
    }
  }

  return (
    <>
      <div
        className={
          'rounded-full bg-white/20 ' + size.padding + ' ' + size.width
        }
      >
        <div className={'rounded-full overflow-hidden w-full h-auto ' + color}>
          <Image
            src={'/Avatar/' + imageSrc + '.png'}
            alt={props.firstNym + ' ' + props.lastNym}
            width={size.imageWidth}
            height={size.imageWidth}
            quality="100"
            blurDataURL={'/Avatar/' + imageSrc + '-blur.png'}
            placeholder="blur"
            className="object-cover w-full"
          />
        </div>
      </div>
    </>
  );
}
