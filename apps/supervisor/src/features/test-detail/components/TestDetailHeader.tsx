/**
 * TestDetailHeader Component
 * 
 * Header with navigation, title, status, and actions.
 * Follows SRP: Single responsibility for header layout.
 */

import { ArrowLeft, CheckCircle2, Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { StatusBadge } from "./StatusBadge";
import type { UseLanguageReturn } from '@/lib/language-context';

interface TestDetailHeaderProps {
  test: {
    status: string;
    generalInfo: {
      pedido: string;
      cliente: string;
    };
  };
  saving: boolean;
  onBack: () => void;
  onSave: () => void;
  t: UseLanguageReturn['t'];
}

export function TestDetailHeader({
  test,
  saving,
  onBack,
  onSave,
  t
}: TestDetailHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-4 py-2 border-b bg-background/50 backdrop-blur-sm shrink-0 gap-2">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-4" />
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 -ml-2 text-muted-foreground hover:text-foreground shrink-0" 
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-3 min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium shrink-0">
            <span>{t("test.tests")}</span>
            <ChevronRight className="w-3 h-3" />
            <span>{test.generalInfo.pedido}</span>
          </div>
          <span className="text-muted-foreground/30 text-lg sm:text-xl font-light">/</span>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground truncate" title={test.generalInfo.cliente}>
            {test.generalInfo.cliente}
          </h1>
        </div>
      </div>
      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
        <StatusBadge status={test.status} />
        <Button
          onClick={onSave}
          disabled={saving || test.status === "SIN_PROCESAR"}
          size="sm"
          className={test.status === "GENERADO" ? "hidden" : "bg-red-600 hover:bg-red-700 text-white shadow-md active:scale-95 transition-all text-xs font-semibold px-4 h-9"}
        >
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
          {t("test.finalize")}
        </Button>
      </div>
    </header>
  );
}
