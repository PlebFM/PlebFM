export const PUBLIC_HOST_FIELDS =
  'hostId spotifyId hostName shortName accentColor welcomeMessage';
export function publicHost(host: any) {
  return {
    hostId: host.hostId,
    spotifyId: host.spotifyId,
    hostName: host.hostName ?? '',
    shortName: host.shortName ?? '',
    accentColor: host.accentColor ?? '#a855f7',
    welcomeMessage: host.welcomeMessage ?? '',
  };
}
export function hostUpdates(body: any) {
  const update: Record<string, string> = {};
  if ('hostName' in body) {
    if (
      typeof body.hostName !== 'string' ||
      !body.hostName.trim() ||
      body.hostName.trim().length > 80
    )
      throw new Error('Enter a name of 1–80 characters');
    update.hostName = body.hostName.trim();
  }
  if ('shortName' in body) {
    if (
      typeof body.shortName !== 'string' ||
      !/^[a-z0-9][a-z0-9-]{1,39}$/.test(body.shortName) ||
      ['api', 'host', 'checkout', '_next', '404', '500'].includes(
        body.shortName,
      )
    )
      throw new Error(
        'Use 2–40 lowercase letters, numbers, or hyphens for the URL',
      );
    update.shortName = body.shortName;
  }
  if ('accentColor' in body) {
    if (
      typeof body.accentColor !== 'string' ||
      !/^#[a-fA-F0-9]{6}$/.test(body.accentColor)
    )
      throw new Error('Choose a valid color');
    update.accentColor = body.accentColor;
  }
  if ('welcomeMessage' in body) {
    if (
      typeof body.welcomeMessage !== 'string' ||
      body.welcomeMessage.length > 160
    )
      throw new Error('Welcome message must be under 160 characters');
    update.welcomeMessage = body.welcomeMessage.trim();
  }
  if (!Object.keys(update).length) throw new Error('No settings supplied');
  return update;
}
