import { FileText, Wrench } from "lucide-react";

import { BankSelect } from "@/components/supervisor/BankSelect";
import type { UseLanguageReturn } from "@/lib/language-context";
import { cn } from "@/lib/utils";

import { CleanAutoInput } from "./CleanAutoInput";
import { DetailSectionCard } from "./DetailSectionCard";

interface GeneralInfoSectionProps {
  generalInfo: {
    pedido: string;
    cliente: string;
    fecha?: string;
    numeroBombas: number;
  };
  bancoId?: number | null;
  onBankChange?: (bankId: number) => void;
  t: UseLanguageReturn["t"];
  onDataChange?: (field: string, value: string) => void;
  allFieldsEditable?: boolean;
  showQty?: boolean;
  isPending?: boolean;
  /** e.g. `h-full min-h-0` when paired in a grid row */
  className?: string;
}

/** Fecha ISO o texto libre → lectura corta en locale */
function formatGeneralDate(raw?: string): string {
  if (!raw?.trim()) {
    return new Date().toLocaleString("es-ES", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }
  const ms = Date.parse(raw);
  if (Number.isNaN(ms)) return raw;
  return new Date(ms).toLocaleString("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

/**
 * Responsive columns (never 5 in one row): avoids truncated inputs on wide screens.
 * 5 fields → 3 + 2; 4 → 2×2; 3 → up to 3 columns from `md`.
 */
function generalInfoGridClass(fieldCount: number): string {
  const base = "grid gap-3";
  if (fieldCount <= 1) {
    return `${base} grid-cols-1`;
  }
  if (fieldCount === 2) {
    return `${base} grid-cols-1 sm:grid-cols-2`;
  }
  if (fieldCount === 3) {
    return `${base} grid-cols-1 sm:grid-cols-2 md:grid-cols-3`;
  }
  if (fieldCount === 4) {
    return `${base} grid-cols-1 sm:grid-cols-2`;
  }
  return `${base} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`;
}

function InfoField({
  label,
  value,
  highlight,
  className = "",
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`min-w-0 rounded-lg border border-border/60 bg-muted/5 px-3 py-2.5 dark:bg-muted/15 ${className}`}
    >
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p
        className={`min-w-0 break-words text-sm font-medium leading-snug ${highlight ? "font-mono text-primary" : "text-foreground"}`}
      >
        {value}
      </p>
    </div>
  );
}

export function GeneralInfoSection({
  generalInfo,
  bancoId,
  onBankChange,
  t,
  onDataChange,
  allFieldsEditable = false,
  showQty = true,
  className,
}: GeneralInfoSectionProps) {
  if (allFieldsEditable && onDataChange) {
    const fieldCount =
      3 + (showQty ? 1 : 0) + (onBankChange ? 1 : 0);

    return (
      <DetailSectionCard
        title={t("test.generalInfo")}
        icon={<FileText className="size-5" />}
        className={className}
        contentClassName="space-y-0"
      >
        <div className={cn("min-w-0", generalInfoGridClass(fieldCount))}>
          <CleanAutoInput
            label={t("field.order")}
            value={generalInfo.pedido}
            onChange={(value) => onDataChange("pedido", value)}
            className="h-10 text-sm font-mono"
            containerClassName="w-full min-w-0"
            minWidth={140}
            fullWidth
          />
          <CleanAutoInput
            label={t("field.client")}
            value={generalInfo.cliente}
            onChange={(value) => onDataChange("cliente", value)}
            className="h-10 text-sm font-mono"
            containerClassName="w-full min-w-0"
            minWidth={200}
            fullWidth
          />
          <CleanAutoInput
            label={t("field.date")}
            value={
              generalInfo.fecha ||
              new Date().toLocaleDateString("es-ES")
            }
            onChange={(value) => onDataChange("fecha", value)}
            className="h-10 text-sm font-mono"
            containerClassName="w-full min-w-0"
            minWidth={160}
            fullWidth
          />
          {showQty ? (
            <CleanAutoInput
              label={t("field.qty")}
              value={String(generalInfo.numeroBombas)}
              onChange={(value) => onDataChange("numeroBombas", value)}
              className="h-10 text-center text-sm font-mono"
              containerClassName="w-full min-w-0"
              minWidth={100}
              fullWidth
            />
          ) : null}
          {onBankChange ? (
            <div className="flex min-w-0 w-full flex-col gap-2">
              <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <Wrench className="size-3.5 shrink-0 text-primary/70" />
                Bomba
              </label>
              <BankSelect
                currentBankId={bancoId ?? null}
                onBankChange={onBankChange}
                placeholder="Selec. bomba"
                className="h-10 text-sm"
              />
            </div>
          ) : null}
        </div>
      </DetailSectionCard>
    );
  }

  const readOnlyFieldCount =
    3 +
    (showQty ? 1 : 0) +
    (bancoId !== null && bancoId !== undefined ? 1 : 0);

  return (
    <DetailSectionCard
      title={t("test.generalInfo")}
      icon={<FileText className="size-5" />}
      className={className}
      contentClassName="space-y-0"
    >
      <div className={cn("min-w-0", generalInfoGridClass(readOnlyFieldCount))}>
        <InfoField
          label={t("field.order")}
          value={generalInfo.pedido}
          highlight
        />
        <InfoField label={t("field.client")} value={generalInfo.cliente} />
        <InfoField
          label={t("field.date")}
          value={formatGeneralDate(generalInfo.fecha)}
        />
        {showQty ? (
          <InfoField
            label={t("field.qty")}
            value={String(generalInfo.numeroBombas)}
          />
        ) : null}
        {bancoId !== null && bancoId !== undefined ? (
          <InfoField
            label={t("field.bank") || "Banco"}
            value={`Banco ${bancoId}`}
            className="border-primary/25 bg-primary/[0.06]"
          />
        ) : null}
      </div>
    </DetailSectionCard>
  );
}
