// import type { Metadata } from "next";

// type Props = {
//   params: { trend: string };
//   searchParams: { [key: string]: string | string[] | undefined };
// };
// export const revalidate = 0; // Disable caching for this route segment

// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   // read route params
//   const trend = params.trend;
//   const trends = {
//     "ecosystem-projects": {
//       title: "Ecosystem Projects",
//       description: "Explore the latest projects shaping the blockchain ecosystem.",
//       image: "https://arweave.net/MTGE99QY0JKfhu1rBkEylYCscQPFw83skwAMghzJEFM",
//     },
//     "community-events": {
//       title: "Community Events",
//       description: "Discover upcoming community events and meetups.",
//       image: "https://arweave.net/MTGE99QY0JKfhu1rBkEylYCscQPFw83skwAMghzJEFM",
//     },
//     "knowledge-sharing": {
//       title: "Knowledge Sharing",
//       description: "Explore the latest knowledge sharing opportunities.",
//       image: "https://arweave.net/MTGE99QY0JKfhu1rBkEylYCscQPFw83skwAMghzJEFM",
//     },
//     "technical-innovations": {
//       title: "Technical Innovations",
//       description: "Discover the latest technical innovations in the blockchain space.",
//       image: "https://arweave.net/MTGE99QY0JKfhu1rBkEylYCscQPFw83skwAMghzJEFM",
//     },
//     "market-and-adoption-trends": {
//       title: "Market and Adoption Trends",
//       description: "Explore the latest market and adoption trends in the blockchain space.",
//       image: "https://arweave.net/MTGE99QY0JKfhu1rBkEylYCscQPFw83skwAMghzJEFM",
//     },
//     "developer-resources": {
//       title: "Developer Resources",
//       description: "Explore the latest developer resources in the blockchain space.",
//       image: "https://arweave.net/MTGE99QY0JKfhu1rBkEylYCscQPFw83skwAMghzJEFM",
//     },
//     "for-investors-and-enthusiasts": {
//       title: "For Investors and Enthusiasts",
//       description: "Explore the latest for investors and enthusiasts in the blockchain space.",
//       image: "https://arweave.net/MTGE99QY0JKfhu1rBkEylYCscQPFw83skwAMghzJEFM",
//     },
//     "for-enterprises": {
//       title: "For Enterprises",
//       description: "Explore the latest for enterprises in the blockchain space.",
//       image: "https://arweave.net/MTGE99QY0JKfhu1rBkEylYCscQPFw83skwAMghzJEFM",
//     },
//     "dao-governance-updates": {
//       title: "DAO Governance Updates",
//       description: "Explore the latest DAO governance updates.",
//       image: "https://arweave.net/MTGE99QY0JKfhu1rBkEylYCscQPFw83skwAMghzJEFM",
//     },
//     "community-stories": {
//       title: "Community Stories",
//       description: "Explore the latest community stories.",
//       image: "https://arweave.net/MTGE99QY0JKfhu1rBkEylYCscQPFw83skwAMghzJEFM",
//     },

//     "art-and-nfts": {
//       title: "Art and NFTs",
//       description: "Explore the latest art and NFTs in the blockchain space.",
//       image: "https://arweave.net/MTGE99QY0JKfhu1rBkEylYCscQPFw83skwAMghzJEFM",
//     },
//     "gaming-on-blockchain": {
//       title: "Gaming on Blockchain",
//       description: "Explore the latest gaming on blockchain.",
//       image: "https://arweave.net/MTGE99QY0JKfhu1rBkEylYCscQPFw83skwAMghzJEFM",
//     },
//     "sustainability-and-impact": {
//       title: "Sustainability and Impact",
//       description: "Explore the latest sustainability and impact in the blockchain space.",
//       image: "https://arweave.net/MTGE99QY0JKfhu1rBkEylYCscQPFw83skwAMghzJEFM",
//     },
//     "future-of-blockchain": {
//       title: "Future of Blockchain",
//       description: "Explore the latest future of blockchain.",
//       image: "https://arweave.net/MTGE99QY0JKfhu1rBkEylYCscQPFw83skwAMghzJEFM",
//     },
//     "education-and-onboarding": {
//       title: "Education and Onboarding",
//       description: "Explore the latest education and onboarding opportunities in the blockchain space.",
//       image: "https://arweave.net/MTGE99QY0JKfhu1rBkEylYCscQPFw83skwAMghzJEFM",
//     },
//   };

//   // Add null check and default values
//   const trendData = trends[trend as keyof typeof trends] ?? {
//     title: "Explore Trends",
//     description: "Explore the latest trends from around the world.",
//     image: "https://arweave.net/MTGE99QY0JKfhu1rBkEylYCscQPFw83skwAMghzJEFM",
//   };

//   return {
//     title: trendData.title,
//     description: trendData.description,
//     openGraph: {
//       title: trendData.title,
//       description: trendData.description,
//       images: [trendData.image],
//     },
//     twitter: {
//       card: "summary_large_image",
//       title: trendData.title,
//       description: trendData.description,
//       images: [trendData.image],
//     },
//   };
// }

export async function generateStaticParams() {
  const topics = [
    "ecosystem-projects",
    "community-events",
    "knowledge-sharing",
    "technical-innovations",
    "market-and-adoption-trends",
    "developer-resources",
    "for-investors-and-enthusiasts",
    "for-enterprises",
    "dao-governance-updates",
    "community-stories",
    "art-and-nfts",
    "gaming-on-blockchain",
    "sustainability-and-impact",
    "future-of-blockchain",
    "education-and-onboarding",
  ];

  return topics.map((trend) => ({ trend }));
}

export const dynamicParams = false;

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
