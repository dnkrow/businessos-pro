import { Badge, type Tone } from "./badge";
import {
  COMPANY_STATUS_META,
  USER_STATUS_META,
  MEMBERSHIP_STATUS_META,
  SUBSCRIPTION_STATUS_META,
  type CompanyStatus,
  type UserStatus,
  type MembershipStatus,
} from "@/lib/constants";

export function CompanyStatusBadge({ status }: { status: string }) {
  const meta = COMPANY_STATUS_META[status as CompanyStatus] ?? { label: status, tone: "neutral" as const };
  return <Badge tone={meta.tone as Tone} dot>{meta.label}</Badge>;
}

export function UserStatusBadge({ status }: { status: string }) {
  const meta = USER_STATUS_META[status as UserStatus] ?? { label: status, tone: "neutral" as const };
  return <Badge tone={meta.tone as Tone} dot>{meta.label}</Badge>;
}

export function MembershipStatusBadge({ status }: { status: string }) {
  const meta = MEMBERSHIP_STATUS_META[status as MembershipStatus] ?? { label: status, tone: "neutral" as const };
  return <Badge tone={meta.tone as Tone} dot>{meta.label}</Badge>;
}

export function SubscriptionStatusBadge({ status }: { status: string }) {
  const meta = SUBSCRIPTION_STATUS_META[status] ?? { label: status, tone: "neutral" as const };
  return <Badge tone={meta.tone as Tone} dot>{meta.label}</Badge>;
}
