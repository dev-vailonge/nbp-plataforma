"use client";

import { DriveBrowser } from "@/components/DriveBrowser";
import { PageHeader } from "@/components/Panel";

export default function DocumentosPage() {
  return (
    <section className="w-full" aria-label="Documentos">
      <PageHeader
        title="Documentos"
        subtitle="A árvore da pasta que o mentor partilhou no Drive. O ficheiro abre no documento."
      />
      <DriveBrowser
        emptyTitle="Ainda não há pasta do Drive"
        emptyDescription="Quando o mentor partilhar a pasta, podes navegar por aqui. O documento abre no Drive."
      />
    </section>
  );
}
