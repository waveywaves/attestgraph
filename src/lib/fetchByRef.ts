export async function fetchByRef(image: string, platform = 'linux/amd64') {
  const response = await fetch(`/api/graph?image=${encodeURIComponent(image)}&platform=${platform}`);
  
  if (!response.ok) {
    throw new Error(await response.text());
  }
  
  return response.json();
}

export async function verifyAttestation(image: string, platform = 'linux/amd64') {
  const response = await fetch('/api/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ image, platform }),
  });
  
  return response.json();
}
