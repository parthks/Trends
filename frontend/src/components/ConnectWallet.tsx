"use client";
import { ArweaveWalletKit, ConnectButton, useActiveAddress, useConnection } from "arweave-wallet-kit";
import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

export default function ConnectWallet() {
  return (
    <ArweaveWalletKit
      config={{
        permissions: ["SIGN_TRANSACTION", "ACCESS_ADDRESS"],
        ensurePermissions: true,
      }}
      theme={{
        displayTheme: "light",
        // accent: { r: 255, g: 0, b: 0 },
        radius: "minimal",
      }}
    >
      <div className="flex items-center gap-2 [&_button]:!h-10">
        <MyConnectButton />
      </div>
    </ArweaveWalletKit>
  );
}

function MyConnectButton() {
  const { setWalletAddressID } = useAppStore();
  const { connected } = useConnection();
  const address = useActiveAddress();

  useEffect(() => {
    setWalletAddressID(connected ? address ?? null : null);
  }, [connected, address, setWalletAddressID]);

  return <ConnectButton showBalance={false} />;
}

// export default function ConnectButton({ className, onClickAction }: { className?: string; onClickAction?: () => void }) {
//   const { setWalletAddressID, walletAddressID } = useAppStore();

//   useEffect(() => {
//     const handleWalletLoaded = () => {
//       console.log(`You are using the ${window.arweaveWallet.walletName} wallet.`);
//       console.log(`Wallet version is ${window.arweaveWallet.walletVersion}`);
//     };
//     addEventListener("arweaveWalletLoaded", handleWalletLoaded);
//     return () => removeEventListener("arweaveWalletLoaded", handleWalletLoaded);
//   }, []);

//   if (walletAddressID) return <div>Connected {`${walletAddressID.slice(0, 4)}...${walletAddressID.slice(-4)}`}</div>;

//   //   if (!walletLoaded) return null;

//   return (
//     <div className="flex items-center gap-2">

//       <Button
//         className={className}
//         onClick={async () => {
//           if (walletAddressID) {
//             // disconnect from the extension
//             await window.arweaveWallet.disconnect();
//             setWalletAddressID(null);
//             return;
//           }
//           if (!window.arweaveWallet?.connect) {
//             alert("Please install ArConnect");
//             return;
//           }
//           // connect to the extension
//           try {
//             await window.arweaveWallet.connect(
//               // request permissions to read the active address
//               ["ACCESS_ADDRESS", "SIGN_TRANSACTION", "DISPATCH"],
//               // provide some extra info for our app
//               {
//                 name: "Trends",
//                 // logo: "https://arweave.net/IvZQHCqSNVCTjqflozr_QaiuxVZrq2_GzRX3JeP88tY",
//               }
//             );
//           } catch (error) {
//             console.error(error);
//             return;
//           }

//           const userAddress = await window.arweaveWallet.getActiveAddress();
//           setWalletAddressID(userAddress);
//           onClickAction?.();
//           console.log(`Connected to ${userAddress}`);
//         }}
//       >
//         <Image src={"/arconnect.svg"} alt="ArConnect Logo" width={20} height={20} />
//         Connect Wallet
//       </Button>
//     </div>
//   );
// }
