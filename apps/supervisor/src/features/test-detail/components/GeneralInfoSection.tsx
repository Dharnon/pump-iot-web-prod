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
      <p className="text-sm max-[2048px]:text-xs max-[1600px]:text-[10px] text-muted-foreground uppercase font-bold tracking-tight mb-0.5">
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
  const editableLayoutClass = onBankChange
    ? "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(180px,1.1fr)_minmax(260px,1.7fr)_minmax(150px,0.95fr)_minmax(100px,0.7fr)_minmax(180px,1.15fr)] xl:gap-x-4 xl:gap-y-3"
    : "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(180px,1.1fr)_minmax(260px,1.7fr)_minmax(150px,0.95fr)_minmax(100px,0.7fr)] xl:gap-x-4 xl:gap-y-3";

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm max-[2048px]:text-xs max-[1600px]:text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <FileText className="w-4 h-4" />
          {t("test.generalInfo")}
        </h3>
      </div>

      {allFieldsEditable && onDataChange ? (
        <div className={editableLayoutClass}>
          <CleanAutoInput
            label={t("field.order")}
            value={generalInfo.pedido}
            onChange={(val) => onDataChange("pedido", val)}
            className="h-8 text-xs font-mono"
            containerClassName="w-full"
            minWidth={140}
            fullWidth
          />
          <CleanAutoInput
            label={t("field.client")}
            value={generalInfo.cliente}
            onChange={(val) => onDataChange("cliente", val)}
            className="h-8 text-xs font-mono"
            containerClassName="w-full"
            minWidth={220}
            fullWidth
          />
          <CleanAutoInput
            label={t("field.date")}
            value={generalInfo.fecha || new Date().toLocaleDateString("es-ES")}
            onChange={(val) => onDataChange("fecha", val)}
            className="h-8 text-xs font-mono"
            containerClassName="w-full"
            minWidth={130}
            fullWidth
          />
          {showQty && (
            <CleanAutoInput
              label={t("field.qty")}
              value={String(generalInfo.numeroBombas)}
              onChange={(val) => onDataChange("numeroBombas", val)}
              className="h-8 text-xs font-mono text-center"
              containerClassName="w-full"
              minWidth={90}
              fullWidth
            />
          )}
          {onBankChange && (
            <div className="flex w-full flex-col gap-1.5 max-[2048px]:gap-0.75 max-[1600px]:gap-0.5">
              <label className="text-sm max-[2048px]:text-xs max-[1600px]:text-[10px] uppercase font-bold tracking-tight leading-none text-muted-foreground flex items-center gap-1">
                <Wrench className="w-3 h-3 text-primary/70" />
                BOMBA
              </label>
              <BankSelect
                currentBankId={bancoId ?? null}
                onBankChange={onBankChange}
                placeholder="Selec. Bomba"
                className="h-8 text-xs"
              />
            </div>
          )}
        </div>
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
