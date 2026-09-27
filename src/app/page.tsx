import { AccessGate } from "@/components/access-gate";
import { CallPrepPage } from "@/components/call-prep-page";
import { hasAccess } from "@/lib/access";

export default async function Home() {
  return (await hasAccess()) ? <CallPrepPage /> : <AccessGate />;
}
