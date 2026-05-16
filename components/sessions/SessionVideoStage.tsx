"use client";

import { useMemo } from "react";
import { RoomEvent, Track } from "livekit-client";
import {
  isTrackReference,
  type TrackReferenceOrPlaceholder,
} from "@livekit/components-core";
import {
  ParticipantTile,
  useTracks,
} from "@livekit/components-react";
import { cn } from "@/lib/utils";

function scoreMainTrack(track: TrackReferenceOrPlaceholder): number {
  if (track.participant.isLocal) return -100;
  const name =
    track.participant.name?.toLowerCase() ??
    track.participant.identity.toLowerCase();
  let score = 0;
  if (name.includes("interview") || name.includes("rehearsal")) score += 50;
  if (name.includes("agent") && !name.includes("interview")) score -= 10;
  if (isTrackReference(track)) {
    if (track.publication.isSubscribed && !track.publication.isMuted) {
      score += 40;
    }
  }
  return score;
}

function pickTracks(tracks: TrackReferenceOrPlaceholder[]) {
  const local = tracks.find((t) => t.participant.isLocal);
  const remotes = tracks.filter((t) => !t.participant.isLocal);
  const main =
    [...remotes].sort((a, b) => scoreMainTrack(b) - scoreMainTrack(a))[0] ??
    tracks[0];
  const pip = local ?? remotes.find((t) => t !== main);
  return { main, pip };
}

export function SessionVideoStage({ className }: { className?: string }) {
  const tracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }],
    { updateOnlyOn: [RoomEvent.ActiveSpeakersChanged], onlySubscribed: false }
  );

  const { main, pip } = useMemo(() => pickTracks(tracks), [tracks]);

  return (
    <div
      className={cn(
        "relative h-full min-h-0 w-full overflow-hidden bg-zinc-950",
        className
      )}
    >
      {main ? (
        <div className="session-video-main h-full w-full [&_.lk-participant-tile]:h-full [&_.lk-participant-tile]:rounded-none [&_.lk-participant-tile]:border-0">
          <ParticipantTile trackRef={main} />
        </div>
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Waiting for video…
        </div>
      )}

      {pip && pip !== main && (
        <div
          className={cn(
            "session-video-pip absolute bottom-20 left-4 z-10 w-[min(100%,220px)] overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-2xl",
            "aspect-video [&_.lk-participant-tile]:rounded-xl [&_.lk-participant-tile]:border-0"
          )}
        >
          <ParticipantTile trackRef={pip} />
        </div>
      )}
    </div>
  );
}
