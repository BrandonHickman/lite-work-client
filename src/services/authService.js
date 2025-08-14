import { fetchWithResponse } from "./fetcher";

export function login(user) {
  // user = { username, password }
  return fetchWithResponse("login", {
    method: "POST",
    body: JSON.stringify(user),
  }).then((data) => {
    // Persist token for subsequent requests
    try { localStorage.setItem("token", data.token); } catch {}
    return data;
  });
}

export function register(user) {
  // user = { username, email, password }
  return fetchWithResponse("register", {
    method: "POST",
    body: JSON.stringify(user),
  }).then((data) => {
    try { localStorage.setItem("token", data.token); } catch {}
    return data;
  });
}

export function getUserProfile() {
  return fetchWithResponse("profile"); // token auto-added by fetcher
}

export function logout() {
  try { localStorage.removeItem("token"); } catch {}
}
