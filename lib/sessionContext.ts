import { retrieveContext } from "@/lib/contextRetriever";
import { getDocumentTextContext } from "@/lib/documentContext";
import { getTargetSourceContext } from "@/lib/targetContext";

/** Builds the combined context block injected into live session system prompts. */
export async function buildSessionUserContextBlock(params: {
  orgId: string;
  userId: string;
  goal: string;
  targetProfileId: string;
  targetName: string;
  includeCompany: boolean;
}): Promise<string> {
  const { targetName, goal, orgId, userId, targetProfileId, includeCompany } =
    params;

  let candidateBlock = "";
  try {
    candidateBlock = await retrieveContext({
      orgId,
      userId,
      goal,
      includeCompany,
      limit: 6,
    });
  } catch {
    candidateBlock = "";
  }

  const emptyCandidate =
    !candidateBlock ||
    candidateBlock.includes("No uploaded context") ||
    candidateBlock.includes("Embeddings require");

  if (emptyCandidate) {
    const textParts = await getDocumentTextContext(orgId, userId, {
      maxParts: 10,
      excerptChars: 2800,
    });
    candidateBlock =
      textParts.length > 0
        ? textParts.join("\n\n")
        : "No candidate documents on file (resume / target company / opportunity).";
  }

  const targetSources = await getTargetSourceContext(targetProfileId, {
    maxTotalChars: 9000,
  });

  const interviewerBlock = targetSources.text.length
    ? targetSources.text
    : "No LinkedIn or source material on file for this interviewer profile.";

  const hasCandidate =
    candidateBlock.length > 0 &&
    !candidateBlock.startsWith("No candidate documents");
  const hasInterviewer = targetSources.sourceCount > 0;

  const roleRules = `ROLE CLARITY (critical):
- YOU = ${targetName}, the person the candidate is practicing with (interviewer / buyer / counterpart).
- THEM = the candidate on the call (the user).
- When they ask about YOU, your career, LinkedIn, or your background — answer IN CHARACTER using YOUR SOURCE MATERIAL below.
- When you need the company THEY are applying to, THEIR resume, or THEIR opportunity — use CANDIDATE MATERIALS below only.
- NEVER ask them to upload or paste LinkedIn for ${targetName} if YOUR SOURCE MATERIAL is non-empty.
- NEVER ask for "the company you're applying to" if that information is already in CANDIDATE MATERIALS.
- If a specific fact is missing from both sections, ask one short clarifying question only.`;

  const candidateRules = hasCandidate
    ? "CANDIDATE RULES: Resume, employer, and opportunity details are in CANDIDATE MATERIALS."
    : "CANDIDATE RULES: No candidate documents found — you may ask once for company and role if needed.";

  const interviewerRules = hasInterviewer
    ? "INTERVIEWER RULES: Your LinkedIn and background are in YOUR SOURCE MATERIAL."
    : "INTERVIEWER RULES: Use personality profile only; no source files on this target.";

  return [
    roleRules,
    candidateRules,
    interviewerRules,
    `\n--- YOUR SOURCE MATERIAL (${targetName}'s LinkedIn, articles, etc.) ---`,
    interviewerBlock,
    `\n--- CANDIDATE MATERIALS (their resume, company they apply to, opportunity) ---`,
    candidateBlock,
    `\nSESSION GOAL: ${goal}`,
  ].join("\n");
}
