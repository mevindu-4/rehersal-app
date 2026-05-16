import type { ConversationType, DocType, Domain } from "@/types";

export const DOC_TYPE_LABELS: Record<DocType, string> = {
  my_background: "My Background",
  opportunity: "Opportunity",
  company_product: "Company or Product",
  prior_interactions: "Prior Interactions",
  other: "Other",
};

export const DOMAIN_LABELS: Record<Domain, string> = {
  interview: "Interview",
  fundraising: "Fundraising",
  sales: "Sales",
  negotiation: "Negotiation",
  personal: "Personal",
  other: "Other",
};

export const CONVERSATION_TYPES: {
  id: ConversationType;
  label: string;
  description: string;
  icon: string;
}[] = [
  { id: "job_interview", label: "Job Interview", description: "Hiring panel or recruiter", icon: "Briefcase" },
  { id: "fundraising_pitch", label: "Fundraising", description: "Investors and partners", icon: "TrendingUp" },
  { id: "sales_discovery", label: "Sales Discovery", description: "Prospect qualification", icon: "Phone" },
  { id: "difficult_conversation", label: "Difficult Conversation", description: "Tension and repair", icon: "MessageSquare" },
  { id: "negotiation", label: "Negotiation", description: "Terms and trade-offs", icon: "Scale" },
  { id: "deposition_legal", label: "Deposition", description: "Legal examination", icon: "Gavel" },
  { id: "media_podcast", label: "Media / Podcast", description: "Public interview", icon: "Mic" },
  { id: "board_meeting", label: "Board Meeting", description: "Governance and strategy", icon: "Users" },
  { id: "personal_conversation", label: "Personal", description: "Family or relationships", icon: "Heart" },
  { id: "custom", label: "Custom", description: "Define your own context", icon: "Sparkles" },
];

export const DIFFICULTY_LABELS = [
  "Patient",
  "Conversational",
  "Standard",
  "Demanding",
  "Intense",
] as const;

export const LIBRARY_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "professional", label: "Professional" },
  { id: "personal", label: "Personal" },
  { id: "real_figure", label: "Real Figures" },
] as const;
