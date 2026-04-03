"use client";

import { BoxesIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WorkspaceEmptyState } from "@/components/workspace/workspace-empty-state";
import type { InboxViewMode } from "@/features/inbox/lib/inbox-selectors";

import { InboxImportAction } from "./inbox-import-action";

function emptyStateCopy(viewMode: InboxViewMode): { title: string; description: string } {
  switch (viewMode) {
    case "protocols":
      return {
        title: "No hay protocolos",
        description:
          "Cuando generes protocolos desde pendientes, aparecerán aquí para seguimiento.",
      };
    case "en_banco":
      return {
        title: "No hay protocolos en banco",
        description: "Los protocolos asignados a un banco de pruebas se listarán en esta vista.",
      };
    case "completed":
      return {
        title: "No hay protocolos completados",
        description: "Los protocolos finalizados aparecerán aquí.",
      };
    default:
      return {
        title: "No hay pruebas registradas",
        description:
          "Importa tu primer archivo o crea una prueba manual para empezar a poblar este panel.",
      };
  }
}

export function InboxEmptyState({
  viewMode,
  creating,
  onCreateBlank,
  onImportSuccess,
}: {
  viewMode: InboxViewMode;
  creating: boolean;
  onCreateBlank: () => void;
  onImportSuccess: () => void;
}) {
  const { title, description } = emptyStateCopy(viewMode);

  return (
    <WorkspaceEmptyState
      icon={BoxesIcon}
      title={title}
      description={description}
      actions={
        viewMode === "pending" ? (
          <>
            <Button variant="outline" onClick={onCreateBlank} disabled={creating}>
              <PlusIcon data-icon="inline-start" />
              Nueva prueba
            </Button>
            <InboxImportAction onImportSuccess={onImportSuccess} />
          </>
        ) : null
      }
    />
  );
}
