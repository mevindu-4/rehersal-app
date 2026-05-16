import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PersonalityProfile } from "@/types";

export function PersonalityProfileCard({
  profile,
}: {
  profile: PersonalityProfile;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{profile.name}</CardTitle>
          <p className="text-sm text-muted-foreground">Communication style</p>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <p>
            <span className="text-muted-foreground">Directness:</span>{" "}
            {profile.communication_style.directness}
          </p>
          <p>
            <span className="text-muted-foreground">Formality:</span>{" "}
            {profile.communication_style.formality}
          </p>
          <p>
            <span className="text-muted-foreground">Pace:</span>{" "}
            {profile.communication_style.pace}
          </p>
          <p>
            <span className="text-muted-foreground">Listening:</span>{" "}
            {profile.communication_style.listening_style}
          </p>
        </CardContent>
      </Card>

      <ProfileSection title="Core values" items={profile.core_values} />
      <ProfileSection title="Known priorities" items={profile.known_priorities} />
      <ProfileSection title="Known skepticisms" items={profile.known_skepticisms} />
      <ProfileSection
        title="Typical questions"
        items={profile.typical_question_patterns}
      />
      <ProfileSection title="What impresses them" items={profile.what_impresses_them} />
      <ProfileSection title="What irritates them" items={profile.what_irritates_them} />

      {Object.keys(profile.source_citations).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Source citations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {Object.entries(profile.source_citations).map(([k, v]) => (
              <p key={k}>
                <span className="font-medium text-foreground">{k}:</span> {v}
              </p>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ProfileSection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (!items?.length) return null;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge key={item} className="bg-secondary font-normal">
            {item}
          </Badge>
        ))}
      </CardContent>
    </Card>
  );
}
