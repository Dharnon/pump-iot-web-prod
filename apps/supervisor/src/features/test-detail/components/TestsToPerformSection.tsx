/**
 * TestsToPerformSection Component
 * 
 * Displays and manages the selection of tests to perform.
 * Follows SRP: Only responsible for test selection UI.
 */

import { Activity, Check } from "lucide-react";
import type { TestsToPerform } from "@/lib/schemas";
import type { UseLanguageReturn } from '@/lib/language-context';
import { DetailSectionCard } from "./DetailSectionCard";

interface TestsToPerformSectionProps {
  testsToPerform: TestsToPerform;
  onToggleTest: (key: string) => void;
  t: UseLanguageReturn['t'];
}

const TESTS_TO_PERFORM = [
  { key: 'performanceTest', label: 'Perf. Test' },
  { key: 'npsh', label: 'NPSH' },
  { key: 'vibraciones', label: 'Vibraciones' },
  { key: 'ruido', label: 'Ruido' },
  { key: 'mrt1h', label: 'MRT 1h' },
  { key: 'mrt4h', label: 'MRT 4h' },
  { key: 'homologacion', label: 'Homolog.' },
  { key: 'presenciada', label: 'Presenciada' },
  { key: 'motorDelPedido', label: 'Motor Pedido' },
] as const;

export function TestsToPerformSection({ testsToPerform, onToggleTest, t }: TestsToPerformSectionProps) {
  return (
    <DetailSectionCard
      title={t("test.testsToPerform")}
      icon={<Activity className="size-5" />}
      contentClassName="space-y-0"
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {TESTS_TO_PERFORM.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => onToggleTest(key)}
            className={`flex min-h-10 w-full min-w-0 items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left transition-colors ${
              testsToPerform[key as keyof TestsToPerform]
                ? "border-primary/35 bg-primary/10 text-primary shadow-sm"
                : "border-border/60 bg-muted/5 text-muted-foreground hover:border-border hover:bg-muted/15 dark:bg-muted/10"
            }`}
          >
            <span className="text-[11px] font-semibold uppercase leading-tight tracking-wide">
              {label}
            </span>
            <div
              className={`flex size-3.5 shrink-0 items-center justify-center rounded border transition-colors ${
                testsToPerform[key as keyof TestsToPerform]
                  ? "border-primary bg-primary"
                  : "border-input bg-background"
              }`}
            >
              {testsToPerform[key as keyof TestsToPerform] ? (
                <Check className="size-2 text-primary-foreground" />
              ) : null}
            </div>
          </button>
        ))}
      </div>
    </DetailSectionCard>
  );
}
