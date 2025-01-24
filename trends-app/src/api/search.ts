import { API_URL } from "./index";

export const searchAPI = async (query: string, filterOptions?: Record<string, unknown>) => {
  // add all filterOptions to the query string
  const response = await fetch(
    `${API_URL}/search?query=${query}&${Object.entries(filterOptions || {})
      .map(([key, value]) => `${key}=${value}`)
      .join("&")}`
  );
  return response.json();
};
