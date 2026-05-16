/**
 * Seeds a demo workspace with sample target + scenario.
 * Usage: npm run seed:demo -- <user_id>
 */
import { createAdminClient } from "../lib/supabaseAdmin";

async function main() {
  const userId = process.argv[2];
  if (!userId) {
    throw new Error("Usage: npm run seed:demo -- <supabase_user_id>");
  }

  const supabase = createAdminClient();

  const { data: user } = await supabase
    .from("users")
    .select("default_org_id, email")
    .eq("id", userId)
    .single();

  if (!user?.default_org_id) {
    throw new Error("User has no default_org_id — complete sign-in first");
  }

  const orgId = user.default_org_id;

  const { data: target, error: targetError } = await supabase
    .from("target_profiles")
    .insert({
      org_id: orgId,
      created_by: userId,
      name: "Demo Hiring Manager",
      title: "Director of Engineering",
      company: "Demo Corp",
      domain: "interview",
      tags: ["demo"],
      status: "complete",
      avatar_brief_template:
        "A structured behavioral interviewer who values specifics and pushes for metrics.",
      personality_json: {
        communication_style: {
          directness: "Direct",
          formality: "Professional",
          pace: "Moderate",
          listening_style: "Probing",
        },
        core_values: ["Clarity", "Ownership"],
        typical_question_patterns: ["Tell me about a time..."],
        known_priorities: ["Impact", "Collaboration"],
        known_skepticisms: ["Vague answers"],
        what_impresses_them: ["Metrics"],
        what_irritates_them: ["Rambling"],
        expertise_areas: ["Engineering leadership"],
        behavioral_signals: ["Takes notes"],
        inferred_concerns_by_context: { job_interview: ["Scope", "Tradeoffs"] },
        source_citations: {},
        confidence: {},
      },
    })
    .select()
    .single();

  if (targetError || !target) throw targetError ?? new Error("Target seed failed");

  const { data: scenario, error: scenarioError } = await supabase
    .from("scenarios")
    .insert({
      org_id: orgId,
      created_by: userId,
      title: "Demo behavioral interview",
      conversation_type: "job_interview",
      target_profile_id: target.id,
      duration_minutes: 15,
      difficulty: 3,
      goal: "Practice concise STAR answers for a senior engineering role.",
      included_document_ids: [],
    })
    .select()
    .single();

  if (scenarioError || !scenario) {
    throw scenarioError ?? new Error("Scenario seed failed");
  }

  console.log("Demo workspace seeded:");
  console.log("  org_id:", orgId);
  console.log("  target_id:", target.id);
  console.log("  scenario_id:", scenario.id);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
