import { API_URL } from "./index";

export const queryAPI = async (input: RequestInfo | URL, init?: RequestInit) => {
  const response = fetch(`${API_URL}/ai/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: init?.body,
  });

  return response;
};

export const queryContextAPI = async (prompt: string, pineconeQueryOptions?: unknown) => {
  const response = await fetch(`${API_URL}/ai/query/context`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt, options: pineconeQueryOptions }),
  });

  if (!response.ok) {
    return [];
  }

  return response.json();
};
