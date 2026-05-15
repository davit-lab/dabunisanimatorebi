// Detects YouTube/Vimeo URLs and returns an embed URL, otherwise returns null.
export function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  // YouTube
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0`;
  // Vimeo
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}

export function isVideoFile(url: string): boolean {
  if (!url) return false;
  return /\.(mp4|webm|mov|m4v|ogg)(\?|$)/i.test(url);
}
