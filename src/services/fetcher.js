const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000';

const checkError = (res) => {
  if (!res.ok) throw Error(String(res.status));
  return res;
};

const checkErrorJson = (res) => checkError(res).json();

const catchError = (err) => {
  if (err.message === '401') {
    window.location.href = "/login";
    return;
  }
  if (err.message === '404') {
    console.warn("Resource not found (404)");
    return null;
  }
  throw err;
};

// Auto-merge headers + include token if present
function buildHeaders(extra = {}, body) {
  const token = (() => {
    try { return localStorage.getItem("token"); } catch { return null; }
  })();

  // Only set JSON content-type if NOT sending FormData
  const contentType =
    body instanceof FormData ? {} : { "Content-Type": "application/json" };

  return {
    ...contentType,
    ...(token ? { Authorization: `Token ${token}` } : {}),
    ...extra,
  };
}

// Base fetchers – `resource` is a path relative to API_BASE
export const fetchWithResponse = (resource, options = {}) =>
  fetch(`${API_BASE}/${resource}`, {
    ...options,
    headers: buildHeaders(options.headers, options.body),
  })
    .then(checkErrorJson)
    .catch(catchError);

export const fetchWithoutResponse = (resource, options = {}) =>
  fetch(`${API_BASE}/${resource}`, {
    ...options,
    headers: buildHeaders(options.headers, options.body),
  })
    .then(checkError)
    .catch(catchError);
