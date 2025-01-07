import Link from 'next/link';
import React from 'react';

interface FloatingControlsProps {
  showControls: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export function FloatingControls({
  showControls,
  isFullscreen,
  onToggleFullscreen,
}: FloatingControlsProps) {
  return (
    <div
      className={`fixed top-4 left-4 z-[100] flex gap-2 transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <Link
        href="/host/dashboard"
        target="_blank"
        className="p-2 rounded-lg bg-pfm-purple-300/50 hover:bg-pfm-purple-300/75 transition-colors text-white"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </Link>
      <button
        onClick={onToggleFullscreen}
        className="p-2 rounded-lg bg-pfm-purple-300/50 hover:bg-pfm-purple-300/75 transition-colors text-white"
      >
        {isFullscreen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
