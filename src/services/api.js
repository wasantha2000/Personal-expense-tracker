const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "http://localhost:5000"
    : "https://personal-expense-tracker1-red.vercel.app");

async function request(method, path, body) {
  const options = {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  let res;

  try {
    res = await fetch(`${BASE_URL}/api${path}`, options);
  } catch (error) {
    console.error("API connection error:", error);
    throw new Error(
      "Cannot connect to the server. Please check your internet connection or API URL."
    );
  }

  let data;

  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    const err = new Error(
      data.message || `Request failed (${res.status})`
    );

    err.status = res.status;
    err.data = data;

    throw err;
  }

  return data;
}

export const api = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
  put: (path, body) => request("PUT", path, body),
  delete: (path) => request("DELETE", path),
};
