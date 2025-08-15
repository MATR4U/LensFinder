export function bestFor(name: string, type?: string) {
  if (/macro/i.test(name)) return 'Macro & close-ups';
  if (/70-200|100-400|100-500|200-600/i.test(name)) return 'Sports & wildlife';
  if (/85mm|90mm/i.test(name)) return 'Portraits & low light';
  if (/50mm|35mm|24-70/i.test(name)) return 'Everyday & travel';
  if (/14-24|14mm|16mm|8-16/i.test(name)) return 'Landscapes & astro';
  if (type && /tele/i.test(type)) return 'Reach & action';
  if (type && /wide/i.test(type)) return 'Landscapes & interiors';
  return 'All‑round';
}

export function tagFromBestFor(label: string) {
  if (/macro/i.test(label)) return 'Macro';
  if (/wildlife|sports/i.test(label)) return 'Action';
  if (/portrait/i.test(label)) return 'Portrait';
  if (/travel|everyday/i.test(label)) return 'Travel';
  if (/landscapes|astro/i.test(label)) return 'Landscape';
  return 'General';
}


