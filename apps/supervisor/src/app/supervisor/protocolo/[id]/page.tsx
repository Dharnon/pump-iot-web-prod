"use client";

/**
 * Protocol Detail Page (Generated Protocols)
 *
 * This page handles already generated protocols.
 * - Shows existing PDF (readonly viewer)
 * - All fields are editable
 * - Has "Save" button to update protocol data
 * - Shows all sections including motor/details
 */

import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { useTestDetailPage, DetailView } from "@/features/test-detail";
import { toast } from "sonner";
import { patchTest } from "@/lib/api";

export default function ProtocolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();

  // Use hook with GENERATED view mode
  const hookResult = useTestDetailPage(params.id as string, t, "GENERATED");

  const handleMoveToBank = async (id: string) => {
    try {
      if (!hookResult.test?.bancoId) {
        toast.warning("Debe seleccionar un banco antes de proceder");
        return;
      }

      await patchTest(id, {
        status: "EN_BANCO",
        bancoId: hookResult.test.bancoId,
      });

      toast.success("Prueba enviada a banco");
      router.push("/supervisor/programacion");
    } catch (error) {
      console.error("Error moving test to bank:", error);
      toast.error("Error al mover la prueba a banco");
    }
  };

  const handleReturnToProcessed = async (id: string) => {
    try {
      await patchTest(id, {
        status: "GENERATED",
        bancoId: hookResult.test?.bancoId,
      });

      toast.success("Prueba regresada a procesados");
      router.push("/supervisor");
    } catch (error) {
      console.error("Error returning test to processed:", error);
      toast.error("Error al devolver la prueba a procesados");
    }
  };

  return (
    <DetailView
      hookResult={hookResult}
      t={t}
      backRoute="/supervisor"
      breadcrumbLabel="Protocolos"
      onMoveToBank={handleMoveToBank}
      onReturnToProcessed={handleReturnToProcessed}
    />
  );
}
