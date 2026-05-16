"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LIBRARY_CATEGORIES } from "@/lib/constants";
import { DOMAIN_LABELS } from "@/lib/constants";
import type { Domain, LibraryCategory } from "@/types";

export function LibraryFilterTabs({
  category,
  domain,
  onCategoryChange,
  onDomainChange,
}: {
  category: string;
  domain: string;
  onCategoryChange: (c: string) => void;
  onDomainChange: (d: string) => void;
}) {
  return (
    <div className="space-y-4">
      <Tabs value={category} onValueChange={onCategoryChange}>
        <TabsList>
          {LIBRARY_CATEGORIES.map((c) => (
            <TabsTrigger key={c.id} value={c.id}>
              {c.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onDomainChange("")}
          className={`rounded-md border px-3 py-1 text-small ${
            !domain ? "border-accent text-accent" : "border-border"
          }`}
        >
          All domains
        </button>
        {(Object.keys(DOMAIN_LABELS) as Domain[]).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => onDomainChange(d)}
            className={`rounded-md border px-3 py-1 text-small capitalize ${
              domain === d ? "border-accent text-accent" : "border-border"
            }`}
          >
            {DOMAIN_LABELS[d]}
          </button>
        ))}
      </div>
    </div>
  );
}
