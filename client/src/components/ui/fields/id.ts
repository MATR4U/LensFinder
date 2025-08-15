// Utility to generate stable IDs for field components based on labels

export function stableIdFromLabel(label: string): string {
  const slug = String(label)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40);
  // djb2 hash for a short stable suffix
  let h = 5381;
  const s = String(label);
  for (let i = 0; i < s.length; i += 1) {
    h = ((h << 5) + h) ^ s.charCodeAt(i);
  }
  const suffix = (h >>> 0).toString(36);
  return slug ? `${slug}-${suffix}` : suffix;
}


