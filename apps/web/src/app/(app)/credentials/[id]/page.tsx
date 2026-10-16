import type { Metadata } from "next";
import { CredentialDetailView } from "@/components/dashboard/CredentialDetailView";
import { currentTimestamp } from "@/lib/dashboard/format";
import { getSampleCredentials } from "@/lib/dashboard/credentials";

interface CredentialDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: CredentialDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const samples = getSampleCredentials(currentTimestamp());
  const credential = samples.find(
    (candidate) => candidate.id === id || candidate.name === id,
  );
  if (!credential) {
    return {
      title: "Credential — Runbolt",
      description: "Credential metadata, security notes, and usage.",
    };
  }
  return {
    title: `${credential.name} — Credentials — Runbolt`,
    description: `Inspect ${credential.name}, its type, and security handling.`,
  };
}

export const dynamic = "force-dynamic";

/**
 * Sample credentials are matched by id (`cred_sample_…`). Browser-local
 * records are unknown here — the client island resolves them, so this page
 * never calls notFound() up front.
 */
export default async function CredentialDetailPage({
  params,
}: CredentialDetailPageProps) {
  const { id } = await params;
  const samples = getSampleCredentials(currentTimestamp());
  const sample =
    samples.find((candidate) => candidate.id === id || candidate.name === id) ??
    null;

  return <CredentialDetailView sample={sample} paramId={id} />;
}
