import type { Membership, Organization, User } from "@/types";

export interface AuthSession {
  user: User;
  membership: Membership;
  organization: Organization;
}
