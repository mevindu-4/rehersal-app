import library from "@/public/library/index.json";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LibraryGrid() {
  const figures = library.figures as Array<{
    id: string;
    name: string;
    title: string;
    domain: string;
    type: string;
  }>;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {figures.map((f) => (
        <Card key={f.id}>
          <CardHeader>
            <p className="text-xs uppercase text-primary">{f.type}</p>
            <CardTitle className="text-lg">{f.name}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {f.title} · {f.domain}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
