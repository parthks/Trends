import ConnectWallet from "@/components/ConnectWallet";
import { sendDryRunGameMessage } from "@/utils/wallet";
import { Suspense } from "react";
import Loading from "./loading";

// Create a separate component for the main content
async function HomeContent() {
  const data = await sendDryRunGameMessage({ tags: [{ name: "Action", value: "GetTrends" }] });
  console.log(data.data);
  // sleep for 10 seconds
  await new Promise((resolve) => setTimeout(resolve, 5000));

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <ConnectWallet />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<Loading />}>
      <HomeContent />
    </Suspense>
  );
}
