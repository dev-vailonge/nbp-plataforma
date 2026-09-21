import { AppShell } from "@/components/AppShell";
import { PORTAL_FOOTER_NAV, PORTAL_NAV } from "@/lib/nav";
import { currentMember } from "@/lib/mocks";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell
      variant="portal"
      nav={PORTAL_NAV}
      footerNav={PORTAL_FOOTER_NAV}
      user={currentMember}
      planLabel="Membro ativo"
      profileHref="/app/perfil"
    >
      {children}
    </AppShell>
  );
}
