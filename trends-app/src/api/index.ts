export const API_URL = "http://localhost:8787";

export const fetcher = async (url: string) => {
  const response = await fetch(url);
  return response.json();
};
