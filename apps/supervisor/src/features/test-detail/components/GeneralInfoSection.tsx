/**
 * GeneralInfoSection Component
 * 
 * Displays general test information (order, client, date, etc.)
 * Follows SRP: Only responsible for displaying general information.
 */

import { FileText } from "lucide-react";
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

export function GeneralInfoSection({ generalInfo, t }: GeneralInfoSectionProps) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4" />
          {t("test.generalInfo")}
        </h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <InfoField label={t("field.order")} value={generalInfo.pedido} highlight />
        <InfoField label={t("field.client")} value={generalInfo.cliente} />
        <InfoField label={t("field.clientOrder")} value={generalInfo.pedidoCliente || "-"} />
        <InfoField 
          label={t("field.date")} 
          value={generalInfo.fecha || new Date().toLocaleDateString('es-ES')} 
          className="text-muted-foreground" 
        />
        <InfoField 
          label={t("field.qty")} 
          value={String(generalInfo.numeroBombas)} 
          className="text-muted-foreground" 
        />
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded border">CSV</span>
        </div>
      </div>
    </section>
  );
}
