const API_URL = "http://localhost:8080/api/auth";

export async function login(username, password) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const msg = await response.text();
    throw new Error(msg);
  }

  return response.json();
}