"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initAnalytics } from "@/lib/firebase-client";

export default function AnalyticsHandler() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAnalytics = async () => {
      const analytics = await initAnalytics();
      if (!analytics) return;

      const url = `${pathname}${searchParams ? `?${searchParams}` : ""}`;

      import("firebase/analytics").then(({ logEvent }) => {
        logEvent(analytics, "page_view", {
          page_path: url,
          page_title: document.title,
          page_location: window.location.href,
        });
      });
    };

    handleAnalytics();
  }, [pathname, searchParams]);

  return null;
}
