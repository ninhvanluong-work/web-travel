export const BUNNY_CDN_DOMAIN = 'vz-186cf1b9-231.b-cdn.net';

export function extractM3u8Url(embedUrl: string): string {
  const parts = embedUrl.split('/');
  const videoGuid = parts[parts.length - 1].split('?')[0];
  return `https://${BUNNY_CDN_DOMAIN}/${videoGuid}/playlist.m3u8`;
}
