export async function fetchCameras() {
  const res = await fetch('/api/cameras');
  return res.json();
}

export async function fetchLenses() {
  const res = await fetch('/api/lenses');
  return res.json();
}

export async function fetchPrice(url) {
  const res = await fetch(`/api/price?url=${encodeURIComponent(url)}`);
  return res.json();
}

export async function createReport(payload) {
  const res = await fetch('/api/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}


