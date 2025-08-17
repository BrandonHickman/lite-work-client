import { fetchWithResponse } from "./fetcher";

export function getMyProfile() {
  return fetchWithResponse("profile");
}

export function updateMyProfile(patch) {
  return fetchWithResponse("profile", {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function uploadAvatar(file) {
  const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000';
  const token = localStorage.getItem("token");
  const form = new FormData();
  form.append("avatar", file);
  const res = await fetch(`${API_BASE}/profile/avatar/`, {
    method: "POST",
    headers: token ? { Authorization: `Token ${token}` } : {},
    body: form,
  });
  if (!res.ok) throw Error(String(res.status));
  return res.json();
}
