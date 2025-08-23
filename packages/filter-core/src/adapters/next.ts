export function toURLSearchParams(obj: Record<string, string | string[] | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) {
    if (v == null) continue;
    if (Array.isArray(v)) {
      for (const item of v) sp.append(k, item);
    } else {
      if (v !== '') sp.set(k, v);
    }
  }
  return sp;
}
