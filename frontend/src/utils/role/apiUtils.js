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

// API utility functions for role management
export const roleAPI = {
  getAll: () => request("/api/roles"),

  getById: (roleId) => request(`/api/roles/${roleId}`),

  create: (data) =>
    request("/api/roles/create", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (roleId, data) =>
    request(`/api/roles/${roleId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (roleId) =>
    request(`/api/roles/${roleId}`, {
      method: "DELETE",
    }),
};
