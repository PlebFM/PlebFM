// Keep this allowlist at every boundary that serializes a host to a browser.
export type PublicHost = {
  hostName?: string;
  shortName?: string;
  spotifyId: string;
  hostId: string;
};

export const PUBLIC_HOST_PROJECTION = {
  _id: 0,
  hostName: 1,
  shortName: 1,
  spotifyId: 1,
  hostId: 1,
};

export const toPublicHost = (host: PublicHost): PublicHost => ({
  ...(typeof host.hostName === 'string' ? { hostName: host.hostName } : {}),
  ...(typeof host.shortName === 'string' ? { shortName: host.shortName } : {}),
  spotifyId: host.spotifyId,
  hostId: host.hostId,
});
