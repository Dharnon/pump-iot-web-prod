"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { UseLanguageReturn } from "@/lib/language-context";
import { CheckCircle2, Loader2, Trash2, Wrench } from "lucide-react";

import type { UseTestDetailPageResult } from "../hooks/useTestDetailPage";

interface DetailStateActionsProps {
  test: NonNullable<UseTestDetailPageResult["test"]>;
  saving: boolean;
  deleting: boolean;
  handleSave: () => Promise<void>;
  handleDelete: () => Promise<void>;
  onMoveToBank?: (id: string) => void;
  onReturnToProcessed?: (id: string) => void;
  t: UseLanguageReturn["t"];
  viewMode: "PENDING" | "GENERATED";
}

export function DetailStateActions({
  test,
  saving,
  deleting,
  handleSave,
  handleDelete,
  onMoveToBank,
  onReturnToProcessed,
  t,
  viewMode,
}: DetailStateActionsProps) {
  const canMoveToBank =
    onMoveToBank && (test.status === "GENERATED" || test.status === "GENERADO");
  const canReturnToProcessed =
    onReturnToProcessed && test.status === "EN_BANCO";

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {canMoveToBank ? (
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl border-sky-500/20 bg-sky-500/10 text-sky-200 shadow-sm hover:bg-sky-500/15"
          onClick={() => onMoveToBank?.(test.id)}
        >
          <Wrench className="size-4" />
          Enviar a banco
        </Button>
      ) : null}

      {canReturnToProcessed ? (
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl border-emerald-500/20 bg-emerald-500/10 text-emerald-200 shadow-sm hover:bg-emerald-500/15"
          onClick={() => onReturnToProcessed?.(test.id)}
        >
          <CheckCircle2 className="size-4" />
          Regresar a generado
        </Button>
      ) : null}

      <Button
        size="sm"
        className="rounded-md bg-red-600 px-4 text-white shadow-lg shadow-red-950/25 hover:bg-red-700"
        onClick={handleSave}
        disabled={
          saving ||
          test.status === "SIN_PROCESAR" ||
          (viewMode === "PENDING" &&
            (test.status === "GENERATED" || test.status === "PROCESADO"))
        }
      >
        {saving ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <CheckCircle2 className="size-4" />
        )}
        {viewMode === "PENDING" ? t("test.finalize") : "Guardar"}
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="size-9 rounded-xl border-border/70 bg-card/45 shadow-sm hover:bg-accent/70"
            disabled={deleting}
          >
            {deleting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar registro</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente este{" "}
              {viewMode === "PENDING" ? "registro" : "protocolo"} y toda su
              información asociada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
