import { FileText, Wrench } from "lucide-react";
import { CleanInput } from "./CleanInput";
import { CleanAutoInput } from "./CleanAutoInput";
import { BankSelect } from "@/components/supervisor/BankSelect";
import type { UseLanguageReturn } from "@/lib/language-context";

interface GeneralInfoSectionProps {
  generalInfo: {
    pedido: string;
    cliente: string;
    pedidoCliente?: string;
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
  isPending = false,
}: GeneralInfoSectionProps) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" />
          {t("test.generalInfo")}
        </h3>
      </div>
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 items-end">
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
              className="h-8 text-xs col-span-1 md:col-span-2"
              minWidth={160}
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
                minWidth={60}
              />
            )}
            {onBankChange && (
              <div className="space-y-1 col-span-1 min-w-[140px]">
                <label className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Wrench className="w-2.5 h-2.5 text-primary/70" />{" "}
                  {t("field.bank") || "Banco"}
                </label>
                <BankSelect
                  currentBankId={bancoId ?? null}
                  onBankChange={onBankChange}
                  placeholder="Selec. Banco"
                />
              </div>
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
              className="col-span-1 md:col-span-2"
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
            {bancoId !== null && bancoId !== undefined && (
              <InfoField
                label={t("field.bank") || "Banco"}
                value={`Banco ${bancoId}`}
                className="col-span-1 bg-primary/5 p-1 rounded-sm border border-primary/10"
              />
            )}
          </>
        )}
      </div>
    </section>
  );
}
