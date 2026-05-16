"use client";

import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { Track } from "livekit-client";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  StartAudio,
  TrackToggle,
} from "@livekit/components-react";
import { Button } from "@/components/ui/button";
import { SessionChatPanel } from "@/components/sessions/SessionChatPanel";
import { SessionVideoStage } from "@/components/sessions/SessionVideoStage";
import { cn } from "@/lib/utils";

type Props = {
  sessionId: string;
  serverUrl: string;
  token: string;
  elapsedLabel?: string;
};

function SessionControlBar({
  chatOpen,
  onToggleChat,
}: {
  chatOpen: boolean;
  onToggleChat: () => void;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center p-4">
      <div className="session-control-bar pointer-events-auto flex items-center gap-1 rounded-full border border-white/10 bg-zinc-950/85 px-2 py-2 shadow-2xl backdrop-blur-md">
        <TrackToggle
          source={Track.Source.Microphone}
          className="session-control-btn"
        />
        <TrackToggle
          source={Track.Source.Camera}
          className="session-control-btn"
        />
        <div className="mx-1 h-6 w-px bg-white/10" />
        <Button
          type="button"
          size="icon"
          variant={chatOpen ? "default" : "ghost"}
          className="h-10 w-10 rounded-full"
          onClick={onToggleChat}
          aria-label={chatOpen ? "Hide transcript" : "Show transcript"}
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function SessionTopBar({ elapsedLabel }: { elapsedLabel?: string }) {
  return (
    <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between gap-3 bg-gradient-to-b from-black/70 to-transparent px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        {elapsedLabel && (
          <span className="rounded-md bg-black/50 px-2.5 py-1 font-mono text-sm tabular-nums text-white ring-1 ring-white/10">
            {elapsedLabel}
          </span>
        )}
        <StartAudio label="Enable audio" className="session-start-audio" />
      </div>
    </div>
  );
}

export function LiveAvatarRoom({
  sessionId,
  serverUrl,
  token,
  elapsedLabel,
}: Props) {
  const [chatOpen, setChatOpen] = useState(true);

  useEffect(() => {
    const id = "livekit-components-styles";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "/livekit-components.css";
    document.head.appendChild(link);
  }, []);

  return (
    <LiveKitRoom
      serverUrl={serverUrl}
      token={token}
      connect
      audio
      video
      data-lk-theme="default"
      className="session-room flex h-full min-h-0 w-full"
    >
      <div className="flex h-full min-h-0 w-full flex-col md:flex-row">
        <div className="relative min-h-0 min-w-0 flex-1">
          <SessionVideoStage />
          <SessionTopBar elapsedLabel={elapsedLabel} />
          <SessionControlBar
            chatOpen={chatOpen}
            onToggleChat={() => setChatOpen((v) => !v)}
          />
        </div>

        <SessionChatPanel
          sessionId={sessionId}
          onClose={() => setChatOpen(false)}
          className={cn(
            "border-t md:border-t-0",
            chatOpen
              ? "flex h-[min(42vh,360px)] md:h-full"
              : "hidden md:flex"
          )}
        />
      </div>

      <RoomAudioRenderer volume={1} />
    </LiveKitRoom>
  );
}
