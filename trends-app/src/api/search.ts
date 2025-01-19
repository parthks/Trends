import { API_URL } from "./index";

export const searchAPI = async (query: string) => {
  const response = await fetch(`${API_URL}/search?query=${query}`);
  return response.json();
};
