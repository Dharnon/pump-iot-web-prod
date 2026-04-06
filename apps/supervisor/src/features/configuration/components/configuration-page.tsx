"use client";

import type { ReactNode } from "react";

import { WorkspaceSurface } from "@/components/workspace/workspace-surface";

import type { ConfigurationTab } from "./configuration-toolbar";
import { ConfigurationHeaderRegistration } from "./configuration-header-registration";
import { ConfigurationMetrics } from "./configuration-metrics";
import { ConfigurationToolbar } from "./configuration-toolbar";

export function ConfigurationPage({
  activeTab,
  onActiveTabChange,
  searchValue,
  onSearchValueChange,
  onCreate,
  banksWithMotorCount,
  banksInactiveCount,
  activeBanks,
  banksWithoutMotor,
  motorTemplates,
  table,
  dialogs,
}: {
  activeTab: ConfigurationTab;
  onActiveTabChange: (value: ConfigurationTab) => void;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  onCreate: () => void;
  banksWithMotorCount: number;
  banksInactiveCount: number;
  activeBanks: number;
  banksWithoutMotor: number;
  motorTemplates: number;
  table: ReactNode;
  dialogs?: ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--supervisor-page-background)]">
      <div className="scrollbar-surface flex flex-1 flex-col gap-4 overflow-auto p-4">
        <ConfigurationHeaderRegistration activeTab={activeTab} />

        <ConfigurationMetrics
          activeBanks={activeBanks}
          banksWithoutMotor={banksWithoutMotor}
          motorTemplates={motorTemplates}
          banksUsingMotorTemplate={banksWithMotorCount}
        />

        <WorkspaceSurface className="min-h-0 flex-1 flex-col gap-3">
          <ConfigurationToolbar
            activeTab={activeTab}
            onActiveTabChange={onActiveTabChange}
            searchValue={searchValue}
            onSearchValueChange={onSearchValueChange}
            onCreate={onCreate}
          />

          <div className="flex min-h-0 min-w-0 flex-1 flex-col">{table}</div>
        </WorkspaceSurface>
      </div>

      {dialogs}
    </div>
  );
}
