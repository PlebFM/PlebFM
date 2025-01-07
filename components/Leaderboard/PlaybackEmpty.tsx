export const PlaybackEmpty = () => {
  return (
    <div className="text-center space-y-4">
      <div className="w-32 h-32 mx-auto mb-6 rounded-lg bg-gradient-to-br from-pfm-purple-200 to-pfm-purple-400 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-16 h-16 text-white/50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
      </div>
      <h3 className="text-2xl font-bold">No Track Playing</h3>
      <p className="text-white/75 text-lg">
        Queue up some songs to get the party started! 🎵
      </p>
    </div>
  );
};
