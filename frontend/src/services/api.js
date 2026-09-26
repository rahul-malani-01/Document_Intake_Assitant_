const API_BASE_URL = 'http://localhost:5000/api';

export async function createSession() {
  const res = await fetch(`${API_BASE_URL}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to create session (${res.status})`);
  }
  return res.json();
}

export async function getSession(sessionId) {
  const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch session (${res.status})`);
  }
  return res.json();
}

export async function sendMessage(sessionId, message) {
  const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to send message (${res.status})`);
  }
  return res.json();
}

export async function updateStateDirect(sessionId, patch) {
  const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/state`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to update state (${res.status})`);
  }
  return res.json();
}