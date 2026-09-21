import { Suspense } from "react";
import MemberPlanClient from "./MemberPlanClient";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="text-nbp-tx2">A carregar plano…</p>}>
      <MemberPlanClient params={params} />
    </Suspense>
  );
}
