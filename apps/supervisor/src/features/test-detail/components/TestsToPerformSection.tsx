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
      icon={<Activity className="size-4" />}
      contentClassName="space-y-0"
    >
      <div className="flex flex-wrap gap-2">
        {TESTS_TO_PERFORM.map(({ key, label }) => (
          <div
            key={key}
            onClick={() => onToggleTest(key)}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-md border cursor-pointer transition-all ${
              testsToPerform[key as keyof TestsToPerform]
                ? 'bg-primary/10 border-primary/30 text-primary shadow-sm'
                : 'bg-muted/30 border-border text-muted-foreground hover:border-primary/20'
            }`}
          >
            <span className="mr-2 text-xs font-semibold leading-tight">
              {label}
            </span>
            <div className={`w-3 h-3 rounded-sm border flex items-center justify-center transition-colors ${
              testsToPerform[key as keyof TestsToPerform]
                ? 'bg-primary border-primary'
                : 'border-muted-foreground/30 bg-background'
            }`}>
              {testsToPerform[key as keyof TestsToPerform] && (
                <Check className="w-2 h-2 text-white" />
              )}
            </div>
          </div>
        ))}
      </div>
    </DetailSectionCard>
  );
}
