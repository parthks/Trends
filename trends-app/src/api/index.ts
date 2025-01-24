export const API_URL = process.env.API_URL;

export const fetcher = async (url: string) => {
  const response = await fetch(url);
  return response.json();
};
