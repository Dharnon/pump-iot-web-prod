/**
 * GeneralInfoSection Component
 *
 * Displays general test information (order, client, date, etc.)
 * Follows SRP: Only responsible for displaying general information.
 */

import { FileText } from "lucide-react";
import { CleanInput } from "./CleanInput";
import { CleanAutoInput } from "./CleanAutoInput";
import type { UseLanguageReturn } from "@/lib/language-context";

interface GeneralInfoSectionProps {
  generalInfo: {
    pedido: string;
    cliente: string;
    pedidoCliente?: string;
    fecha?: string;
    numeroBombas: number;
  };
  t: UseLanguageReturn["t"];
  onDataChange?: (field: string, value: string) => void;
  allFieldsEditable?: boolean;
  showQty?: boolean;
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
    <div className={className}>
      <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p
        className={`text-xs font-medium ${highlight ? "text-primary font-mono" : "text-foreground"} break-words`}
      >
        {value}
      </p>
    </div>
  );
}

export function GeneralInfoSection({
  generalInfo,
  t,
  onDataChange,
  allFieldsEditable = false,
  showQty = true,
}: GeneralInfoSectionProps) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" />
          {t("test.generalInfo")}
        </h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-3 gap-y-2">
        {allFieldsEditable && onDataChange ? (
          <>
            <CleanAutoInput
              label={t("field.order")}
              value={generalInfo.pedido}
              onChange={(val) => onDataChange("pedido", val)}
              className="h-8 text-xs"
              minWidth={100}
            />
            <CleanAutoInput
              label={t("field.client")}
              value={generalInfo.cliente}
              onChange={(val) => onDataChange("cliente", val)}
              className="h-8 text-xs col-span-1 sm:col-span-2"
              minWidth={150}
            />
            <CleanAutoInput
              label={t("field.clientOrder")}
              value={generalInfo.pedidoCliente || ""}
              onChange={(val) => onDataChange("pedidoCliente", val)}
              className="h-8 text-xs"
              minWidth={100}
            />
            <CleanAutoInput
              label={t("field.date")}
              value={
                generalInfo.fecha || new Date().toLocaleDateString("es-ES")
              }
              onChange={(val) => onDataChange("fecha", val)}
              className="h-8 text-xs"
              minWidth={90}
            />
            {showQty && (
              <CleanAutoInput
                label={t("field.qty")}
                value={String(generalInfo.numeroBombas)}
                onChange={(val) => onDataChange("numeroBombas", val)}
                className="h-8 text-xs w-16 text-center"
                minWidth={50}
              />
            )}
          </>
        ) : (
          <>
            <InfoField
              label={t("field.order")}
              value={generalInfo.pedido}
              highlight
              className="col-span-1"
            />
            <InfoField
              label={t("field.client")}
              value={generalInfo.cliente}
              className="col-span-1 sm:col-span-2"
            />
            <InfoField
              label={t("field.clientOrder")}
              value={generalInfo.pedidoCliente || "-"}
              className="col-span-1"
            />
            <InfoField
              label={t("field.date")}
              value={
                generalInfo.fecha || new Date().toLocaleDateString("es-ES")
              }
              className="col-span-1"
            />
            {showQty && (
              <InfoField
                label={t("field.qty")}
                value={String(generalInfo.numeroBombas)}
                className="col-span-1"
              />
            )}
          </>
        )}
      </div>
    </section>
  );
}
