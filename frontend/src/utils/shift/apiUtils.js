const backendUrl =
  import.meta.env.VITE_API_local_Backend_URL || "http://localhost:8000";

const request = async (url, options = {}) => {
  const res = await fetch(url, {
    credentials: "include",
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Something went wrong");
  }

  return res.json();
};

export const shiftAPI = {
  getAll: () =>
    request(`${backendUrl}/api/shifts`, {
      method: "GET",
    }),

  getById: (id) =>
    request(`${backendUrl}/api/shifts/${id}`, {
      method: "GET",
    }),

  delete: (id) =>
    request(`${backendUrl}/api/shifts/${id}`, {
      method: "DELETE",
    }),

  update: (id, data) =>
    request(`${backendUrl}/api/shifts/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }),
};
