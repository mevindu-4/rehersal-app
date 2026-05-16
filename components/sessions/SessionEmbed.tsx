"use client";

import { cn } from "@/lib/utils";

export function SessionEmbed({ joinUrl }: { joinUrl: string }) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[960px] overflow-hidden rounded-lg",
        "amber-glow shadow-float"
      )}
      style={{ aspectRatio: "16 / 9" }}
    >
      <iframe
        src={joinUrl}
        title="Live rehearsal session"
        className="absolute inset-0 h-full w-full border-0 bg-surface"
        allow="camera; microphone; autoplay"
      />
    </div>
  );
}
