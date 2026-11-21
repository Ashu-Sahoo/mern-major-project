const API_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
}

export function getPosts() {
  return request("/posts");
}

export function createPost(postData) {
  return request("/posts", {
    method: "POST",
    body: JSON.stringify(postData)
  });
}

export function deletePost(id) {
  return request(`/posts/${id}`, { method: "DELETE" });
}
