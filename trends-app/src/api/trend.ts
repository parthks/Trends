import { API_URL } from "@/lib/utils";
import { TrendSnapshot } from "@/types/trend";

export const publishTrend = async (data: Omit<TrendSnapshot, "id" | "createdAt">) => {
  const response = await fetch(`${API_URL}/trend`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const getTrend = async (id: string) => {
  const response = await fetch(`${API_URL}/trend/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch trend");
  }
  return response.json();
};

export const getAllTrends = async () => {
  const response = await fetch(`${API_URL}/trend`);
  if (!response.ok) {
    throw new Error("Failed to fetch trends");
  }
  return response.json();
};
