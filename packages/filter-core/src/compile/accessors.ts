export function makeGetter(path: string): (obj: any) => any {
  const parts: Array<string | number> = [];
  let i = 0;
  while (i < path.length) {
    const dot = path.indexOf('.', i);
    const bracket = path.indexOf('[', i);
    if ((dot === -1 || bracket !== -1 && bracket < dot)) {
      if (bracket === -1) {
        parts.push(path.slice(i));
        break;
      }
      if (bracket > i) parts.push(path.slice(i, bracket));
      const end = path.indexOf(']', bracket);
      const idx = path.slice(bracket + 1, end);
      parts.push(Number(idx));
      i = end + 1;
      if (i < path.length && path[i] === '.') i += 1;
    } else {
      parts.push(path.slice(i, dot));
      i = dot + 1;
    }
  }
  return (obj: any) => {
    let cur = obj;
    for (const p of parts) {
      if (cur == null) return undefined;
      cur = typeof p === 'number' ? cur[p] : cur[p as any];
    }
    return cur;
  };
}
