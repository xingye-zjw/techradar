"use client";

import { useState, useEffect } from "react";
import { toggleFavorite, isFavorited } from "@/lib/storage";
import { toast } from "@/components/Toast";

interface FavoriteButtonProps {
  type: "terms" | "intel" | "nodes" | "tools";
  slug: string;
  className?: string;
}

export function FavoriteButton({ type, slug, className = "" }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setFavorited(isFavorited(type, slug));
    setMounted(true);
  }, [type, slug]);

  const handleToggle = () => {
    const newState = toggleFavorite(type, slug);
    setFavorited(newState);
    if (newState) {
      toast.success("已添加到收藏", 1500);
    } else {
      toast.info("已取消收藏", 1500);
    }
  };

  if (!mounted) {
    return (
      <button
        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${className}`}
        disabled
        aria-label="加载中"
      >
        <span className="text-lg opacity-50">♡</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
        favorited
          ? "text-red-400 hover:text-red-300"
          : "text-neutral-500 hover:text-red-400"
      } ${className}`}
      title={favorited ? "取消收藏" : "添加到收藏"}
      aria-label={favorited ? "取消收藏" : "添加到收藏"}
      aria-pressed={favorited}
    >
      <span className={`text-lg transition-transform ${favorited ? "scale-110" : ""}`}>
        {favorited ? "♥" : "♡"}
      </span>
    </button>
  );
}
