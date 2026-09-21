import { AppShell } from "@/components/AppShell";
import { ADMIN_NAV } from "@/lib/nav";
import { currentAdmin } from "@/lib/mocks";

export default function AdminConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell
      variant="admin"
      nav={ADMIN_NAV}
      user={currentAdmin}
      planLabel="Equipa"
    >
      {children}
    </AppShell>
  );
}
