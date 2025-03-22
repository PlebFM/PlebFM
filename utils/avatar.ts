/**
 * Avatar preloading and caching utility
 */

const AVATAR_TYPES = [
  'Bankasaurus',
  'Chaditha',
  'Fawkes',
  'Goldbug',
  'Honeybadger',
  'Kitty',
  'Loading',
];

/**
 * Preloads avatar images by creating Image objects
 * This ensures avatars are cached before they're needed
 */
export function preloadAvatars(): void {
  if (typeof window === 'undefined') return;

  // Create a hidden div to store preloaded images
  const preloadContainer = document.createElement('div');
  preloadContainer.style.display = 'none';
  document.body.appendChild(preloadContainer);

  // For each avatar type, preload both normal and blur versions
  AVATAR_TYPES.forEach(avatar => {
    // Preload main avatar
    const img = new Image();
    img.src = `/Avatar/${avatar}.png`;
    preloadContainer.appendChild(img);

    // Preload blur placeholder
    const blurImg = new Image();
    blurImg.src = `/Avatar/${avatar}-blur.png`;
    preloadContainer.appendChild(blurImg);
  });

  // Clean up after a short delay to ensure images load
  setTimeout(() => {
    if (preloadContainer.parentNode) {
      document.body.removeChild(preloadContainer);
    }
  }, 5000);
}

/**
 * Get a mapping of all available avatars
 * This is useful for avatar selection UI
 */
export function getAvatarOptions() {
  return AVATAR_TYPES.filter(avatar => avatar !== 'Loading').map(avatar => ({
    id: avatar.toLowerCase(),
    name: avatar,
    src: `/Avatar/${avatar}.png`,
    blurSrc: `/Avatar/${avatar}-blur.png`,
  }));
}
