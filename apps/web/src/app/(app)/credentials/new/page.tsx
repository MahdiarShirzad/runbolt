import { pageMetadata } from "@/lib/seo";
import { CredentialCreateForm } from "@/components/dashboard/CredentialCreateForm";
import { INTEGRATIONS } from "@/lib/dashboard/integrations";

export const metadata = pageMetadata({
  title: "Add credential",
  description: "Name a credential and enter its secret — never stored in this browser.",
  path: "/credentials/new",
  noIndex: true,
});

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
