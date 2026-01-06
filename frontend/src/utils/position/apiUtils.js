const backendUrl =
  import.meta.env.VITE_API_local_Backend_URL || "http://localhost:8000";

const request = async (endpoint, options = {}) => {
  const res = await fetch(`${backendUrl}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Something went wrong");
  }

  return res.json();
};

// API utility functions for position management
export const positionAPI = {
  getAll: () => request("/api/positions"),

  getById: (id) => request(`/api/positions/${id}`),

  create: (data) =>
    request("/api/positions", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    request(`/api/positions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    request(`/api/positions/${id}`, {
      method: "DELETE",
    }),
};
