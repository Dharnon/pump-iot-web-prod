import { FileText, Wrench } from "lucide-react";
import { CleanAutoInput } from "./CleanAutoInput";
import { ResponsiveFieldFlow } from "./ResponsiveFieldFlow";
import { BankSelect } from "@/components/supervisor/BankSelect";
import type { UseLanguageReturn } from "@/lib/language-context";

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
  bancoId,
  onBankChange,
  t,
  onDataChange,
  allFieldsEditable = false,
  showQty = true,
}: GeneralInfoSectionProps) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" />
          {t("test.generalInfo")}
        </h3>
      </div>

      {allFieldsEditable && onDataChange ? (
        <ResponsiveFieldFlow>
          <CleanAutoInput
            label={t("field.order")}
            value={generalInfo.pedido}
            onChange={(val) => onDataChange("pedido", val)}
            className="h-8 text-xs font-mono"
            minWidth={120}
          />
          <CleanAutoInput
            label={t("field.client")}
            value={generalInfo.cliente}
            onChange={(val) => onDataChange("cliente", val)}
            className="h-8 text-xs font-mono"
            minWidth={240}
          />
          <CleanAutoInput
            label={t("field.date")}
            value={generalInfo.fecha || new Date().toLocaleDateString("es-ES")}
            onChange={(val) => onDataChange("fecha", val)}
            className="h-8 text-xs font-mono"
            minWidth={125}
          />
          {showQty && (
            <CleanAutoInput
              label={t("field.qty")}
              value={String(generalInfo.numeroBombas)}
              onChange={(val) => onDataChange("numeroBombas", val)}
              className="h-8 text-xs font-mono text-center"
              minWidth={85}
            />
          )}
          {onBankChange && (
            <div className="flex flex-col gap-1.5 max-[2048px]:gap-0.75 max-[1600px]:gap-0.5 min-w-[140px]">
              <label className="text-[10px] max-[2048px]:text-[8px] max-[1600px]:text-[7px] uppercase font-bold tracking-tight leading-none text-muted-foreground flex items-center gap-1">
                <Wrench className="w-2.5 h-2.5 text-primary/70" />
                {t("field.bank") || "Banco"}
              </label>
              <BankSelect
                currentBankId={bancoId ?? null}
                onBankChange={onBankChange}
                placeholder="Selec. Banco"
              />
            </div>
          )}
        </ResponsiveFieldFlow>
      ) : (
        <ResponsiveFieldFlow className="gap-x-6 gap-y-2">
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
          {showQty && (
            <InfoField
              label={t("field.qty")}
              value={String(generalInfo.numeroBombas)}
            />
          )}
          {bancoId !== null && bancoId !== undefined && (
            <InfoField
              label={t("field.bank") || "Banco"}
              value={`Banco ${bancoId}`}
              className="bg-primary/5 px-2 py-1 rounded-sm border border-primary/10"
            />
          )}
        </ResponsiveFieldFlow>
      )}
    </section>
  );
}
