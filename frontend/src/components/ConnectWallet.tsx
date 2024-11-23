"use client";
import { useAppStore } from "@/store/useAppStore";
import { useEffect } from "react";
import { Button } from "./ui/button";
import Image from "next/image";

export default function ConnectButton({ className, onClickAction }: { className?: string; onClickAction?: () => void }) {
  const { setWalletAddressID, walletAddressID } = useAppStore();

  useEffect(() => {
    const handleWalletLoaded = () => {
      console.log(`You are using the ${window.arweaveWallet.walletName} wallet.`);
      console.log(`Wallet version is ${window.arweaveWallet.walletVersion}`);
    };
    addEventListener("arweaveWalletLoaded", handleWalletLoaded);
    return () => removeEventListener("arweaveWalletLoaded", handleWalletLoaded);
  }, []);

  if (walletAddressID) return <div>Connected {`${walletAddressID.slice(0, 4)}...${walletAddressID.slice(-4)}`}</div>;

  //   if (!walletLoaded) return null;

  return (
    <div className="flex items-center gap-2">
      <Button
        className={className}
        onClick={async () => {
          if (walletAddressID) {
            // disconnect from the extension
            await window.arweaveWallet.disconnect();
            setWalletAddressID(null);
            return;
          }
          if (!window.arweaveWallet?.connect) {
            alert("Please install ArConnect");
            return;
          }
          // connect to the extension
          try {
            await window.arweaveWallet.connect(
              // request permissions to read the active address
              ["ACCESS_ADDRESS", "SIGN_TRANSACTION", "DISPATCH"],
              // provide some extra info for our app
              {
                name: "Trends",
                // logo: "https://arweave.net/IvZQHCqSNVCTjqflozr_QaiuxVZrq2_GzRX3JeP88tY",
              }
            );
          } catch (error) {
            console.error(error);
            return;
          }

          const userAddress = await window.arweaveWallet.getActiveAddress();
          setWalletAddressID(userAddress);
          onClickAction?.();
          console.log(`Connected to ${userAddress}`);
        }}
      >
        <Image src={"/arconnect.svg"} alt="ArConnect Logo" width={20} height={20} />
        Connect Wallet
      </Button>
    </div>
  );
}
