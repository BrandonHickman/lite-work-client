import { fetchWithResponse } from "./fetcher";

export function getMyProfile() {
  return fetchWithResponse("profile/me");
}

export function updateMyProfile(payload) {
  return fetchWithResponse(`profile/me`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function uploadAvatar(file) {
  const form = new FormData();
  form.append("avatar", file);

  return fetchWithResponse("profile/avatar", {
    method: "POST",
    body: form,
  });
}
