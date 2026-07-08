"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Palette = dynamic(() => import("@/components/GlobalCommandPalette"), { ssr: false });

export default function GlobalClientBootstrap() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mount = async () => {
      try {
        const resp = await fetch("/search-index.json", { cache: "force-cache" });
        if (resp.ok) {
          const json = await resp.json();
          setItems(json);
          return;
        }
      } catch {
        /* 忽略 */
      }
    };
    const t = setTimeout(mount, 600);
    return () => clearTimeout(t);
  }, []);

  return <Palette items={items} />;
}
