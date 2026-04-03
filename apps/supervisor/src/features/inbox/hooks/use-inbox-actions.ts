"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createListado, deleteTest, type Test } from "@/lib/api";
import type { Locks } from "@/hooks/useSignalR";

export function useInboxActions({
  mutate,
  locks,
}: {
  mutate: () => Promise<unknown>;
  locks: Locks;
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteTest(id);
        toast.success("Registro eliminado correctamente");
        await mutate();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Error al eliminar el registro";
        toast.error(message);
      }
    },
    [mutate],
  );

  const handleCreateBlank = useCallback(async () => {
    try {
      setCreating(true);
      const result = await createListado();
      toast.success("Nueva prueba manual creada");
      await mutate();
      router.push(`/supervisor/test/pending-${result.id}`);
    } catch {
      toast.error("Error al crear la prueba manual");
    } finally {
      setCreating(false);
    }
  }, [mutate, router]);

  const handleRowClick = useCallback(
    (row: Pick<Test, "id" | "status">) => {
      const lockedBy = row.id ? locks[row.id] : undefined;

      if (lockedBy && row.status !== "PENDING") {
        toast.warning(`Protocolo en ejecucion por ${lockedBy}`, {
          description:
            "No es posible editar el protocolo mientras esta siendo ejecutado.",
          duration: 4000,
        });
        return;
      }

      const route =
        row.status === "PENDING"
          ? `/supervisor/test/${row.id}`
          : `/supervisor/protocolo/${row.id}`;

      router.push(route);
    },
    [locks, router],
  );

  const handleRefresh = useCallback(() => {
    void mutate();
  }, [mutate]);

  return {
    creating,
    handleCreateBlank,
    handleDelete,
    handleRefresh,
    handleRowClick,
  };
}
