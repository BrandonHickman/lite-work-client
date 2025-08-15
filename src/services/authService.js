import { fetchWithResponse } from "./fetcher";

function notifyAuthChanged() {
  try { window.dispatchEvent(new Event('auth-changed')); } catch {}
}

export function login(user) {
  return fetchWithResponse("login", {
    method: "POST",
    body: JSON.stringify(user),
  }).then((data) => {
    try { localStorage.setItem("token", data.token); } catch {}
    notifyAuthChanged();
    return data;
  });
}

export function register(user) {
  return fetchWithResponse("register", {
    method: "POST",
    body: JSON.stringify(user),
  }).then((data) => {
    try { localStorage.setItem("token", data.token); } catch {}
    notifyAuthChanged();
    return data;
  });
}

export function getUserProfile() {
  return fetchWithResponse("profile");
}

export function logout() {
  try { localStorage.removeItem("token"); } catch {}
  notifyAuthChanged();
}
