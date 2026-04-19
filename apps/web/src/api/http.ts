const apiBase = "http://localhost:3001/api";

const readCookie = (name: string): string | null => {
  const parts = document.cookie.split("; ").find((item) => item.startsWith(`${name}=`));
  return parts ? decodeURIComponent(parts.split("=")[1]) : null;
};

const withJson = async <T>(response: Response): Promise<T> => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error((data as any).message || "Request failed.");
  }
  return data as T;
};

const createHeaders = (includeJson = true) => {
  const csrf = readCookie("csrf_token");

  return {
    ...(includeJson ? { "Content-Type": "application/json" } : {}),
    ...(csrf ? { "x-csrf-token": csrf } : {})
  };
};

export const http = {
  apiBase,

  get: async <T>(path: string): Promise<T> => {
    const response = await fetch(`${apiBase}${path}`, {
      credentials: "include"
    });

    return withJson<T>(response);
  },

  postJson: async <T>(path: string, body: Record<string, unknown>): Promise<T> => {
    const response = await fetch(`${apiBase}${path}`, {
      method: "POST",
      credentials: "include",
      headers: createHeaders(true),
      body: JSON.stringify(body)
    });

    return withJson<T>(response);
  },

  postForm: async <T>(path: string, body: URLSearchParams): Promise<T> => {
    const response = await fetch(`${apiBase}${path}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body
    });

    return withJson<T>(response);
  }
};
