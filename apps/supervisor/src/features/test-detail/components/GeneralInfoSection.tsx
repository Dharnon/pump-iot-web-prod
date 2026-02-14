/**
 * GeneralInfoSection Component
 * 
 * Displays general test information (order, client, date, etc.)
 * Follows SRP: Only responsible for displaying general information.
 */

import { FileText } from "lucide-react";
import { CleanInput } from "./CleanInput";
import { CleanAutoInput } from "./CleanAutoInput";
import type { UseLanguageReturn } from '@/lib/language-context';

interface GeneralInfoSectionProps {
  generalInfo: {
    pedido: string;
    cliente: string;
    pedidoCliente?: string;
    fecha?: string;
    numeroBombas: number;
  };
  t: UseLanguageReturn['t'];
  onDataChange?: (field: string, value: string) => void;
  allFieldsEditable?: boolean;
}

function InfoField({ label, value, highlight, className = "" }: {
  label: string;
  value: string | number;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
      <p className={`text-sm font-medium ${highlight ? 'text-primary font-mono' : 'text-foreground'} break-words`}>{value}</p>
    </div>
  );
}

export function GeneralInfoSection({ generalInfo, t, onDataChange, allFieldsEditable = false }: GeneralInfoSectionProps) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4" />
          {t("test.generalInfo")}
        </h3>
      </div>
      <div className="flex flex-wrap gap-4 items-start">
        {allFieldsEditable && onDataChange ? (
          <>
            <CleanAutoInput
              label={t("field.order")}
              value={generalInfo.pedido}
              onChange={(val) => onDataChange("pedido", val)}
              className="h-9 text-sm"
              minWidth={140}
            />
            <CleanAutoInput
              label={t("field.client")}
              value={generalInfo.cliente}
              onChange={(val) => onDataChange("cliente", val)}
              className="h-9 text-sm"
              minWidth={200}
            />
            <CleanAutoInput
              label={t("field.clientOrder")}
              value={generalInfo.pedidoCliente || ""}
              onChange={(val) => onDataChange("pedidoCliente", val)}
              className="h-9 text-sm"
              minWidth={140}
            />
            <CleanAutoInput
              label={t("field.date")}
              value={generalInfo.fecha || new Date().toLocaleDateString('es-ES')}
              onChange={(val) => onDataChange("fecha", val)}
              className="h-9 text-sm"
              minWidth={120}
            />
            <CleanAutoInput
              label={t("field.qty")}
              value={String(generalInfo.numeroBombas)}
              onChange={(val) => onDataChange("numeroBombas", val)}
              className="h-9 text-sm w-20 text-center"
              minWidth={60}
            />
            <div className="flex items-center gap-2 pt-6">
              <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded border">CSV</span>
            </div>
          </>
        ) : (
          <>
            <InfoField label={t("field.order")} value={generalInfo.pedido} highlight className="min-w-[120px]" />
            <InfoField label={t("field.client")} value={generalInfo.cliente} className="min-w-[180px]" />
            <InfoField label={t("field.clientOrder")} value={generalInfo.pedidoCliente || "-"} className="min-w-[120px]" />
            <InfoField
              label={t("field.date")}
              value={generalInfo.fecha || new Date().toLocaleDateString('es-ES')}
              className="text-muted-foreground min-w-[100px]"
            />
            <InfoField
              label={t("field.qty")}
              value={String(generalInfo.numeroBombas)}
              className="text-muted-foreground min-w-[60px]"
            />
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded border">CSV</span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
