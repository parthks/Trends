"use client";

import { useEffect, useState } from "react";
import { IconX, IconBrandTwitter, IconBrandWhatsapp, IconBrandDiscord, IconBrandReddit, IconShare3 } from "@tabler/icons-react";
import { Button } from "./ui/button";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}

export default function ShareModal({ isOpen, onClose, url }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  // Handle ESC key press
  useEffect(() => {
    if (typeof window === "undefined") return;
    setCopied(false);
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      // Add toast notification here if needed
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareButtons = [
    {
      name: "Twitter / X",
      icon: IconBrandTwitter,
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
    },
    {
      name: "Whatsapp",
      icon: IconBrandWhatsapp,
      href: `https://wa.me/?text=${encodeURIComponent(url)}`,
    },
    {
      name: "Discord",
      icon: IconBrandDiscord,
      href: `https://discord.com/channels`,
    },
    {
      name: "Reddit",
      icon: IconBrandReddit,
      href: `https://reddit.com/submit?url=${encodeURIComponent(url)}`,
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div role="dialog" aria-modal="true" className="relative mx-auto max-w-sm w-full rounded-lg bg-white p-6 shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">{"Share what's trending"}</h2>
            <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100 transition-colors" aria-label="Close dialog">
              <IconX className="h-6 w-6" />
            </button>
          </div>

          {/* URL Input */}
          <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg mb-6">
            <input type="text" value={url} readOnly className="flex-1 bg-transparent outline-none text-sm" />
            <Button onClick={copyToClipboard} variant="secondary" className="text-sm">
              {copied ? "copied" : "copy link"}
            </Button>
          </div>

          {/* Share Buttons */}
          <div className="grid grid-cols-2 gap-4">
            {shareButtons.map((button) => (
              <a
                key={button.name}
                href={button.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <button.icon className="h-5 w-5" />
                <span className="text-sm">{button.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ShareButton() {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUrl(window.location.href);
    }
  }, [isShareModalOpen]);

  const handleShare = async () => {
    if (isMobile() && navigator.canShare({ url })) {
      await navigator.share({
        url: url,
      });
    } else {
      // Fallback to modal if Web Share API is not supported
      setIsShareModalOpen(true);
    }
  };

  const isMobile = () => {
    if (typeof window === "undefined") return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  return (
    <>
      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} url={url} />
      <Button onClick={handleShare} variant="ghost" className="gap-1 font-bold">
        <IconShare3 className="w-4 h-4" />
        share
      </Button>
    </>
  );
}
