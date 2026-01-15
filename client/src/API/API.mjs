const SERVER_URL = "http://localhost:3001";

// Ottieni la lista delle parti disponibili (BAND, HEAD, STONE)
export async function fetchRingPartsList() {
  const res = await fetch(`${SERVER_URL}/api/3dmodels-ring/parts`);
  if (!res.ok) throw new Error("Errore nel recupero lista parti");
  return res.json();
}

// Ottieni il file 3D di una parte specifica (ritorna un blob)
export async function fetchRingPartFile(type, filename) {
  const res = await fetch(
    `${SERVER_URL}/api/3dmodels-ring/${type}/${filename}`
  );
  if (!res.ok) throw new Error("Errore nel recupero file 3D");
  return await res.blob();
}
