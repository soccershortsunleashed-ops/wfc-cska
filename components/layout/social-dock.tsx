"use client";

import React from "react";
import { FloatingDock } from "@/components/ui/floating-dock";
import { Youtube, Twitter } from "lucide-react";
import { FaTelegram, FaVk } from "react-icons/fa";

export function SocialDock() {
  const socialLinks = [
    {
      title: "VK",
      icon: (
        <FaVk className="h-full w-full text-[var(--cska-blue)] dark:text-neutral-300 transition-colors" />
      ),
      href: "https://vk.com/wfccska",
    },
    {
      title: "Twitter",
      icon: (
        <Twitter className="h-full w-full text-[var(--cska-blue)] dark:text-neutral-300 transition-colors" />
      ),
      href: "https://twitter.com/wfccska",
    },
    {
      title: "YouTube",
      icon: (
        <Youtube className="h-full w-full text-[var(--cska-red)] dark:text-neutral-300 transition-colors" />
      ),
      href: "https://www.youtube.com/channel/UCToNhi_LVB-cQzDZCLgl57Q",
    },
    {
      title: "Telegram",
      icon: (
        <FaTelegram className="h-full w-full text-[var(--cska-blue)] dark:text-neutral-300 transition-colors" />
      ),
      href: "https://t.me/wfc_cska",
    },
  ];

  return (
    <div className="flex items-center justify-center">
      <FloatingDock items={socialLinks} />
    </div>
  );
}
