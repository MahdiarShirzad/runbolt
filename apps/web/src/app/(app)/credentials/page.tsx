import type { Metadata } from "next";
import { Suspense } from "react";
import { CredentialsView } from "@/components/dashboard/CredentialsView";
import { CredentialsPageSkeleton } from "@/components/dashboard/Skeletons";
import { currentTimestamp } from "@/lib/dashboard/format";
import { getSampleCredentials } from "@/lib/dashboard/credentials";
import type { CredentialType } from "@/lib/dashboard/credentials";

export const metadata: Metadata = {
  title: "Credentials — Runbolt",
  description: "Manage credentials workflows reference instead of inlining secrets.",
};

export const dynamic = "force-dynamic";

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

const TYPE_VALUES: (CredentialType | "all")[] = [
  "all",
  "api_key",
  "bearer_token",
  "basic_auth",
  "database",
  "custom_header",
  "oauth",
];

export default async function CredentialsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const rawType = first(sp.type);
  const type: CredentialType | "all" =
    rawType && TYPE_VALUES.includes(rawType as CredentialType | "all")
      ? (rawType as CredentialType | "all")
      : "all";

  const rawSort = first(sp.sort);
  const sort = rawSort === "name" ? "name" : "updated";

  const samples = getSampleCredentials(currentTimestamp());

  return (
    <Suspense fallback={<CredentialsPageSkeleton />}>
      <CredentialsView
        samples={samples}
        initial={{
          type,
          integration: first(sp.integration) ?? "",
          q: first(sp.q) ?? "",
          sort,
        }}
      />
    </Suspense>
  );
}
