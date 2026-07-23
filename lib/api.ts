// Talks to backend_service. Override the base URL (e.g. for a Cloudflare tunnel demo) via NEXT_PUBLIC_API_BASE_URL.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

const USER_ID_KEY = "grove_user_id";

type UserResponse = {
  id: string;
  username: string;
  display_name: string;
};

// There's no login flow yet — one demo user is created on first load and remembered in localStorage.
export async function getOrCreateUserId(): Promise<string> {
  const stored = localStorage.getItem(USER_ID_KEY);
  if (stored) return stored;

  const res = await fetch(`${API_BASE}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "maya_bennett", display_name: "Maya Bennett" }),
  });
  if (!res.ok) {
    throw new Error(`Failed to create demo user: ${res.status}`);
  }

  const user: UserResponse = await res.json();
  localStorage.setItem(USER_ID_KEY, user.id);
  return user.id;
}
