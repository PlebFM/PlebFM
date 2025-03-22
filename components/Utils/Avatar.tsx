import Image from 'next/image';
import { memo } from 'react';

interface AvatarProps {
  firstNym?: string;
  lastNym?: string;
  color?: string;
  size?: string;
}

// Define size configurations
const sizeConfigs = {
  xs: {
    padding: 'p-1',
    width: 'w-10',
    imageWidth: 40,
    imageHeight: 40,
  },
  sm: {
    padding: 'p-2',
    width: 'w-16',
    imageWidth: 64,
    imageHeight: 64,
  },
  md: {
    padding: 'p-3',
    width: 'w-24',
    imageWidth: 96,
    imageHeight: 96,
  },
  lg: {
    padding: 'p-4',
    width: 'w-full',
    imageWidth: 180,
    imageHeight: 180,
  },
};

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

// Memoized Avatar component to prevent unnecessary re-renders
function Avatar(props: AvatarProps) {
  // Set default values
  let color = 'bg-pfm-neutral-600';
  let imageSrc = 'Loading';

  // Apply color mapping if provided
  if (props.color) {
    color = colorMap[props.color as keyof typeof colorMap] || color;
  }

  // Use lastNym as image source if available
  if (props.lastNym) {
    imageSrc = props.lastNym;
  }

  // Determine size config based on props (default to large)
  const sizeKey = (props.size as keyof typeof sizeConfigs) || 'lg';
  const size = sizeConfigs[sizeKey] || sizeConfigs.lg;

  // Construct avatar path
  const imagePath = `/Avatar/${imageSrc}.png`;
  const blurPath = `/Avatar/${imageSrc}-blur.png`;

  return (
    <div className={`rounded-full bg-white/20 ${size.padding} ${size.width}`}>
      <div className={`rounded-full overflow-hidden w-full h-auto ${color}`}>
        <Image
          src={imagePath}
          alt={`${props.firstNym || ''} ${props.lastNym || ''}`}
          width={size.imageWidth}
          height={size.imageHeight}
          quality={75} // Slightly reduce quality for better performance
          blurDataURL={blurPath}
          placeholder="blur"
          className="object-cover w-full"
          priority={props.size === 'lg'} // Only prioritize large avatars
          loading={props.size === 'xs' ? 'lazy' : 'eager'} // Lazy load small avatars
          // Force image caching
          unoptimized={true} // Bypass Next.js Image Optimization to allow browser caching
        />
      </div>
    </div>
  );
}

// Export memoized component to avoid re-renders when props don't change
export default memo(Avatar);
