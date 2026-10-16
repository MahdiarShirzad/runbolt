import type { Metadata } from "next";
import { CredentialCreateForm } from "@/components/dashboard/CredentialCreateForm";
import { INTEGRATIONS } from "@/lib/dashboard/integrations";

export const metadata: Metadata = {
  title: "Add credential — Runbolt",
  description: "Name a credential and enter its secret — never stored in this browser.",
};

export const dynamic = "force-dynamic";

export default function NewCredentialPage() {
  return (
    <CredentialCreateForm
      integrationOptions={INTEGRATIONS.map((integration) => ({
        slug: integration.slug,
        name: integration.name,
      }))}
    />
  );
}
