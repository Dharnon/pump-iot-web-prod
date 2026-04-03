import { FileText, Wrench } from "lucide-react";

import { BankSelect } from "@/components/supervisor/BankSelect";
import type { UseLanguageReturn } from "@/lib/language-context";

import { CleanAutoInput } from "./CleanAutoInput";
import { DetailSectionCard } from "./DetailSectionCard";
import { ResponsiveFieldFlow } from "./ResponsiveFieldFlow";

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
      className={`rounded-lg border border-border/80 bg-background px-3 py-2.5 dark:bg-muted/18 ${className}`}
    >
      <p className="mb-1 text-xs font-medium uppercase tracking-[0.06em] text-foreground/70 dark:text-muted-foreground">
        {label}
      </p>
      <p
        className={`break-words text-sm font-medium ${highlight ? "font-mono text-primary" : "text-foreground"}`}
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
}: GeneralInfoSectionProps) {
  if (allFieldsEditable && onDataChange) {
    return (
      <DetailSectionCard
        title={t("test.generalInfo")}
        icon={<FileText className="size-4" />}
        contentClassName="space-y-4"
      >
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)_minmax(0,0.9fr)]">
          <CleanAutoInput
            label={t("field.order")}
            value={generalInfo.pedido}
            onChange={(value) => onDataChange("pedido", value)}
            className="h-10 text-sm font-mono"
            containerClassName="w-full"
            minWidth={140}
            fullWidth
          />
          <CleanAutoInput
            label={t("field.client")}
            value={generalInfo.cliente}
            onChange={(value) => onDataChange("cliente", value)}
            className="h-10 text-sm font-mono"
            containerClassName="w-full"
            minWidth={220}
            fullWidth
          />
          <CleanAutoInput
            label={t("field.date")}
            value={generalInfo.fecha || new Date().toLocaleDateString("es-ES")}
            onChange={(value) => onDataChange("fecha", value)}
            className="h-10 text-sm font-mono"
            containerClassName="w-full"
            minWidth={130}
            fullWidth
          />
        </div>

        <div
          className={
            onBankChange
              ? "grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)]"
              : "grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,0.8fr)]"
          }
        >
          {showQty ? (
            <CleanAutoInput
              label={t("field.qty")}
              value={String(generalInfo.numeroBombas)}
              onChange={(value) => onDataChange("numeroBombas", value)}
              className="h-10 text-sm font-mono text-center"
              containerClassName="w-full"
              minWidth={90}
              fullWidth
            />
          ) : null}

          {onBankChange ? (
            <div className="flex min-w-0 w-full flex-col gap-2">
              <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.06em] text-foreground/70 dark:text-muted-foreground">
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

  return (
    <DetailSectionCard
      title={t("test.generalInfo")}
      icon={<FileText className="size-4" />}
      contentClassName="space-y-4"
    >
      <div className="grid gap-3 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)_minmax(0,0.9fr)]">
        <InfoField
          label={t("field.order")}
          value={generalInfo.pedido}
          highlight
        />
        <InfoField label={t("field.client")} value={generalInfo.cliente} />
        <InfoField
          label={t("field.date")}
          value={generalInfo.fecha || new Date().toLocaleDateString("es-ES")}
        />
      </div>

      <ResponsiveFieldFlow className="gap-x-3 gap-y-3">
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
            className="border-primary/15 bg-primary/6"
          />
        ) : null}
      </ResponsiveFieldFlow>
    </DetailSectionCard>
  );
}
