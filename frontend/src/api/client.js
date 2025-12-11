const TOKEN_STORAGE_KEY = "spa-villa-rish/admin-token";
const DEFAULT_BASE = "/api";

const baseUrl = (() => {
  const envUrl = process.env.REACT_APP_API_URL;
  if (!envUrl) return DEFAULT_BASE;
  return envUrl.endsWith("/") ? envUrl.slice(0, -1) : envUrl;
})();

export class ApiError extends Error {
  constructor(status, payload) {
    super(payload?.error || "Request failed");
    this.status = status;
    this.payload = payload;
  }
}

export const getAuthToken = () => {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const setAuthToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }
};

const request = async (path, { method = "GET", body, auth = false } = {}) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = getAuthToken();
    if (!token) {
      throw new ApiError(401, { error: "Authentication required" });
    }
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, data);
  }

  return data;
};

export const api = {
  login: (username, password) => request("/auth/login", { method: "POST", body: { username, password } }),
  listServices: () => request("/services"),
  upsertService: (payload) => request("/services", { method: "POST", body: payload, auth: true }),
  getAvailability: (serviceId, date) => {
    const params = new URLSearchParams({ serviceId, date });
    return request(`/availability?${params.toString()}`);
  },
  createBooking: (payload) => request("/bookings", { method: "POST", body: payload }),
  listBookings: (params) => {
    const search = params
      ? new URLSearchParams(
          Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
        ).toString()
      : "";
    const suffix = search ? `?${search}` : "";
    return request(`/bookings${suffix}`, { auth: true });
  },
  createAdminBooking: (payload) =>
    request("/bookings/admin", {
      method: "POST",
      body: payload,
      auth: true,
    }),
  updateBooking: (id, payload) => request(`/bookings/${id}`, { method: "PUT", body: payload, auth: true }),
  deleteBooking: (id) => request(`/bookings/${id}`, { method: "DELETE", auth: true }),
  authorizePayment: (payload) => request("/payments/authorize", { method: "POST", body: payload }),
  getSettings: () => request("/settings"),
  updateSettings: (payload) => request("/settings", { method: "PUT", body: payload, auth: true }),
};
