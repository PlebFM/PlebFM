// Public origin shared by venue links, QR codes and domain ownership checks.
export function appOrigin() {
  return new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://plebfm.lwn.lol')
    .origin;
}

export function venueUrl(shortName: string) {
  return `${appOrigin()}/${encodeURIComponent(shortName)}`;
}
