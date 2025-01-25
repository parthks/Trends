import { API_URL } from "@/lib/utils";

export const chatAPI = async (_: RequestInfo | URL, init?: RequestInit) => {
  const response = fetch(`${API_URL}/ai/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: init?.body,
  });

  return response;
};
