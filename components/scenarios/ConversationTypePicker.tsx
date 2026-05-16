"use client";

import {
  Briefcase,
  Gavel,
  Heart,
  MessageSquare,
  Mic,
  Phone,
  Scale,
  Sparkles,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { CONVERSATION_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ConversationType } from "@/types";

const ICONS: Record<string, LucideIcon> = {
  Briefcase,
  TrendingUp,
  Phone,
  MessageSquare,
  Scale,
  Gavel,
  Mic,
  Users,
  Heart,
  Sparkles,
};

export function ConversationTypePicker({
  value,
  onChange,
}: {
  value: ConversationType;
  onChange: (t: ConversationType) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {CONVERSATION_TYPES.map((ct) => {
        const Icon = ICONS[ct.icon] ?? Sparkles;
        const selected = value === ct.id;
        return (
          <button
            key={ct.id}
            type="button"
            onClick={() => onChange(ct.id)}
            className={cn(
              "flex flex-col items-start rounded-lg border-2 p-4 text-left transition-colors",
              selected
                ? "border-accent bg-highlight-glow"
                : "border-border hover:border-border-default"
            )}
          >
            <Icon className="h-5 w-5 text-accent" strokeWidth={1.5} />
            <span className="mt-2 font-display text-h3 text-foreground-primary">
              {ct.label}
            </span>
            <span className="mt-1 text-small text-foreground-secondary">
              {ct.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
