import type {} from "@redux-devtools/extension";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface AppState {
  walletAddressID: string | null;
  setWalletAddressID: (walletAddressID: string | null) => void;
}
export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      walletAddressID: null,
      setWalletAddressID: (walletAddressID: string | null) => set({ walletAddressID }),
    }),
    {
      name: "App Store",
      enabled: true,
    }
  )
);
