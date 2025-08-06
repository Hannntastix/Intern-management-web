export async function getSertifikat() {
  const res = await fetch("/api/sertifikat");
  return res.json();
}

export async function getSertifikatById(id) {
  const res = await fetch(`/api/sertifikat/${id}`);
  return res.json();
}

export async function createSertifikat(data) {
  const res = await fetch("/api/sertifikat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateSertifikat(id, data) {
  const res = await fetch(`/api/sertifikat/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteSertifikat(id) {
  await fetch(`/api/sertifikat/${id}`, { method: "DELETE" });
}
