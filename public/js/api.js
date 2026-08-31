const API_BASE = "";

function getToken() {
  return localStorage.getItem("ql_token");
}

async function request(path, { method = "GET", body, isForm = false } = {}) {
  const headers = {};
  if (getToken()) headers["Authorization"] = `Bearer ${getToken()}`;
  let payload;
  if (body !== undefined) {
    if (isForm) {
      payload = body; // FormData
    } else {
      headers["Content-Type"] = "application/json";
      payload = JSON.stringify(body);
    }
  }
  const res = await fetch(`${API_BASE}/api${path}`, { method, headers, body: payload });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  signup: (b) => request("/auth/signup", { method: "POST", body: b }),
  login: (b) => request("/auth/login", { method: "POST", body: b }),
  me: () => request("/auth/me"),
  onboarding: (b) => request("/auth/onboarding", { method: "PUT", body: b }),
  games: () => request("/games"),
  addGame: (form) => request("/games", { method: "POST", body: form, isForm: true }),
  updateGame: (id, form) => request(`/games/${id}`, { method: "PUT", body: form, isForm: true }),
  deleteGame: (id) => request(`/games/${id}`, { method: "DELETE" }),
  activities: () => request("/activities"),
};

export { getToken };
