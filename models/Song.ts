type Song = {
  duration_ms: number;
  album: { images: { url: string }[]; name: string };
  name: string;
  artists: { name: string }[];
  id: string;
  songId: string;
};

export type { Song };
