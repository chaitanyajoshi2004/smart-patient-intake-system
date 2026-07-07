const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8000";

type RequestOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined>;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function buildUrl(path: string, params?: RequestOptions["params"]) {
  const url = new URL(`${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`);

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const { params, headers, body, ...requestOptions } = options;

  const response = await fetch(buildUrl(path, params), {
    ...requestOptions,
    body,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    throw new ApiError(response.statusText || "Request failed", response.status, payload);
  }

  return payload as T;
}
