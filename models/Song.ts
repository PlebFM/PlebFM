type Song = {
  duration_ms: number,
  album: {images: {url: string}[], name: string},
  name: string,
  artists: {name: string}[],
}

export type { Song }