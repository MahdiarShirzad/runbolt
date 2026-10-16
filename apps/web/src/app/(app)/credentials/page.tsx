import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/dashboard/RoutePlaceholder";

export const metadata: Metadata = {
  title: "Credentials — Runbolt",
  description: "Store and scope encrypted credentials for workflows.",
};

export default function CredentialsPage() {
  return (
    <RoutePlaceholder
      title="Credentials"
      description="An encrypted credential store — API keys, OAuth tokens, and database URIs — scoped per environment and referenced from workflow nodes."
      planned={[
        "Encrypted secrets with environment scoping",
        "OAuth connect flows for third-party apps",
        "Access audit trail and rotation reminders",
      ]}
    />
  );
}
