"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { LibraryFilterTabs } from "@/components/library/LibraryFilterTabs";
import { LibraryCard } from "@/components/library/LibraryCard";
import { LibraryDetailModal } from "@/components/library/LibraryDetailModal";
import { useCloneLibraryProfile, useLibrary } from "@/lib/hooks/use-api";
import type { LibraryProfile } from "@/types";

export function LibraryBrowser() {
  const router = useRouter();
  const [category, setCategory] = useState("all");
  const [domain, setDomain] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("most_used");
  const [selected, setSelected] = useState<LibraryProfile | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const clone = useCloneLibraryProfile();

  const filters = {
    category: category === "all" ? undefined : category,
    domain: domain || undefined,
  };
  const { data, isLoading } = useLibrary(filters);

  const profiles = useMemo(() => {
    let list = (data?.profiles ?? []) as LibraryProfile[];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (sort === "highest_rated") {
      list = [...list].sort(
        (a, b) => (b.accuracy_rating ?? 0) - (a.accuracy_rating ?? 0)
      );
    } else if (sort === "newest") {
      list = [...list].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    return list;
  }, [data, search, sort]);

  const featured = profiles.filter((p) => p.is_featured).slice(0, 3);

  async function handleClone(id: string) {
    const { target } = await clone.mutateAsync(id);
    router.push(`/targets/${target.id}`);
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-wrap items-end gap-4">
        <Input
          placeholder="Search library…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="most_used">Most used</SelectItem>
            <SelectItem value="highest_rated">Highest rated</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <LibraryFilterTabs
        category={category}
        domain={domain}
        onCategoryChange={setCategory}
        onDomainChange={setDomain}
      />

      {category === "personal" && (
        <p className="rounded-md border border-border bg-surface-elevated p-3 text-small text-foreground-secondary">
          Personal profiles are for communication practice — build empathy and clarity,
          not manipulation.
        </p>
      )}

      {featured.length > 0 && (
        <section>
          <h2 className="font-display text-h2 text-foreground-primary">Featured</h2>
          <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
            {featured.map((p) => (
              <div key={p.id} className="min-w-[280px]">
                <LibraryCard
                  profile={p}
                  onPreview={() => {
                    setSelected(p);
                    setModalOpen(true);
                  }}
                  onClone={() => void handleClone(p.id)}
                  cloning={clone.isPending}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {isLoading ? (
        <LoadingSkeleton rows={6} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((p) => (
            <LibraryCard
              key={p.id}
              profile={p}
              onPreview={() => {
                setSelected(p);
                setModalOpen(true);
              }}
              onClone={() => void handleClone(p.id)}
              cloning={clone.isPending}
            />
          ))}
        </div>
      )}

      <LibraryDetailModal
        profile={selected}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onClone={() => selected && void handleClone(selected.id)}
        cloning={clone.isPending}
      />
    </div>
  );
}
