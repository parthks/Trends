import { API_URL } from "./index";

export const queryAPI = async (query: string) => {
  const response = await fetch(`${API_URL}/query/${query}`);
  return response.json();
};
