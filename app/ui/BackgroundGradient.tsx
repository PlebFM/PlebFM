'use client';

import Image from 'next/image';

interface BackgroundGradientProps {
  imagePath?: string;
  blur?: string;
  opacity?: string;
}

export default function BackgroundGradient({
  imagePath = '/pfm-bokeh-2.jpg',
  blur = 'blur-2xl',
  opacity = 'opacity-10',
}: BackgroundGradientProps) {
  return (
    <div className="fixed w-full h-full bg-black top-0 left-0">
      <Image
        src={imagePath}
        alt="background"
        fill
        className={`object-cover w-full h-full ${blur} ${opacity}`}
      />
    </div>
  );
}
