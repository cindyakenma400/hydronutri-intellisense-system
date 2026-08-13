// Central API client for the FastAPI backend.
// All frontend requests go through this file.

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};

  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail = `Request failed (${response.status})`;

    try {
      const body = await response.json();
      if (body?.detail) detail = body.detail;
    } catch {
      // response had no JSON body
    }

    throw new ApiError(response.status, detail);
  }

  return response.json() as Promise<T>;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    headers: authHeaders(),
  });

  return handleResponse<T>(response);
}

export async function apiPost<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    cache: "no-store",
    headers: authHeaders(),
  });

  return handleResponse<T>(response);
}

export async function apiPostJson<T>(
  path: string,
  body: unknown
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(body),
  });

  return handleResponse<T>(response);
}

export async function apiUpload<T>(
  path: string,
  file: File,
  fields?: Record<string, string>
): Promise<T> {
  const formData = new FormData();
  formData.append("file", file);

  // Extra form fields (e.g. the selected crop) ride along with the file.
  if (fields) {
    for (const [key, value] of Object.entries(fields)) {
      formData.append(key, value);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    body: formData,
    cache: "no-store",
    headers: authHeaders(),
  });
  return handleResponse<T>(response);
}